const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {checkStatus, errorAction} = require('../utils/error')
const frequence = require('../input/db').result

module.exports.fetching = async query => {
	const quickLook = ''
	await alfy
		.fetch('http://api.pearson.com/v2/dictionaries/ldoce5/entries', {query})
		.then(checkStatus)
		.then(async data => {
			let result
			const items = data.results.map(x => {
				const currentWord = alfy.input.replace(/\s/g, '-')
				const definition = x.senses ? x.senses.map(x => x.definition && x.definition.map(y => y)).join(' | ') : null
				result = {
					title: x.headword,
					subtitle: x.part_of_speech || definition || 'helo world',
					arg: x.url,
					autocomplete: x.headword || '',
					quicklookurl: `https://www.ldoceonline.com/dictionary/${currentWord}`,
					variables: {
						action: 'dic',
						mode: 'regular',
						inputInfo: `${currentWord.toUpperCase()}${x.part_of_speech ? ` (${x.part_of_speech})` : ''}`
					}
				}
				return result
			})
			if (items.length > 0) {
				items.forEach((x, i) => {
					/* ****************************************
					Frequency
					******************************************* */
					const [existFreq] = frequence.filter(
						y => y.part_of_speech ? y.headword === x.title &&
							y.part_of_speech.filter(z => z === x.subtitle)[0] : y.headword === x.title
					)
					const spaceNum = 15 - `${items[i].subtitle ? items[i].subtitle.length : 10}`
					let space = ''
					for (let i = 0; i < spaceNum; i++) {
						space += ' '
					}
					items[i].subtitle += `${space}\t\t\t\t\t\t${existFreq ? `${existFreq.comm_S ? `${existFreq.comm_S} |` : ''} ${existFreq.comm_W ? `${existFreq.comm_W}\t` : ''}\t${existFreq.frequency ? `${existFreq.frequency}` : ''}` : ''}`
				})
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
