const ankiConnect = require('./anki-connect')

const deletDeck = async () => {
	try {
		const result = await ankiConnect(
			'deleteDecks', 5,
			{
				decks: [process.argv[2]],
				cardsToo: true
			}
		)
		return result
		// "process.stdout.write(result)"
	} catch (err) {
		// "process.stdout.write(err)"
	}
}
deletDeck()
