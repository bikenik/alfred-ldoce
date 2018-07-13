/* eslint max-params: ["error", 8] */
/* eslint max-depth: ["error", 8] */
/* eslint complexity: ["error", 36] */
/* eslint-disable no-unused-vars */
/* eslint-env es6 */
'use strict'
const alfy = require('alfy')
const Render = require('../utils/engine')
const {notFound} = require('../utils/engine').warning

const {wordOfURL} = process.env

let url = 'http://api.pearson.com' + wordOfURL
if (wordOfURL === undefined) {
	url = 'http://api.pearson.com' + alfy.config.get('wordOfURL')
}

const addToItems = new Render()
/* eslint-disable promise/prefer-await-to-then */
alfy.fetch(url).then(data => {
	const $ = data.result
	const commonExamples = $.examples && $.examples.length <= 3 ? $.examples : ($.examples && $.examples.length > 3 ? $.examples.slice(1, 3) : null)
	const quicklookurl = `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(/\s/g, '-')}`
	const notDefinition = '_'

	/* ************************
	Run-ons
	************************ */
	if ($.run_ons) {
		$.run_ons.forEach(runOn => {
			addToItems.add(
				new Render(
					runOn.derived_form,
					runOn.part_of_speech || runOn.examples[0].text,
					runOn.examples ? runOn.examples : notFound,
					null,
					runOn.examples ? './icons/runon.png' : './icons/red-runon.png',
					runOn.examples ? {
						definition: [`${runOn.derived_form}<span class="neutral span"> [</span>${runOn.part_of_speech}<span class="neutral span">]</span>`],
						examples: runOn.examples,
						sense: runOn
					} : quicklookurl,
					null,
					null
				))
		})
	}

	/* ************************
	Regular senses
	************************ */
	if ($.senses) {
		const exampleExist = {
			check: $.senses.map(x => x.gramatical_examples || x.examples)
		}
		exampleExist.result = exampleExist.check.filter(x => x).length > 0
		$.senses.forEach(sense => {
			const checkForEmpty = sense.examples || sense.definition
			const booleanTitle = sense.signpost || sense.lexical_unit || $.headword
			const booleanExamles = sense.examples || !sense.gramatical_examples
			const title = sense.signpost || sense.lexical_unit || $.headword
			const subtitle = sense.definition ? sense.definition[0] : notDefinition
			const examples = sense.examples || exampleExist.result ? sense.examples : commonExamples
			const largetype = `${title}${sense.register_label ? ` ⇒ [${sense.register_label}]` : ''}\n\n🔑 :${subtitle}${examples ? (Array.isArray(examples) ? `\n\n🎯 ${examples.map(x => x.text).join('\n🎯 ')}` : `\n\n🎯 ${examples.text}`) : notFound}`
			if (booleanTitle && checkForEmpty && !sense.synonym && !sense.opposite && booleanExamles) {
				addToItems.add(
					new Render(
						title,
						subtitle,
						examples ? examples : notFound,
						{copy: largetype, largetype},
						examples ? './icons/flag.png' : './icons/red-flag.png',
						examples ? {
							definition: [`${sense.lexical_unit ? sense.lexical_unit : ''}<span class="neutral span"> [</span>${sense.definition}<span class="neutral span">]</span>`],
							examples: examples || null,
							sense
						} : quicklookurl,
						null,
						null
					))
			}

			/* ************************
			Grammatiacal examples
			************************ */
			if (sense.gramatical_examples) {
				sense.gramatical_examples.forEach(gramaticalExample => {
					if (gramaticalExample.examples && !sense.synonym && !sense.opposite) {
						addToItems.add(
							new Render(
								sense.signpost ? `${sense.signpost} ⇒ ${gramaticalExample.pattern || sense.definition[0]}` : gramaticalExample.pattern ||
									sense.definition[0],
								sense.definition[0],
								gramaticalExample.examples,
								null,
								'./icons/gramatical.png',
								{
									examples: gramaticalExample.examples,
									definition: [`${sense.definition}${gramaticalExample.pattern ? `<span class="neutral span"> [</span>${gramaticalExample.pattern}<span class="neutral span">]</span>` : ''}`],
									sense
								}
							))
					}

					/* -----------------------------
					Show words: 'SEE ALSO' (syonym & opposite)
					 -------------------------------*/
					if (sense.synonym || sense.opposite) {
						let typeOfAddition
						for (const key in sense) {
							if (key === 'synonym') {
								typeOfAddition = key
							} else if (key === 'opposite') {
								typeOfAddition = key
							}
						}
						const title = `${gramaticalExample.pattern || sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${typeOfAddition}: ${sense.synonym || sense.opposite}`
						addToItems.add(
							new Render(
								title,
								sense.definition[0],
								gramaticalExample.examples,
								null,
								'./icons/gramatical.png',
								{
									examples: gramaticalExample.examples,
									definition: [`${sense.definition}${gramaticalExample.pattern ? `<span class="neutral span"> [</span>${gramaticalExample.pattern}<span class="neutral span">]</span>` : ''}`],
									sense
								},
								false,
								{
									ctrl: {
										valid: true,
										variables: {
											seeAlso: sense.synonym || sense.opposite
										},
										subtitle: 'SEE ALSO'
									}
								}
							))
					}
				})
			}

			/* ************************
			Collocation examples
			************************ */
			if (sense.collocation_examples) {
				sense.collocation_examples.forEach(collExample => {
					if (collExample.example.text !== undefined) {
						addToItems.add(
							new Render(
								sense.signpost ? `${sense.signpost} ⇒ ${collExample.collocation || sense.definition[0]}` : collExample.collocation || sense.definition[0],
								sense.definition[0],
								collExample.example.text,
								null,
								'./icons/collocation.png',
								{
									examples: [collExample.example],
									definition: [`${sense.definition}<span class="neutral span"> [</span>${collExample.collocation}<span class="neutral span">]</span>`],
									sense
								},
								null,
								null
							))
					}
				})
			}

			// Show words: 'SEE ALSO' (syonym & opposite)
			const existSyn = sense.examples && sense.synonym
			const existOpp = sense.examples && sense.opposite
			if (existSyn || existOpp) {
				let typeOfAddition
				for (const key in sense) {
					if (key === 'synonym') {
						typeOfAddition = key
					} else if (key === 'opposite') {
						typeOfAddition = key
					}
				}
				const title = `${sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${typeOfAddition}: ${sense.synonym || sense.opposite}`
				addToItems.add(
					new Render(
						title,
						sense.definition[0],
						sense.examples,
						null,
						'./icons/flag.png',
						{
							definition: sense.definition,
							examples: sense.examples,
							sense
						},
						false,
						{
							ctrl: {
								valid: true,
								variables: {
									seeAlso: sense.synonym || sense.opposite
								},
								subtitle: 'SEE ALSO'
							}
						}
					))
			}
		})
	}

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
		addToItems.add(
			new Render(
				'!Collocation box',
				subtitle,
				null,
				{copy: largetype, largetype},
				'./icons/collocation-box.png',
				box,
				null,
				{
					alt: {
						valid: false,
						subtitle: ''
					},
					cmd: {
						valid: false,
						subtitle: ''
					}
				},
				{collocation: 'true'}
			))
	}

	/* ************************
	Phrasal-verbs box
	************************ */
	if ($.phrasal_verbs) {
		const box = $.phrasal_verbs
		const sectionName = []
		box.forEach(section => sectionName.push(section.headword))
		const subtitle = `${box.heading ? box.heading : ''} ⇒ ${sectionName.join(' | ')}`
		addToItems.add(
			new Render(
				'!Phrasal-verbs box',
				subtitle,
				null,
				null,
				'./icons/phrasal_verbs-box.png',
				box,
				null,
				{
					alt: {
						valid: false,
						subtitle: ''
					},
					cmd: {
						valid: false,
						subtitle: ''
					}
				}
			))
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
		addToItems.add(
			new Render(
				'!Thesaurus box',
				subtitle,
				null,
				{
					copy: `Thesaurus box\n\n🔑 :${sectionNames.join('\n')}`,
					largetype: `'Thesaurus box'\n\n🔑 :${sectionNames.join('\n')}`
				},
				'./icons/thesaurus-box.png',
				box,
				null,
				{
					alt: {
						valid: false,
						subtitle: ''
					},
					cmd: {
						valid: false,
						subtitle: ''
					}
				},
				{
					boxOrder: 'multiple'
				}
			))
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
		addToItems.add(
			new Render(
				'!Spoken box',
				subtitle,
				null,
				{
					copy: `Spoken box\n\n🔑 :${senseNames.join('\n')}`,
					largetype: `'Spoken box'\n\n🔑 :${senseNames.join('\n')}`
				},
				'./icons/spoken.png',
				box,
				null,
				{
					alt: {
						valid: false,
						subtitle: ''
					},
					cmd: {
						valid: false,
						subtitle: ''
					}
				}
			))
	}

	const items = addToItems.items.filter(item => item.title)
	alfy.input = alfy.input.replace(/.*?\u2023[\s]/gm, '')
	const variantsToSingleChoose = alfy.inputMatches(items, 'title').map(x => ({
		title: x.title.replace(/^!/g, ''),
		subtitle: x.subtitle,
		arg: JSON.stringify(x.arg, '', 2),
		icon: x.icon,
		text: {
			copy: x.text.copy,
			largetype: x.text.largetype
		},
		variables: {
			word: data.result.headword.toUpperCase(),
			currentSense: x.text.largetype,
			type:
				x.title === '!Collocation box' ? 'collocation' : x.title === '!Phrasal-verbs box' ? 'phrasal-verbs' : x.title === '!Thesaurus box' ? 'thesaurus' : x.title === '!Spoken box' ? 'spoken' : 'regular',
			boxOrder: x.title === '!Thesaurus box' && x.arg.sections.length > 1 ? 'multiple' : x.title === '!Thesaurus box' ? 'single' : null
		},
		autocomplete: x.autocomplete,
		quicklookurl,
		mods: x.mods
	}))

	alfy.output(variantsToSingleChoose)

	const variantsAll = alfy.inputMatches(items, 'title').map(x => ({
		arg: x.arg,
		variables: {word: `${data.result.headword}`}
	})).filter(x => x.arg.examples)
	const variantsAllArgs = variantsAll.map(x => x.arg)
	alfy.config.set('allPhrases', variantsAllArgs)
})
/* eslint-enable promise/prefer-await-to-then */
