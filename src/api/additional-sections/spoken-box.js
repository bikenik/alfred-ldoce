'use strict'
const alfy = require('alfy')
const Conf = require('conf')
const engine = require('../../utils/engine')
const {envRefresh} = require('../../utils')

const config = new Conf()

const itemsTo = []
const sectionHandle = section => {
	section.senses.forEach(sense => {
		const quicklookurl = `https://www.ldoceonline.com/dictionary/${sense.lexical_unit ? sense.lexical_unit.replace(/\s/g, '-') : config.get('word').replace(/\s/g, '-')}}`
		const title = `${sense.lexical_unit || sense.signpost}`
		const subtitle = sense.definition ? sense.definition[0] || sense.geography : 'not found..'
		const examples = sense.examples ? sense.examples : null
		const largetype = `(Spoken box) ⇒ ${title}\n\n🔑 :${subtitle}\n\n🎯 ${examples ? (Array.isArray(examples) ? `${examples.map(x => x.text).join('\n🎯 ')}` : `\n\n🎯 ${examples.text}`) : engine.warning.notFound}`
		itemsTo.push({
			title,
			subtitle,
			arg: examples ? {
				definition: [`Spoken ⇒ <br><span class="display EXP">${sense.sense}</span> ${sense.definition[0]}`],
				examples: sense.examples
			} : quicklookurl,
			text: {copy: largetype, largetype},
			icon: {path: examples ? './icons/spoken.png' : './icons/red-spoken.png'},
			variables: {
				mode: 'spoken',
				currentSense: `Spoken ⇒ ${alfy.config.get('currentWord')}\n${largetype}`,
				dataOfBoxThesaurus: JSON.stringify(config.get('dataOfBoxSpoken')),
				word: config.get('word'),
				inputInfo: config.get('inputInfo')
			}
		})
	})
}

envRefresh({
	dataOfBoxSpoken: process.env.dataOfBoxSpoken ? process.env.dataOfBoxSpoken : null,
	word: process.env.word ? process.env.word : null,
	inputInfo: process.env.inputInfo ? process.env.inputInfo : null
})

sectionHandle(JSON.parse(config.get('dataOfBoxSpoken')))

alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
const items = alfy.inputMatches(itemsTo, 'title')
	.map(x => ({
		title: x.title,
		subtitle: x.subtitle,
		arg: JSON.stringify(x.arg),
		autocomplete: `${config.get('word')} (spoken box)\u2023 ` + x.title,
		text: x.text,
		variables: x.variables,
		icon: x.icon
	}))
alfy.output(items)

alfy.config.set('allPhrases', items.map(x => JSON.parse(x.arg)))
