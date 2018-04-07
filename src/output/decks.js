const alfy = require('alfy')
const ankiConnect = require('../anki-connect')
// const {nameOfDecks} = require('../utils')
module.exports = (pattern, autocomplete = () => undefined) => {
	if (!pattern) {
		pattern = ''
	}
	// resultDecks = nameOfDecks()
	const outresult = async function () {
		try {
			const resultAll = await ankiConnect('deckNames', 5)
			const out = alfy.matches(pattern, resultAll)
				.map(name => ({
					// title: name,
					title: name.slice(0, 1).toUpperCase() + name.slice(1),
					autocomplete: autocomplete(name),
					valid: false,
					icon: {
						path: `./icons/deck.png`
						// path: `icons/${languages.getCode(name)}.png`
					}
				}))
			return out
		} catch (err) {
			// console.log(`error getting decks: ${err}`)
		}
	}
	return (async () => await outresult())()
}
