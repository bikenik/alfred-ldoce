/* eslint-disable camelcase */
const alfy = require('alfy')

const WorkflowError = require('../utils/error')
const {errorAction} = require('../utils/error')
const {capitalize} = require('../utils')
const ankiConnect = require('./anki-connect')

const {note_type} = process.env
module.exports = () => {
	const outresult = async function () {
		try {
			alfy.cache.set('validOutput', 'true')
			const resultAll = await ankiConnect('deckNames', 6)
			return resultAll
		} catch (err) {
			alfy.cache.set('validOutput', 'false')
			throw new WorkflowError(`${err}`, errorAction('main'))
		}
	}
	return outresult()
}

module.exports.modelExist = () => {
	const outresult = async function () {
		try {
			alfy.cache.set('validOutput', 'true')
			const resultAll = await ankiConnect('modelFieldNames', 6, {modelName: note_type})
			return resultAll
		} catch (err) {
			alfy.cache.set('validOutput', 'false')
			throw new WorkflowError(`${err}`, err === 'failed to connect to AnkiConnect' ? errorAction('main') : err === 'collection is not available' ? errorAction('profile') : /model was not found/.test(err) ? errorAction('modelExist') : errorAction('main'))
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
