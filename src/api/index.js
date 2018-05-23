const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {checkStatus, errorAction} = require('../utils/error')

module.exports.fetching =
	async query => {
		const quickLook = ''
		await alfy
			.fetch('http://api.pearson.com/v2/dictionaries/ldoce5/entries', {query})
			.then(checkStatus)
			.then(data => {
				let result
				const items = data.results.map(x => {
					const currentWord = alfy.input.replace(/\s/g, '-')
					const definition = x.senses ? x.senses.map(x => x.definition && x.definition.map(y => y)).join(' | ') : null
					result = {
						title: x.headword,
						subtitle: x.part_of_speech || definition,
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
							let result
							if (data.length > 0) {
								const items = data[0].s.map(x => {
									result = {
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
												query.headword ? query.headword.replace(/\s/g, '-') : false ||
													query.search.replace(/\s/g, '-')}`
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
		module.exports.quicklookurl = {quickLook}
	}
