const alfy = require('alfy')
const Conf = require('conf')

module.exports = {
	wordOfURL: alfy.config.get('wordOfURL')
}

module.exports.capitalize = x =>
	x.charAt(0).toUpperCase() + x.slice(1)

module.exports.hasOwnProperty = (obj, prop) =>
	Object.prototype.hasOwnProperty.call(obj, prop)

module.exports.envRefresh = list => {
	const config = new Conf()
	Object.keys(list)
		.filter(x => !config.has(x) && list[x] !== null)
		.forEach(x => {
			config.set(x, list[x])
		})
}
