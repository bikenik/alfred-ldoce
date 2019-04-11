/* eslint max-depth: ["error", 8] */
/* eslint-disable no-unused-vars */
'use strict'
const alfy = require('alfy')
const Conf = require('conf')
const Render = require('../../utils/engine')
const {notFound} = require('../../utils/engine').warning
const {envRefresh} = require('../../utils')

const config = new Conf()

envRefresh({
	dataOfBox: process.env.dataOfBox ? process.env.dataOfBox : null,
	word: process.env.word ? process.env.word : null,
	inputInfo: process.env.inputInfo ? process.env.inputInfo : null
})

const dataOfBox = JSON.parse(config.get('dataOfBox'))

const currentWord = config.get('word')

const items = []
const $ = dataOfBox
const quicklookurl = `https://www.ldoceonline.com/dictionary/${currentWord.replace(/\s/g, '-')}`
const notDefinition = '_'
dataOfBox.forEach(phrasalVerbs => {
	if (phrasalVerbs.senses) {
		phrasalVerbs.senses.forEach(sense => {
			if (sense.examples || sense.definition) {
				const definition = sense.definition ? sense.definition[0] : notDefinition
				const example = sense.examples ? sense.examples : notFound

				const item = new Render('phrasal verbs regular',
					'title', 'subtitle', 'sentence', 'icon', 'arg')
				item.title = phrasalVerbs.headword
				item.subtitle = definition
				item.sentence = example
				item.icon = sense.examples ? './icons/phrasal_verbs-box.png' : './icons/red-phrasal_verbs-box.png'
				item.arg = sense.examples ? {
					definition: sense.definition ? [`<span class="neutral span">[</span>${phrasalVerbs.headword}<span class="neutral span">] </span>${sense.definition}`] : notDefinition,
					examples: sense.examples ? sense.examples : notFound,
					sense
				} : `https://www.ldoceonline.com/dictionary/${currentWord.replace(/\s/g, '-')}`
				items.push(item.getProperties())

				if (sense.gramatical_examples) {
					sense.gramatical_examples.forEach(gramaticalExample => {
						if (gramaticalExample.examples) {
							const largetype = `${gramaticalExample.pattern}\n\n🔑 :${sense.definition[0]}\n\n🎯${gramaticalExample.examples[0].text}`

							const item = new Render('phrasal verbs gramatical',
								'title', 'subtitle', 'sentence', 'icon', 'arg')
							item.title = gramaticalExample.pattern
							item.subtitle = sense.definition[0]
							item.sentence = gramaticalExample.examples
							item.icon = gramaticalExample.examples ? './icons/gramatical-box.png' : './icons/red-gramatical-box.png'
							item.arg = {
								examples: gramaticalExample.examples,
								definition: [`<span class="neutral span">[</span>${phrasalVerbs.headword}<span class="neutral span">] </span>> ${sense.definition} [${gramaticalExample.pattern}]`],
								sense
							}
							items.push(item.getProperties())
						}
					})
				}
			}
		})
		if (phrasalVerbs.variants) {
			items[items.length - 1].arg.sense.variants = phrasalVerbs.variants
			// "" addToItems.items[addToItems.items.length - 1].arg.sense.variants = phrasalVerbs.variants
		}
	}
})

alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
const variantsToSingleChoose = alfy.inputMatches(items, 'title').map(x => ({
	title: x.title,
	subtitle: x.subtitle,
	arg: JSON.stringify(x.arg, '', 2),
	icon: x.icon,
	text: {
		copy: x.text.copy,
		largetype: x.text.largetype
	},
	variables: {
		currentSense: x.text.largetype,
		mode: 'phrasal-verbs',
		inputInfo: config.get('inputInfo')
	},
	autocomplete: `${config.get('word')}(phrasal-verbs)\u2023 ${x.title}`,
	quicklookurl
}))

alfy.output(variantsToSingleChoose)

const variantsAll = alfy.inputMatches(items, 'title').map(x => ({
	arg: x.arg,
	variables: {word: `${dataOfBox.headword}`}
})).filter(x => x.arg.examples)

const variantsAllArgs = variantsAll.map(x => x.arg)
alfy.config.set('allPhrases', variantsAllArgs)
