'use strict'
const fs = require('fs-extra')
const jsonfile = require('jsonfile')
const alfy = require('alfy')
const runApplescript = require('run-applescript')
const Conf = require('conf')
const WorkflowError = require('./src/utils/error')
const {errorAction} = require('./src/utils/error')
const set = require('./src/cmd/set')
const del = require('./src/cmd/del')
const refresh = require('./src/cmd/refresh')
const theme = require('./src/cmd/theme')
const decks = require('./src/anki/anki-decks')
const {modelExist} = require('./src/anki/anki-decks')
const api = require('./src/api')

const config = new Conf()
config.clear()

/* eslint-disable prefer-destructuring */
const myVar = process.argv[3]
/* eslint-enable prefer-destructuring */

let query
const introMessage = [{
	subtitle: `Current deck is ⇒ ${alfy.config.get('default-deck')}`
}]

if (myVar === 'headword') {
	query = {
		headword: `${alfy.input}`,
		limit: 50
	}
	introMessage[0].title = 'Search headwords ...'
	introMessage[0].icon = {path: './icons/anki.png'}
}
if (myVar === 'search') {
	query = {
		search: `${alfy.input}`,
		limit: 50
	}
	introMessage[0].title = 'Search generic ...'
}
if (myVar === 'decks') {
	alfy.input = '!set default-deck '
}

const fileAnkiDecks = './src/input/anki-decks.json'
const commands = [set, del, refresh, theme]
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
			icon: command.meta.icon,
			valid: false
		}))
		return alfy.inputMatches(options, 'title')
	}

	if (input === '') {
		await modelExist()
		const ankiDecks = await decks()
		if (ankiDecks === null) {
			throw new WorkflowError('Decks was not found, check your Anki profile', errorAction('profile'))
		}
		jsonfile.writeFile(fileAnkiDecks, ankiDecks, {
			spaces: 2
		}, error => {
			if (error !== null) {
				process.stderr.write(error)
			}
		})
		return introMessage
	}
}

if (!alfy.cache.get('start-PID')) {
	alfy.cache.set('start-PID', process.pid, {maxAge: 30000}) // 30 sec.
}
(async () => {
	if (alfy.config.get('theme') === undefined) {
		await fs.copy(`${process.env.PWD}/icons/for-light-theme/`, `${process.env.PWD}/icons/`)
		alfy.config.set('theme', 'dark')
	}
	try {
		if (alfy.cache.get('start-PID') === process.pid) { // Prevent for 30 second
			await runApplescript(`
				tell application "Alfred 3"
					run trigger ¬
						"refresh-ldoce" in workflow ¬
						"com.bikenik.ldoce"
				end tell
		`)
		}
		const out = await option(alfy.input)
		if (out || /!.*/.test(alfy.input)) {
			alfy.output(out)
		} else {
			api.fetching(query)
		}
	} catch (error) {
		const messages = []

		if (error.tip) {
			messages.push(error.tip)
		}

		messages.push('Activate this item to try again.')
		messages.push('⌘L to see the stack trace')

		alfy.output([{
			title: error.title ? error.title : `${error.message}`,
			subtitle: error.subtitle ? error.subtitle : messages.join(' | '),
			autocomplete: error.autocomplete ? error.autocomplete : '',
			icon: error.icon ? error.icon : {path: alfy.icon.error},
			valid: error.valid ? error.valid : false,
			variables: error.variables ? error.variables : {},
			text: {
				largetype: `${error.subtitle}\n\n${error.stack}`,
				copy: error.stack
			},
			mods: error.mods ? error.mods : {mods: {}}
		}])
	}
})()
