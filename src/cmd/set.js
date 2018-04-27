const alfy = require('alfy')
const WorkflowError = require('../utils/error')
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
		// subtitle: '⇒ hello world',
		subtitle: '⇒ ' + alfy.config.get(key),
		valid: false,
		autocomplete: `!set ${key} `
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
			autocomplete: '!set '
		})
	}
	const variable = variables[variableName]
	const value = chunks.slice(2).join(' ')

	if (chunks.length >= 3) {
		return (async () => {
			if (!await decks()) {
				// if (arrayOfDecks === null) {
				throw new WorkflowError(`Decks was not found, check your Anki profile`, {
					autocomplete: '!set ',
					variables: {
						run: 'anki'
					},
					valid: true,
					icon: {
						path: './icons/not-connected.png'
					}
				})
			}
			if (arrayOfDecks.indexOf(value) === -1) {
				return variable.outputOptions.render(
					value,
					name => `!set ${variableName} ${name}`,
					arrayOfDecks,
					`./icons/deck.png`
				)
			}
			return [{
				title: `Set ${variableName} to '${value}'`,
				subtitle: `Old value ⇒ ${alfy.config.get(variableName)}`,
				valid: true,
				arg: JSON.stringify({
					alfredworkflow: {
						variables: {
							action: 'config',
							/* eslint-disable camelcase */
							config_variable: variableName,
							config_value: value
							// config_value: variable.prettify(value)
							/* eslint-enable camelcase */
						}
					}
				})
			}]
		})()
	}
}

module.exports.meta = {
	name: '!set',
	usage: '!set to another deck',
	help: 'Create deck by the given value or new value.',
	autocomplete: '!set '
}

module.exports.match = input => {
	return input.indexOf('!set') === 0
}
