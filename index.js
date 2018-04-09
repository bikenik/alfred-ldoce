'use strict'
const alfredNotifier = require('alfred-notifier')
const alfy = require('alfy')
// const utils = require('./src/utils')
const set = require('./src/cmd/set')
// const WorkflowError = require('./src/utils/error')
const decks = require('./src/anki/anki-decks')
const api = require('./src/api/index')

alfredNotifier()

// alfy.input = '!set default-deck bobobo'
// alfy.input = '!set default-deck '

const commands = [set]
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
	if (input === '') {
		await decks()
		return [{
			title: 'Search headwords => ',
			subtitle: `Current deck is => ${alfy.config.get('default-deck')}`
		}]
	}
}

(async () => {
	let out = await option(alfy.input)
	let reg = /!.*to(.*)/
	if (out || /!.*/.test(alfy.input)) {
		alfy.output(out)
	} else {
		api.fetching()
	}
})()
