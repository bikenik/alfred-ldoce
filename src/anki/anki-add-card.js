/* eslint-disable no-unused-vars */
const alfy = require('alfy')
const ankiConnect = require('./anki-connect')

// const nameOfDeck = 'Scramble'
const nameOfDeck = alfy.config.get('default-deck')

// console.log(JSON.stringify(obj))
let logResult = {
	error: [],
	result: []
}

module.exports = async function (output) {
	for (let i = 0; i < output.length; i++) {
		if (output[i].Homnum) {
			output[i].Homnum = output[i].Homnum.toString()
			output[i].Headword = `${output[i].Headword}<span class="HOMNUM-title">${
				output[i].Homnum
				}
    </span>`
		}
		delete output[i].Inflections // Can't understood the reason of error without delete
		if (output[i].Definition !== 'notfound' && output[i].Definition !== '') {
			try {
				const result1 = await ankiConnect(
					'createDeck', 5,
					{
						deck: nameOfDeck
					})
				// alfy.log(`got ID of deck: ${result1}`)
				// logResult.result.push(result1)
			} catch (err) {
				// process.stdout.write(`!err: ${err}`)
				logResult.error.push(err)
			}
			try {
				const result2 = await ankiConnect(
					'addNote', 5,
					{
						note: {
							deckName: nameOfDeck,
							modelName: 'Ldoce-Express',
							fields: output[i],
							tags: [output[i].Tag]
						}
					})
				// process.stdout.write(`got ID of note:: ${result2}`)
				logResult.result.push(`\n${nameOfDeck}: ${result2}`)
			} catch (err) {
				// process.stdout.write(`!err: ${err}`)
				logResult.error.push(err)
			}
		}
	}
	if (logResult.error.length > 0) {
		logResult.error.forEach(error => {
			process.stdout.write(`!err: ${error}`)
		})
	} else {
		logResult.result.forEach(result => {
			process.stdout.write(result)
		})
	}
}
