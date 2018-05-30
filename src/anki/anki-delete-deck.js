/* eslint-disable camelcase */
const ankiConnect = require('./anki-connect')

const {config_value} = process.env
const deletDeck = async () => {
	try {
		const result = await ankiConnect(
			'deleteDecks', 5,
			{
				decks: [config_value],
				cardsToo: true
			}
		)
		return result
	} catch (err) {
		// "process.stdout.write(err)"
		return err
	}
}
deletDeck()
