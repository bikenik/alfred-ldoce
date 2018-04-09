const alfy = require('alfy')
const WorkflowError = require('../utils/error')

module.exports.fetching =
	async () => {
		let quickLook = ''
		let query
		const myVar = process.argv[3]
		// const myVar = 'headword'
		// alfy.input = '!set default-deck '

		if (myVar === 'headword') {
			query = {
				headword: `=${alfy.input}`,
				limit: 50
			}
		}
		if (myVar === 'search') {
			query = {
				search: `=${alfy.input}`,
				limit: 50
			}
		}
		// (quickLook, query, myVar) => {
		await alfy
			.fetch('http://api.pearson.com/v2/dictionaries/ldoce5/entries', {query})
			.then(WorkflowError.checkStatus)
			.then(data => {
				const items = data.results.map(x => {
					let currentWord = alfy.input.replace(/\s/g, '-')
					return {
						title: x.headword,
						subtitle: x.part_of_speech,
						arg: x.url,
						valid: true,
						autocomplete: x.headword || '',
						quicklookurl: `https://www.ldoceonline.com/dictionary/${currentWord}`,
						variables: {
							action: 'dic'
						}
					}
				})
				alfy.output(items)
			})
			.catch(err => {
				const messages = []

				if (err.tip) {
					messages.push(err.tip)
				}

				messages.push('Activate this item to try again.')
				messages.push('⌘L to see the stack trace')

				alfy.output([{
					title: `Error: ${err.message}`,
					subtitle: messages.join(' | '),
					autocomplete: err.autocomplete ? err.autocomplete : '',
					icon: {
						path: alfy.icon.error
					},
					valid: false,
					text: {
						largetype: err.stack,
						copy: err.stack
					}
				}])
			})
		module.exports.quicklookurl = {
			quickLook: quickLook
		}
	}
