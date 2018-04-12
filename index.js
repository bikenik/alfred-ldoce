'use strict'
const jsonfile = require('jsonfile')
const alfredNotifier = require('alfred-notifier')
const alfy = require('alfy')
// const utils = require('./src/utils')
const set = require('./src/cmd/set')
const del = require('./src/cmd/del')
const decks = require('./src/anki/anki-decks')
const api = require('./src/api/index')
// const deleteDeck = require('./src/anki/anki-delete-deck')

alfredNotifier()

const myVar = process.argv[3]
let query
let introMessage = [{
	subtitle: `Current deck is => ${alfy.config.get('default-deck')}`
}]
// const myVar = 'headword'
// alfy.input = '!set default-deck '

if (myVar === 'headword') {
	query = {
		headword: `=${alfy.input}`,
		limit: 50
	}
	introMessage[0].title = 'Search headwords ...'
}
if (myVar === 'search') {
	query = {
		search: `=${alfy.input}`,
		limit: 50
	}
	introMessage[0].title = 'Search generic ...'
}

// alfy.input = '!set default-deck New deck 2'
// alfy.input = '!set default-deck '
// alfy.input = 'color'
const fileAnkiDecks = './src/input/anki-decks.json'
const commands = [set, del]
const option = async input => {
	for (const command of commands) {
		if (command.match(input)) {
			return command(input)
		}
	}

	// No matches, show all commands
	if (/!.*/.test(input)) {
		return commands.map(command => ({
			title: command.meta.name,
			subtitle: `${command.meta.help} | Usage: ${command.meta.usage}`,
			autocomplete: command.meta.autocomplete,
			text: {
				largetype: `${command.meta.help} | Usage: ${command.meta.usage}`
			},
			valid: false
		}))
	}

	let logResult = {
		error: [],
		result: []
	}
	if (input === '') {
		// await decks()
		const ankiDecks = await decks()
		jsonfile.writeFile(fileAnkiDecks, ankiDecks, {
			spaces: 2
		}, function (err) {
			logResult.error.push(err)
		})
		return introMessage
	}
}

(async () => {
	let out = await option(alfy.input)
	if (out || /!.*/.test(alfy.input)) {
		alfy.output(out)
	} else {
		api.fetching(query)
	}
})()
