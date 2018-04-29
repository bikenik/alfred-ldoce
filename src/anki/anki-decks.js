const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const {capitalize} = require('../utils')
const ankiConnect = require('./anki-connect')

module.exports = () => {
	const outresult = async function () {
		try {
			let resultAll = await ankiConnect('deckNames', 5)
			return resultAll
		} catch (err) {
			throw new WorkflowError(`${err}`, errorAction('main'))
		}
	}
	return outresult()
}

module.exports.render = async (pattern, autocomplete = () => undefined, ankiDecks, cmdIcon) => {
	if (!pattern) {
		pattern = ''
	}
	const out = await alfy.matches(pattern, ankiDecks)
		.map(name => ({
			title: name,
			autocomplete: autocomplete(name),
			valid: false,
			icon: {
				path: cmdIcon
			}
		}))
	if (out.length === 0) {
		out.push({
			title: `a new deck will be created as '${capitalize(pattern)}'`,
			subtitle: `Old value ⇒ ${alfy.config.get('default-deck')}`,
			valid: true,
			arg: JSON.stringify({
				alfredworkflow: {
					variables: {
						action: 'config',
						/* eslint-disable camelcase */
						config_variable: 'default-deck',
						config_value: capitalize(pattern)
						// config_value: variable.prettify(value)
						/* eslint-enable camelcase */
					}
				}
			})
		})
		return out
	}
	return out
}
