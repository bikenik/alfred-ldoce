const alfy = require('alfy')
// const ankiDecks = require('./anki-connect')
// const {ankiDecks} = require('./anki-connect')

module.exports = {
	wordOfURL: alfy.config.get('wordOfURL')
}

module.exports.capitalize = x =>
	x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase()

module.exports.hasOwnProperty = (obj, prop) =>
	Object.prototype.hasOwnProperty.call(obj, prop)

// module.exports.nameOfDecks =
