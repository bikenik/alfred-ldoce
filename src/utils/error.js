/* eslint one-var: [2, { var: "always", let: "always" }] */
module.exports = class WorkflowError extends Error {
	constructor(message, data) {
		// `data` is an object with the following optional props:
		//   .tip - message to show so the user can fix the error
		//   .autocomplete - self-explanatory

		super(message)
		this.name = 'Workflow'

		Object.assign(this, data)
	}
}

module.exports.errorAction = reason => {
	let title, subtitle, autocomplete
	switch (reason) {
		case 'main':
			title = 'Searching without AnkiConnect'
			subtitle = 'Press ⇧↵ to open Anki. | ⌘L to see the stack trace | Go back to search ↵'
			autocomplete = null
			break
		case 'profile':
			title = null
			subtitle = 'Press ⇧↵ to open Anki. | ⌘L to see the stack trace'
			autocomplete = null
			break
		case '!set decks':
			title = null
			subtitle = 'Press ⇧↵ to open Anki. | Go back to search ↵  | ⌘L to see the stack trace'
			autocomplete = '!set '
			break
		case '!del decks':
			title = null
			subtitle = 'Press ⇧↵ to open Anki. | Go back to search ↵  | ⌘L to see the stack trace'
			autocomplete = '!del '
			break
		default:
			break
	}

	return {
		title: title,
		subtitle: subtitle,
		autocomplete: autocomplete,
		mods: {
			shift: {
				variables: {
					run: 'anki'
				},
				valid: true,
				subtitle: 'Anki will be run'
			}
		},
		valid: false,
		icon: {
			path: './icons/not-connected.png'
		}
	}
}

module.exports.checkStatus = response => {
	if (response.status === 200) {
		return Promise.resolve(response)
	}
	return Promise.reject(new Error(response.status))
}
