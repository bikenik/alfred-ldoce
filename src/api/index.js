const alfy = require('alfy')
const apiError = require('../utils/error')

module.exports.fetching =
	async query => {
		let quickLook = ''
		await alfy
			.fetch('http://api.pearson.com/v2/dictionaries/ldoce5/entries', {query})
			.then(apiError.checkStatus)
			.then(data => {
				const items = data.results.map(x => {
					let currentWord = alfy.input.replace(/\s/g, '-')
					let result
					result = {
						title: x.headword,
						subtitle: x.part_of_speech,
						arg: x.url,
						autocomplete: x.headword || '',
						quicklookurl: `https://www.ldoceonline.com/dictionary/${currentWord}`,
						variables: {
							action: 'dic',
							mode: 'regular'
						}
					}
					if (x.part_of_speech === 'verb') {
						result = {
							title: x.headword,
							arg: x.url,
							subtitle: x.part_of_speech,
							autocomplete: x.headword || '',
							quicklookurl: `https://www.ldoceonline.com/dictionary/${currentWord}`,
							variables: {
								action: 'dic',
								mode: 'regular'
							},
							mods: {
								alt: {
									variables: {
										action: 'dic',
										mode: 'phrasal-verb'
									},
									subtitle: 'Show Phrasal Verbs'
								}
							}
						}
					}
					return result
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
