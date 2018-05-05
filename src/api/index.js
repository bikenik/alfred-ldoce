const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {checkStatus, errorAction} = require('../utils/error')

module.exports.fetching =
	async query => {
		let quickLook = ''
		await alfy
			.fetch('http://api.pearson.com/v2/dictionaries/ldoce5/entries', {query})
			.then(checkStatus)
			.then(data => {
				const items = data.results.map(x => {
					let currentWord = alfy.input.replace(/\s/g, '-')
					let result = {
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
				if (items.length > 0) {
					alfy.output(items)
				} else {
					/* ****************************************
					Search by suggestions (Yandex Speller)
					******************************************* */
					alfy.fetch(`https://speller.yandex.net/services/spellservice.json/checkText?text=${query.headword || query.search}&lang=en`)
						.then(data => {
							if (data.length > 0) {
								const items = data[0].s.map(x => {
									let result = {
										title: x,
										subtitle: `Perhaps you mean: ${x}`,
										autocomplete: x,
										valid: false,
										icon: {
											path: './icons/speller.png'
										}
									}
									return result
								})
								alfy.output(items)
							} else {
								const items = [{
									title: `Not found this word in Ldoce5`,
									subtitle: 'Press ↵ to search | Press ⇧↵ to go to ldoceonline.com',
									valid: false,
									autocomplete: '',
									mods: {
										shift: {
											subtitle: 'go longman.com',
											valid: true,
											arg: `https://www.ldoceonline.com/dictionary/${
												query.headword.replace(/\s/g, '-') ||
												query.search.replace(/\s/g, '-')
												}`
										}
									}
								}]
								alfy.output(items)
							}
						})
						.catch(err => {
							throw new WorkflowError(`${err}`, errorAction('main'))
						})
				}
			})
			.catch(err => {
				throw new WorkflowError(`${err}`, errorAction('main'))
			})
		module.exports.quicklookurl = {
			quickLook: quickLook
		}
	}
