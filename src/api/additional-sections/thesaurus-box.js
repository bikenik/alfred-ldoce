'use strict'
const alfy = require('alfy')
const Conf = require('conf')
const Render = require('../../utils/engine')
const engine = require('../../utils/engine')
const {
	envRefresh
} = require('../../utils')

const config = new Conf()
const items = []

const currentWord = process.env.word
const handlerOfSection = section => {
	section.exponents.forEach(exponent => {
		const quicklookurl = `https://www.ldoceonline.com/dictionary/${exponent.exponent.replace(/\s/g, '-')}`
		const title = `${exponent.exponent}`
		const subtitle = exponent.definition ? exponent.definition : 'not found..'
		const examples = exponent.examples ? exponent.examples : null
		const largetype = `${process.env.subBoxNameTh ? `${process.env.subBoxNameTh}\u2023 ` : config.has('subBoxNameTh') ? `${config.get('subBoxNameTh')} ` : ''}${title}\n\n🔑 :${subtitle}\n\n🎯 ${examples ? (Array.isArray(examples) ? `${examples.map(x => x.text).join('\n🎯 ')}` : `\n\n🎯 ${examples.text}`) : engine.warning.notFound}`

		const item = new Render('thesaurus box 2',
			'title', 'subtitle', 'text', 'arg', 'icon', 'variables')
		item.title = title
		item.subtitle = subtitle
		item.text = {copy: largetype, largetype}
		item.arg = examples ? {
			definition: [`Thesaurus${process.env.subBoxNameTh ? ` ⇒ ${process.env.subBoxNameTh}` : config.has('subBoxNameTh') ? `${config.get('subBoxNameTh')}` : ''}:<br><span class="display EXP">${exponent.exponent}</span> ${exponent.definition}`],
			examples: exponent.examples
		} : quicklookurl
		item.icon = examples ? './icons/thesaurus.png' : './icons/red-thesaurus.png'
		item.variables = {
			mode: 'thesaurus',
			currentSense: `Thesaurus ⇒ ${alfy.config.get('currentWord')}\n${largetype}`,
			dataOfBoxThesaurus: config.get('dataOfBoxThesaurus'),
			dataOfBox2Thesaurus: config.get('dataOfBox2Thesaurus'),
			boxOrder: config.get('boxOrder'),
			word: config.get('word'),
			inputInfo: config.get('inputInfo')
		}
		items.push(item.getProperties())
	})
}

if (process.argv[3] === 'sections') {
	config.delete('subBoxNameTh')
	config.delete('dataOfBox2Thesaurus')
	config.delete('dataOfBoxThesaurus')
	const dataOfBox = config.has('dataOfBoxThesaurus') ? JSON.parse(config.get('dataOfBoxThesaurus')) : JSON.parse(process.env.dataOfBoxThesaurus)
	dataOfBox.sections.forEach(section => {
		const title = section.type ? section.type : currentWord.toLowerCase()
		const largetype = `🔑 :${title}\n\n🎯 ${section.exponents.map(x => x.exponent).join('\n\t')}`
		const item = new Render('thesaurus box 2',
			'title', 'subtitle', 'text', 'arg', 'icon', 'variables')
		item.title = title
		item.subtitle = section.exponents.map(x => x.exponent).join(' | ')
		item.text = {copy: largetype, largetype}
		item.arg = section
		item.icon = './icons/thesaurus.png'
		item.variables = {
			subBoxNameTh: title,
			mode: 'collocation',
			inputInfo: config.get('inputInfo'),
			word: config.get('word')
		}
		items.push(item.getProperties())
	})
}

if (process.argv[3] === 'exponents') {
	envRefresh({
		subBoxNameTh: process.env.subBoxNameTh ? `${process.env.subBoxNameTh}\u2023 ` : '',
		dataOfBoxThesaurus: process.env.dataOfBoxThesaurus ? process.env.dataOfBoxThesaurus : null,
		dataOfBox2Thesaurus: process.env.dataOfBox2Thesaurus ? process.env.dataOfBox2Thesaurus : null,
		word: process.env.word,
		inputInfo: process.env.inputInfo,
		boxOrder: process.env.boxOrder
	})
	if (config.has('dataOfBox2Thesaurus')) {
		handlerOfSection(JSON.parse(config.get('dataOfBox2Thesaurus')))
	} else {
		handlerOfSection(JSON.parse(config.get('dataOfBoxThesaurus')).sections[0])
	}
}

alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
const itemsResult = alfy.inputMatches(items, 'title')
	.map(x => ({
		title: x.title,
		subtitle: x.subtitle,
		arg: JSON.stringify(x.arg),
		autocomplete: `${config.get('word')}\u2023 ${process.env.subBoxNameTh ? `${process.env.subBoxNameTh}\u2023 ` : config.has('subBoxNameTh') ? `${config.get('subBoxNameTh')}` : ''}${x.title}`,
		text: x.text,
		variables: x.variables,
		icon: x.icon
	}))
alfy.output(itemsResult)

alfy.config.set('allPhrases', itemsResult.map(x => JSON.parse(x.arg)))
