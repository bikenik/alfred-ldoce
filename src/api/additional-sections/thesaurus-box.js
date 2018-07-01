'use strict'
const alfy = require('alfy')
const Conf = require('conf')
const engine = require('../../utils/engine')
const {envRefresh} = require('../../utils')

const config = new Conf()

const itemsTo = []
const currentWord = process.env.word
const sectionHandle = section => {
	section.exponents.forEach(exponent => {
		const quicklookurl = `https://www.ldoceonline.com/dictionary/${exponent.exponent.replace(/\s/g, '-')}`
		const title = `${exponent.exponent}`
		const subtitle = exponent.definition ? exponent.definition : 'not found..'
		const examples = exponent.examples ? exponent.examples : null
		const largetype = `${process.env.subBoxNameTh ? `${process.env.subBoxNameTh}\u2023 ` : config.has('subBoxNameTh') ? `${config.get('subBoxNameTh')} ` : ''}${title}\n\n🔑 :${subtitle}\n\n🎯 ${examples ? (Array.isArray(examples) ? `${examples.map(x => x.text).join('\n🎯 ')}` : `\n\n🎯 ${examples.text}`) : engine.warning.notFound}`
		itemsTo.push({
			title,
			subtitle,
			arg: examples ? {
				definition: [`Thesaurus${process.env.subBoxNameTh ? ` ⇒ ${process.env.subBoxNameTh}` : config.has('subBoxNameTh') ? `${config.get('subBoxNameTh')}` : ''}:<br><span class="display EXP">${exponent.exponent}</span> ${exponent.definition}`],
				examples: exponent.examples
			} : quicklookurl,
			text: {copy: largetype, largetype},
			icon: {path: './icons/thesaurus.png'},
			variables: {
				mode: 'thesaurus',
				currentSense: `Thesaurus ⇒ ${alfy.config.get('currentWord')}\n${largetype}`,
				dataOfBoxThesaurus: JSON.stringify(config.get('dataOfBoxThesaurus')),
				boxOrder: config.get('boxOrder'),
				word: config.get('word'),
				inputInfo: config.get('inputInfo')
			}
		})
	})
}

if (process.argv[3] === 'sections') {
	config.delete('subBoxNameTh')
	const dataOfBox = config.has('dataOfBoxThesaurus') ? JSON.parse(config.get('dataOfBoxThesaurus')) : JSON.parse(process.env.dataOfBoxThesaurus)
	dataOfBox.sections.forEach(section => {
		const title = section.type ? section.type : currentWord.toLowerCase()
		const largetype = `🔑 :${title}\n\n🎯 ${section.exponents.map(x => x.exponent).join('\n\t')}`
		itemsTo.push({
			title,
			subtitle: section.exponents.map(x => x.exponent).join(' | '),
			text: {copy: largetype, largetype},
			arg: section,
			variables: {
				subBoxNameTh: title,
				mode: 'collocation',
				inputInfo: config.get('inputInfo'),
				word: config.get('word')
			}
		})
	})
}

if (process.argv[3] === 'exponents') {
	envRefresh({
		subBoxNameTh: process.env.subBoxNameTh ? `${process.env.subBoxNameTh}\u2023 ` : '',
		dataOfBoxThesaurus: process.env.dataOfBoxThesaurus,
		word: process.env.word,
		inputInfo: process.env.inputInfo,
		boxOrder: process.env.boxOrder
	})
	if (process.env.dataOfBox2Thesaurus && config.has('dataOfBox2')) {
		sectionHandle(config.get('dataOfBox2'))
	} else {
		sectionHandle(JSON.parse(config.get('dataOfBoxThesaurus')).sections[0])
	}
}

alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
const items = alfy.inputMatches(itemsTo, 'title')
	.map(x => ({
		title: x.title,
		subtitle: x.subtitle,
		arg: JSON.stringify(x.arg),
		autocomplete: `${config.get('word')}\u2023 ${process.env.subBoxNameTh ? `${process.env.subBoxNameTh}\u2023 ` : config.has('subBoxNameTh') ? `${config.get('subBoxNameTh')}` : ''}${x.title}`,
		text: x.text,
		variables: x.variables,
		icon: x.icon
	}))
alfy.output(items)

alfy.config.set('allPhrases', items.map(x => JSON.parse(x.arg)))
