const ankiConnect = require('./anki-connect')

// const currentDeck = 'New deck 2'
module.exports = async currentDeck => {
	try {
		let result = await ankiConnect(
			'deleteDecks', 5,
			{
				decks: [currentDeck],
				cardsToo: true
			}
		)
		return result
		// process.stdout.write(result)
	} catch (err) {
		// process.stdout.write(err)
	}
}
