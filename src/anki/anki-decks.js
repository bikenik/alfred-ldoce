const alfy = require('alfy')

const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const {capitalize} = require('../utils')
const ankiConnect = require('./anki-connect')

module.exports = () => {
	const outresult = async function () {
		try {
			const resultAll = await ankiConnect('deckNames', 5)
			return resultAll
		} catch (err) {
			throw new WorkflowError(`${err}`, errorAction('main'))
		}
	}
	return outresult()
}

module.exports.render = async (pattern = '', autocomplete = () => undefined, ankiDecks, cmdIcon) => {
	const out = await alfy.matches(pattern, Object.getOwnPropertyNames(ankiDecks).sort())
		.map(name => ({
			title: name,
			subtitle: ankiDecks[name],
			autocomplete: autocomplete(name),
			valid: false,
			icon: {
				path: cmdIcon
			}
		}))
	if (out.length === 0) {
		out.push({
			title: `Create new Deck as '${capitalize(pattern)}'`,
			subtitle: `Old value ⇒ ${alfy.config.get('default-deck')}`,
			valid: true,
			arg: JSON.stringify({
				alfredworkflow: {
					variables: {
						action: 'set',
						/* eslint-disable camelcase */
						config_variable: 'default-deck',
						config_value: capitalize(pattern)
						/* eslint-enable camelcase */
					}
				}
			})
		})
		return out
	}
	return out
}
