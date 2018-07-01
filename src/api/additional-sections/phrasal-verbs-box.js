/* eslint max-depth: ["error", 8] */
/* eslint-disable no-unused-vars */
'use strict'
const alfy = require('alfy')
const Conf = require('conf')
const Render = require('../../utils/engine')
const {envRefresh} = require('../../utils')

const config = new Conf()

envRefresh({
	dataOfBox: process.env.dataOfBox,
	word: process.env.word,
	inputInfo: process.env.inputInfo
})

const dataOfBox = JSON.parse(config.get('dataOfBox'))
const addToItems = new Render()

const currentWord = config.get('word')

const items = []
/* eslint-disable promise/prefer-await-to-then */
const $ = dataOfBox
const quicklookurl = `https://www.ldoceonline.com/dictionary/${currentWord.replace(/\s/g, '-')}`
const notFound = `\n\n🎲 API not exist examples, so the card won't created.\nHint the Enter to go to ldoce.com`
const notDefinition = '_'
dataOfBox.forEach(phrasalVerbs => {
	if (phrasalVerbs.senses) {
		phrasalVerbs.senses.forEach(sense => {
			if (sense.examples || sense.definition) {
				const definition = sense.definition ? sense.definition[0] : notDefinition
				const example = sense.examples ? sense.examples : notFound
				addToItems.add(
					new Render(
						phrasalVerbs.headword,
						definition,
						example,
						null,
						sense.examples ? './icons/phrasal_verbs-box.png' : './icons/red-phrasal_verbs-box.png',
						sense.examples ? {
							definition: sense.definition ? [`<span class="neutral span">[</span>${phrasalVerbs.headword}<span class="neutral span">] </span>${sense.definition}`] : notDefinition,
							examples: sense.examples ? sense.examples : notFound,
							sense
						} : `https://www.ldoceonline.com/dictionary/${currentWord.replace(/\s/g, '-')}`,
						null,
						null,
						null
					))
				if (sense.gramatical_examples) {
					sense.gramatical_examples.forEach(gramaticalExample => {
						if (gramaticalExample.examples) {
							const largetype = `${gramaticalExample.pattern}\n\n🔑 :${sense.definition[0]}\n\n🎯${gramaticalExample.examples[0].text}`
							addToItems.add(
								new Render(
									gramaticalExample.pattern,
									sense.definition[0],
									gramaticalExample.examples,
									null,
									gramaticalExample.examples ? './icons/gramatical-box.png' : './icons/red-gramatical-box.png',
									{
										examples: gramaticalExample.examples,
										definition: [`<span class="neutral span">[</span>${phrasalVerbs.headword}<span class="neutral span">] </span>> ${sense.definition} [${gramaticalExample.pattern}]`],
										sense
									},
									null,
									null,
									null
								))
						}
					})
				}
			}
		})
		if (phrasalVerbs.variants) {
			addToItems.items[addToItems.items.length - 1].arg.sense.variants = phrasalVerbs.variants
		}
	}
})

alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
const elements = addToItems.items.filter(item => addToItems.items)
const variantsToSingleChoose = alfy.inputMatches(elements, 'title').map(x => ({
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

const variantsAll = alfy.inputMatches(elements, 'title').map(x => ({
	arg: x.arg,
	variables: {word: `${dataOfBox.headword}`}
})).filter(x => x.arg.examples)

const variantsAllArgs = variantsAll.map(x => x.arg)
alfy.config.set('allPhrases', variantsAllArgs)
/* eslint-enable promise/prefer-await-to-then */
