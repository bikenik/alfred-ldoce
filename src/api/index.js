const alfy = require('alfy')
const WorkflowError = require('../utils/error')
const {checkStatus, errorAction} = require('../utils/error')
const frequence = require('../input/db').result
const Render = require('../utils/engine')

const subtitleSearch = (x, definition) => x.part_of_speech || definition || ''
function itemsFunc(data) {
	const items = []
	items.push(...data.results.map(x => {
		const currentWord = alfy.input.replace(/\s/g, '-')
		const definition = x.senses ? x.senses.map(x => x.definition && x.definition.map(y => y)).join(' | ') : null

		const item = new Render('Items function',
			'title', 'subtitle', 'arg', 'autocomplete', 'quicklookurl', 'variables')
		item.title = x.headword
		item.subtitle = subtitleSearch(x, definition)
		item.arg = x.url
		item.autocomplete = x.headword || ''
		item.quicklookurl = `https://www.ldoceonline.com/dictionary/${currentWord}`
		item.variables = {
			action: 'dic',
			mode: 'regular',
			validOutput: alfy.cache.get('validOutput') === 'true' ? 'true' : 'false',
			inputInfo: `${currentWord.toUpperCase()}${x.part_of_speech ? ` (${x.part_of_speech})` : ''}`
		}
		return item.getProperties()
	}))
	return items
}

function itemsWithFrequency(data) {
	const items = itemsFunc(data)
	for (let i = 0; i < items.length; i++) {
		/* ****************************************
		Frequency
		******************************************* */
		const [existFreq] = frequence.filter(
			y => y.part_of_speech ? y.headword === items[i].title &&
				y.part_of_speech.filter(z => z === items[i].subtitle)[0] : y.headword === items[i].title
		)
		const spaceNum = 15 - `${items[i].subtitle ? items[i].subtitle.length : 10}`
		let space = ''
		for (let i = 0; i < spaceNum; i++) {
			space += ' '
		}
		items[i].subtitle += `${space}\t\t\t\t\t\t${existFreq ? `${existFreq.comm_S ? `${existFreq.comm_S} |` : ''} ${existFreq.comm_W ? `${existFreq.comm_W}\t` : ''}\t${existFreq.frequency ? `${existFreq.frequency}` : ''}` : ''}`
	}
	return items
}

module.exports.fetching = async query => {
	const quickLook = ''
	await alfy
		.fetch('http://api.pearson.com/v2/dictionaries/ldoce5/entries', {query})
		.then(checkStatus)
		.then(data => {
			const itemsArr = itemsWithFrequency(data)
			if (itemsArr.length > 0) {
				alfy.output(itemsArr)
			} else {
				/* ****************************************
				Search by suggestions (Yandex Speller)
				******************************************* */
				alfy.fetch(`https://speller.yandex.net/services/spellservice.json/checkText?text=${query.headword || query.search}&lang=en`)
					.then(data => {
						if (data.length > 0) {
							const items = data[0].s.map(x => {
								const item = new Render('Yandex Speller',
									'title', 'subtitle', 'autocomlete', 'valid', 'icon')
								item.title = x
								item.subtitle = `Perhaps you mean: ${x}`
								item.autocomplete = x
								item.valid = false
								item.icon = './icons/speller.png'
								return item.getProperties()
							})
							alfy.output(items)
						} else {
							const items = [{
								title: 'Not found this word in Ldoce5',
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
