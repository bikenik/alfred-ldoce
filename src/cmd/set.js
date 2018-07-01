/* eslint-disable capitalized-comments */

const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const {hasOwnProperty} = require('../utils')
const config = require('../config')
const decks = require('../anki/anki-decks')
const ankiCards = require('../input/anki-cards.json')

const variables = {
	'default-deck': {
		default: 'English',
		outputOptions: decks
	}
}

// Output matching for config variables
const outputVariables = pattern => {
	if (!pattern) {
		pattern = ''
	}

	const vars = Object.keys(config.decks.defaults)

	const mapper = key => ({
		title: `${key} ⇒ ${
			alfy.config.get(key) === undefined ? config.decks.defaults['default-deck'] : alfy.config.get(key)}`,
		subtitle: `↵ pick out another ...`,
		valid: false,
		autocomplete: `!set ${key} `,
		icon: {path: `./icons/settings.png`}
	})

	const out = alfy.matches(pattern, Object.keys(config.decks.defaults)).map(mapper)

	return out.length === 0 ? vars.map(mapper) : out
}

module.exports = input => {
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
	const arrayOfDecks = ankiCards

	if (chunks.length >= 3) {
		return (async () => {
			if (await decks() === null) {
				throw new WorkflowError(`Decks was not found, check your Anki profile`, errorAction('!set decks'))
			}
			if (Object.getOwnPropertyNames(arrayOfDecks).indexOf(value) === -1) {
				return variable.outputOptions.render(
					value.replace(/([a-zA-Z])\s([a-zA-Z])/, `$1-$2`),
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
							action: 'set',
							/* eslint-disable camelcase */
							config_variable: variableName,
							config_value: value
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
	autocomplete: '!set ',
	icon: {path: `./icons/settings.png`}
}

module.exports.match = input => {
	return input.indexOf('!set') === 0
}
