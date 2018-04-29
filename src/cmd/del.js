const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const config = require('../config')
const decks = require('../anki/anki-decks')
const {capitalize, hasOwnProperty} = require('../utils')
const arrayOfDecks = require('../input/anki-decks.json')

const variables = {
	'default-deck': {
		default: 'English',
		outputOptions: decks,
		prettify: input => capitalize(input)
	}
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) {
		pattern = ''
	}

	const vars = Object.keys(config.defaults)

	const mapper = key => ({
		title: key,
		subtitle: '⇒ ' + alfy.config.get(key),
		valid: false,
		autocomplete: `!del ${key} `
	})

	const out = alfy.matches(pattern, Object.keys(config.defaults)).map(mapper)

	return out.length === 0 ? vars.map(mapper) : out
}

module.exports = input => {
	// !set command value
	// Value can include spaces

	if (typeof input !== 'string') {
		throw new TypeError('input should be a string')
	}

	const chunks = input.split(' ')

	if (chunks.length === 1) {
		return outputVariables()
	}

	if (chunks.length === 2) {
		return outputVariables(chunks[1])
	}

	// eslint-disable-next-line prefer-destructuring
	const variableName = chunks[1]

	// Throw if variable is invalid
	if (!hasOwnProperty(variables, variableName)) {
		throw new WorkflowError(`Variable '${variableName}' does not exist`, {
			autocomplete: '!del '
		})
	}
	const variable = variables[variableName]
	const value = chunks.slice(2).join(' ')

	if (chunks.length >= 3) {
		return (async () => {
			if (await decks() === null) {
				throw new WorkflowError(`Decks was not found, check your Anki profile`, errorAction('!del decks'))
			}
			if (arrayOfDecks.indexOf(value) === -1) {
				return variable.outputOptions.render(
					value,
					name => `!del ${variableName} ${name}`,
					arrayOfDecks,
					`./icons/deck-red.png`
				)
			}
			return [{
				title: `The deck [${value}] will be deleted`,
				subtitle: `All cards in this deck will be deleted. Are you sure?`,
				valid: true,
				arg: JSON.stringify({
					alfredworkflow: {
						variables: {
							action: 'del',
							/* eslint-disable camelcase */
							config_variable: variableName,
							config_value: value
						}
					}
				}),
				icon: {
					path: './icons/warning.png'
				}
			}]
		})()
	}
}

module.exports.meta = {
	name: '!del',
	usage: '!delete any your deck',
	help: 'Delete deck by the given value.',
	autocomplete: '!del '
}

module.exports.match = input => {
	return input.indexOf('!del') === 0
}
