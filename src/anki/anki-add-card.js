/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const alfy = require('alfy')
const ankiConnect = require('./anki-connect')

const nameOfDeck = alfy.config.get('default-deck')
const {note_type} = process.env

const logResult = {
	error: [],
	result: []
}

module.exports = async function (output) {
	/* eslint-disable no-await-in-loop */
	for (let i = 0; i < output.length; i++) {
		if (output[i].Homnum) {
			output[i].Homnum = output[i].Homnum.toString()
			output[i].Headword = `${output[i].Headword}<span class="HOMNUM-title">${
				output[i].Homnum}
    </span>`
		}
		delete output[i].Inflections // Can't understood the reason of error without delete
		if (output[i].Definition !== 'notfound' && output[i].Definition !== '') {
			try {
				const result1 = await ankiConnect(
					'createDeck', 6,
					{
						deck: nameOfDeck
					})
			} catch (err) {
				logResult.error.push(err)
			}
			try {
				const result2 = await ankiConnect(
					'addNote', 6,
					{
						note: {
							deckName: nameOfDeck,
							modelName: note_type,
							fields: output[i],
							tags: [output[i].Tag]
						}
					})
				logResult.result.push(`\n${nameOfDeck}: ${result2}`)
			} catch (err) {
				logResult.error.push(err)
			}
		}
	}
	/* eslint-enable no-await-in-loop */
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
