const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const ankiConnect = require('./anki-connect')
const {capitalize} = require('../utils')
// const {nameOfDecks} = require('../utils')
module.exports = () => {
	// module.exports = (pattern, autocomplete = () => undefined) => {
	// resultDecks = nameOfDecks()
	const outresult = async function () {
		try {
			let resultAll = await ankiConnect('deckNames', 5)
			// console.log('HELLO FROM ANKI');
			return resultAll

		} catch (err) {
			throw new WorkflowError(`AnkiConnect doesn,t work now`, {
				autocomplete: '!set '
			})
		}
	}
	return outresult()
}

module.exports.render = async (pattern, autocomplete = () => undefined, ankiDecks) => {
	if (!pattern) {
		pattern = ''
	}
	const out = await alfy.matches(pattern, ankiDecks)
		.map(name => ({
			title: name.slice(0, 1).toUpperCase() + name.slice(1),
			autocomplete: autocomplete(name),
			valid: false,
			icon: {
				path: `./icons/deck.png`
			}
		}))
	// return out.length === 0 ? null : out
	if (out.length === 0) {
		out.push({
			// title: `'${alfy.input}'`,
			title: `Set default Deck to '${capitalize(pattern)}'`,
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
