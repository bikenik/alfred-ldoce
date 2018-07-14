'use strict'

const alfy = require('alfy')
const Conf = require('conf')
const Render = require('../../utils/engine')
const {envRefresh} = require('../../utils')
const {notFound} = require('../../utils/engine').warning

const config = new Conf()
const addToItems = new Render()

const itemsTo = []
const currentWord = process.env.word
if (process.argv[3] === 'sections') {
	const dataOfBox = JSON.parse(process.env.dataOfBoxCollocations)
	dataOfBox.sections.forEach(section => {
		const title = `[${section.collocations.length}] ${section.type}`
		const subtitle = section.collocations.map(x => x.collocation).join(' | ')
		const largetype = `${currentWord}\n\n🔑 :${title}\n\n🎯 ${section.collocations.map(x => x.collocation).join('\n')}`
		addToItems.add(
			new Render(
				title,
				subtitle,
				null,
				{copy: largetype, largetype},
				'./icons/collocation-box.png',
				section,
				null,
				null,
				{
					subBoxNameCol: section.type,
					mode: 'collocation',
					inputInfo: config.get('inputInfo'),
					dataOfBoxCollocations: config.get('dataOfBoxCollocations'),
					dataOfBox2Collocations: config.get('dataOfBox2Collocations')
				}
			))
	})
}

if (process.argv[3] === 'collocations') {
	envRefresh({
		subBoxNameCol: process.env.subBoxNameCol ? `${process.env.subBoxNameCol}\u2023 ` : null,
		dataOfBox2Collocations: process.env.dataOfBox2Collocations ? process.env.dataOfBox2Collocations : null,
		dataOfBoxCollocations: process.env.dataOfBoxCollocations ? process.env.dataOfBoxCollocations : null,
		word: process.env.word ? process.env.word : null,
		inputInfo: process.env.inputInfo ? process.env.inputInfo : null
	})

	const dataOfBox = JSON.parse(config.get('dataOfBox2Collocations'))
	dataOfBox.collocations.forEach(collocation => {
		const title = `${collocation.collocation}${collocation.glossary ? ` (=${collocation.glossary})` : ''}`
		const quicklookurl = `https://www.ldoceonline.com/dictionary/${title ? title.replace(/\s/g, '-') : config.get('word').replace(/\s/g, '-')}}`
		const largetype = `${process.env.subBoxNameCol ? `${process.env.subBoxNameCol}\u2023 ` : config.has('subBoxNameCol') ? `${config.get('subBoxNameCol')} ` : ''}\n\n🔑 : ${title} \n\n🎯 ${collocation.examples ? collocation.examples.map(x => x.text).join('\n🎯') : notFound}`
		addToItems.add(
			new Render(
				title,
				collocation.examples ? collocation.examples[0].text : notFound,
				collocation.examples ? collocation.examples : notFound,
				{copy: largetype, largetype},
				collocation.examples ? './icons/collocation-box.png' : './icons/red-collocation-box.png',
				collocation.examples ? {
					definition: [`Collocation ⇒ ${process.env.subBoxNameCol ? `${process.env.subBoxNameCol}` : config.has('subBoxNameCol') ? `${config.get('subBoxNameCol')} ` : ''} ⇒ ${collocation.collocation}${collocation.glossary ? ` <span class="COLLGLOSS"><span class="neutral span"> (=</span>${collocation.glossary}<span class="neutral span">)</span></span>` : ''}`],
					examples: collocation.examples
				} : quicklookurl,
				null,
				null,
				{
					currentSense: `Collocation ⇒ ${currentWord}\n\n${largetype}`,
					word: config.get('word'),
					inputInfo: config.get('inputInfo'),
					dataOfBoxCollocations: config.get('dataOfBoxCollocations'),
					dataOfBox2Collocations: config.get('dataOfBox2Collocations')
				}
			))
	})
}

alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
const elements = addToItems.items.filter(item => item.title)
const items = alfy.inputMatches(elements, 'title')
	.map(x => ({
		title: x.title,
		subtitle: x.subtitle,
		arg: JSON.stringify(x.arg),
		autocomplete: `${config.get('word')}\u2023 ${process.env.subBoxNameCol ? `${process.env.subBoxNameCol}\u2023 ` : config.has('subBoxNameCol') ? `${config.get('subBoxNameCol')}` : ''}` + x.title,
		text: {
			copy: x.text.copy,
			largetype: x.text.largetype
		},
		variables: x.variables,
		icon: x.icon
	}))
alfy.output(items)

const variantsAllArgs = itemsTo.map(x => x.arg)
alfy.config.set('allPhrases', variantsAllArgs)
