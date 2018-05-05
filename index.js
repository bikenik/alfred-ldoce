'use strict'
const jsonfile = require('jsonfile')
const alfredNotifier = require('alfred-notifier')
const alfy = require('alfy')
const WorkflowError = require('./src/utils/error')
const {errorAction} = require('./src/utils/error')
const set = require('./src/cmd/set')
const del = require('./src/cmd/del')
const decks = require('./src/anki/anki-decks')
const api = require('./src/api/index')

alfredNotifier()

const myVar = process.argv[3]
let query
let introMessage = [{
	subtitle: `Current deck is ⇒ ${alfy.config.get('default-deck')}`
}]

if (myVar === 'headword') {
	query = {
		headword: `${alfy.input}`,
		limit: 50
	}
	introMessage[0].title = 'Search headwords ...'
}
if (myVar === 'search') {
	query = {
		search: `${alfy.input}`,
		limit: 50
	}
	introMessage[0].title = 'Search generic ...'
}

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
		const options = commands.map(command => ({
			title: command.meta.name,
			subtitle: `${command.meta.help} | Usage: ${command.meta.usage}`,
			autocomplete: command.meta.autocomplete,
			text: {
				largetype: `${command.meta.help} | Usage: ${command.meta.usage}`
			},
			valid: false
		}))
		return alfy.inputMatches(options, 'title')
	}

	if (input === '') {
		const ankiDecks = await decks()
		if (ankiDecks === null) {
			throw new WorkflowError(`Decks was not found, check your Anki profile`, errorAction('profile'))
		}
		jsonfile.writeFile(fileAnkiDecks, ankiDecks, {
			spaces: 2
		}, function (err) {
			if (err !== null) {
				console.log(err)
			}
		})
		return introMessage
	}
}

(async () => {
	try {
		let out = await option(alfy.input)
		if (out || /!.*/.test(alfy.input)) {
			alfy.output(out)
		} else {
			api.fetching(query)
		}
	} catch (err) {
		const messages = []

		if (err.tip) {
			messages.push(err.tip)
		}

		messages.push('Activate this item to try again.')
		messages.push('⌘L to see the stack trace')

		alfy.output([{
			title: err.title ? err.title : `Error: ${err.message}`,
			subtitle: err.subtitle ? err.subtitle : messages.join(' | '),
			autocomplete: err.autocomplete ? err.autocomplete : '',
			icon: err.icon ? err.icon : {path: alfy.icon.error},
			valid: err.valid ? err.valid : false,
			variables: err.variables ? err.variables : {variables: {}},
			text: {
				largetype: err.stack,
				copy: err.stack
			},
			mods: err.mods ? err.mods : {mods: {}}
		}])
	}
})()
