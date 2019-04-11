/* eslint max-params: ["error", 8] */
/* eslint max-depth: ["error", 8] */
/* eslint complexity: ["error", 107] */
/* eslint-disable no-unused-vars */
/* eslint-env es6 */

'use strict'
const fs = require('fs')
const alfy = require('alfy')
const Render = require('../../utils/engine')
const {notFound} = require('../../utils/engine').warning

const regularRender = require('./regular-senses')

const {wordOfURL} = process.env
// Const wordOfURL = '/v2/dictionaries/entries/cqAFmvgmaf'

const fileBody = './src/input/body.json'
try {
	fs.unlinkSync(fileBody)
	process.stdout.write('successfully deleted: fileBody')
} catch (error) {
	if (error.code !== 'ENOENT') {
		process.stderr.write(error)
	}
}

let url = 'http://api.pearson.com' + wordOfURL
if (wordOfURL === undefined) {
	url = 'http://api.pearson.com' + alfy.config.get('wordOfURL')
}

const items = []

const runOnsRender = ($, quicklookurl) => {
	if ($.run_ons) {
		items.push(...$.run_ons.map(runOn => {
			const item = new Render('Run-on sentences',
				'title', 'subtitle', 'sentence', 'icon', 'arg')
			item.title = runOn.derived_form
			item.subtitle = runOn.part_of_speech || runOn.examples[0].text
			item.sentence = runOn.examples ? runOn.examples : notFound
			item.icon = runOn.examples ? './icons/runon.png' : './icons/red-runon.png'
			item.arg = runOn.examples ? {
				definition: [`${runOn.derived_form}<span class="neutral span"> [</span>${runOn.part_of_speech}<span class="neutral span">]</span>`],
				examples: runOn.examples ? runOn.examples : null,
				sense: runOn
			} : quicklookurl
			return item.getProperties()
		}))
	}
}

alfy.fetch(url).then(data => {
	const $ = data.result
	const commonExamples = $.examples && $.examples.length <= 3 ? $.examples : ($.examples && $.examples.length > 3 ? $.examples.slice(1, 3) : null)
	const quicklookurl = `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(/\s/g, '-')}`
	const notDefinition = '_'

	/* ************************
	Run-ons
	************************ */
	runOnsRender($, quicklookurl)

	/* ************************
	Regular senses
	************************ */
	regularRender(items, $, quicklookurl, commonExamples)

	/* ************************
	Collocation box
	************************ */
	if ($.collocation_box) {
		const box = $.collocation_box
		const sectionName = []
		box.sections.forEach(section => {
			sectionName.push(section.type)
		})
		const subtitle = `${box.heading ? box.heading : ''} ⇒ ${sectionName.join(' | ')}`
		const largetype = `Collocation box\n\n🔑 :${sectionName.join('\n')}`

		const item = new Render('Collocation Box',
			'title', 'subtitle', 'icon', 'arg', 'mods', 'varibales', 'text')
		item.title = '!Collocation box'
		item.subtitle = subtitle
		item.text = {copy: largetype, largetype}
		item.icon = './icons/collocation-box.png'
		item.arg = box
		item.mods = {
			alt: {
				valid: false,
				subtitle: ''
			},
			cmd: {
				valid: false,
				subtitle: ''
			}
		}
		item.variables = {collocation: 'true'}
		items.push(item.getProperties())
	}

	/* ************************
	Phrasal-verbs box
	************************ */
	if ($.phrasal_verbs) {
		const box = $.phrasal_verbs
		const sectionName = []
		box.forEach(section => sectionName.push(section.headword))
		const subtitle = `${box.heading ? box.heading : ''} ⇒ ${sectionName.join(' | ')}`

		const item = new Render('phrasal Verbs Box',
			'title', 'subtitle', 'icon', 'arg', 'mods')
		item.title = '!Phrasal-verbs box'
		item.subtitle = subtitle
		item.icon = './icons/phrasal_verbs-box.png'
		item.arg = box
		item.mods = {
			alt: {
				valid: false,
				subtitle: ''
			},
			cmd: {
				valid: false,
				subtitle: ''
			}
		}
		items.push(item.getProperties())
	}

	/* ************************
	Thesaurus box
	************************ */
	if ($.thesaurus_box) {
		const box = $.thesaurus_box
		const sectionNames = []
		box.sections.forEach(section => {
			section.exponents.forEach(exponent => {
				sectionNames.push(exponent.exponent)
			})
		})
		const subtitle = `${sectionNames.join(' | ')}`

		const item = new Render('Thesaurus Box',
			'title', 'subtitle', 'icon', 'arg', 'mods', 'varibales', 'text')
		item.title = '!Thesaurus box'
		item.subtitle = subtitle
		item.text = {
			copy: `Thesaurus box\n\n🔑 :${sectionNames.join('\n')}`,
			largetype: `'Thesaurus box'\n\n🔑 :${sectionNames.join('\n')}`
		}
		item.icon = './icons/thesaurus-box.png'
		item.arg = box
		item.mods = {
			alt: {
				valid: false,
				subtitle: ''
			},
			cmd: {
				valid: false,
				subtitle: ''
			}
		}
		item.variables = {boxOrder: 'multiple'}
		items.push(item.getProperties())
	}

	/* -----------------------------
		Spoken section
	-------------------------------*/
	if ($.spoken_section) {
		const box = $.spoken_section
		const senseNames = []
		box.senses.forEach(sense => {
			senseNames.push(sense.lexical_unit || sense.signpost)
		})
		const subtitle = `${senseNames.join(' | ')}`

		const item = new Render('Spoken Box',
			'title', 'text', 'subtitle', 'icon', 'arg', 'mods')
		item.title = '!Spoken box'
		item.subtitle = subtitle
		item.icon = './icons/spoken.png'
		item.text = {
			copy: `Spoken box\n\n🔑 :${senseNames.join('\n')}`,
			largetype: `'Spoken box'\n\n🔑 :${senseNames.join('\n')}`
		}
		item.arg = box
		item.mods = {
			alt: {
				valid: false,
				subtitle: ''
			},
			cmd: {
				valid: false,
				subtitle: ''
			}
		}
		items.push(item.getProperties())
	}

	// Const itemsResult = items.filter(item => item.title)
	const itemsResult = items.filter(item => item && item.title)
	alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
	const variantsToSingleChoose = alfy.inputMatches(itemsResult, 'title').map(x => ({
		name: x.name,
		title: x.title.replace(/^!/g, ''),
		subtitle: x.subtitle,
		arg: JSON.stringify(x.arg, '', 2),
		icon: x.icon,
		text: x.text,
		variables: {
			word: data.result.headword.toUpperCase(),
			currentSense: x.text.largetype,
			inputInfo: `${data.result.headword.toUpperCase()}${data.result.part_of_speech ? ` (${data.result.part_of_speech})` : ''}`,
			type:
				x.title === '!Collocation box' ? 'collocation' : x.title === '!Phrasal-verbs box' ? 'phrasal-verbs' : x.title === '!Thesaurus box' ? 'thesaurus' : x.title === '!Spoken box' ? 'spoken' : 'regular',
			boxOrder: x.title === '!Thesaurus box' && x.arg.sections.length > 1 ? 'multiple' : x.title === '!Thesaurus box' ? 'single' : null
		},
		autocomplete: x.autocomplete,
		quicklookurl,
		mods: x.mods
	}))

	alfy.output(variantsToSingleChoose)

	const variantsAll = alfy.inputMatches(itemsResult, 'title').map(x => ({
		arg: x.arg,
		variables: {word: `${data.result.headword}`}
	})).filter(x => x.arg.examples)
	const variantsAllArgs = variantsAll.map(x => x.arg)
	alfy.config.set('allPhrases', variantsAllArgs)
})
