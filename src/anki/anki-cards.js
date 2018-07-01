/* eslint-disable capitalized-comments */

const ankiConnect = require('./anki-connect')

module.exports.cards = async decks => {
	const ankiCards = []
	try {
		/* eslint-disable no-await-in-loop */
		for (const deck of decks) {
			ankiCards.push(await ankiConnect('findCards', 6,
				{query: `"deck:${deck}"`})
			)
		}
		/* eslint-enable no-await-in-loop */
	} catch (err) {
		return err
	}
	return ankiCards
}
module.exports.areDue = async cards => {
	try {
		const ankiCards = await ankiConnect('areDue', 6,
			{cards})
		return ankiCards
	} catch (err) {
		return err
	}
}
module.exports.areSuspend = async cards => {
	try {
		const ankiCards = await ankiConnect('areSuspended', 6,
			{cards})
		return ankiCards
	} catch (err) {
		return err
	}
}
