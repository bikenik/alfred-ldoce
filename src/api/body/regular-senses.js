'use strict'
const Render = require('../../utils/engine')
const {notFound} = require('../../utils/engine').warning

const {typeOfAddition} = require('./internal-function')

module.exports = (items, $, quicklookurl, commonExamples) => {
	if ($.senses) {
		const exampleExist = {
			check: $.senses.map(x => x.gramatical_examples || x.examples)
		}
		exampleExist.result = exampleExist.check.filter(x => x).length > 0
		for (const sense of $.senses) {
			const checkForEmpty = sense.examples || sense.definition
			const booleanTitle = sense.signpost || sense.lexical_unit || $.headword
			const booleanExamles = sense.examples || !sense.gramatical_examples
			const title = sense.signpost || sense.lexical_unit || $.headword
			const subtitle = sense.definition ? sense.definition[0] : '_'
			const examples = sense.examples || exampleExist.result ? sense.examples : commonExamples ? commonExamples : '???????'
			const largetype = `${title}${sense.register_label ? ` ⇒ [${sense.register_label}]` : ''}\n\n🔑 :${subtitle}${examples ? (Array.isArray(examples) ? `\n\n🎯 ${examples.map(x => x.text).join('\n🎯 ')}` : `\n\n🎯 ${examples.text}`) : notFound}`
			if (booleanTitle && checkForEmpty && !sense.synonym && !sense.opposite && booleanExamles) {
				const item = new Render('Regular Block',
					'title', 'subtitle', 'sentence', 'text', 'icon', 'arg')
				item.title = title
				item.subtitle = subtitle
				item.sentence = examples ? examples : notFound
				item.text = {
					copy: largetype, largetype
				}
				item.icon = examples ? './icons/flag.png' : './icons/red-flag.png'
				item.arg = examples ? {
					definition: [`${sense.lexical_unit ? sense.lexical_unit : ''}<span class="neutral span"> [</span>${sense.definition}<span class="neutral span">]</span>`],
					examples: examples || null,
					sense
				} : quicklookurl
				items.push(item.getProperties())
			}

			/* ************************
			Grammatiacal examples
			************************ */
			if (sense.gramatical_examples) {
				items.push(...sense.gramatical_examples
					.map(gramaticalExample => {
						if (gramaticalExample.examples && !sense.synonym && !sense.opposite) {
							const item = new Render('Grammatical Examples',
								'title', 'subtitle', 'sentence', 'icon', 'arg')
							item.title = sense.signpost ? `${sense.signpost} ⇒ ${gramaticalExample.pattern || sense.definition[0]}` : gramaticalExample.pattern || sense.definition[0]
							item.subtitle = sense.definition[0]
							item.sentence = gramaticalExample.examples ? gramaticalExample.examples : examples ? examples : notFound
							item.icon = gramaticalExample.examples || examples ? './icons/gramatical.png' : './icons/red-gramatical.png'
							item.arg = gramaticalExample.examples || examples ? {
								examples: gramaticalExample.examples ? gramaticalExample.examples : examples ? examples : null,
								definition: [`${sense.definition}${gramaticalExample.pattern ? `<span class="neutral span"> [</span>${gramaticalExample.pattern}<span class="neutral span">]</span>` : ''}`],
								sense
							} : quicklookurl
							item.getProperties()
						} else {
							return false
						}
						/* -----------------------------
					Show words: 'SEE ALSO' (syonym & opposite)
					 -------------------------------*/
						if (sense.synonym || sense.opposite) {
							const title = `${gramaticalExample.pattern || sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${typeOfAddition(sense)}: ${sense.synonym || sense.opposite}`

							const item = new Render('Words with Synonyms & opposites',
								'title', 'subtitle', 'sentence', 'icon', 'arg', 'mods')
							item.title = title
							item.subtitle = sense.definition[0]
							item.sentence = gramaticalExample.examples ? gramaticalExample.examples : examples ? examples : notFound
							item.icon = gramaticalExample.examples || examples ? './icons/gramatical.png' : './icons/red-gramatical.png'
							item.arg = gramaticalExample.examples || examples ? {
								examples: gramaticalExample.examples ? gramaticalExample.examples : examples ? examples : null,
								definition: [`${sense.definition}${gramaticalExample.pattern ? `<span class="neutral span"> [</span>${gramaticalExample.pattern}<span class="neutral span">]</span>` : ''}`],
								sense
							} : quicklookurl
							item.valid = false
							item.mods = {
								ctrl: {
									valid: true,
									variables: {
										seeAlso: sense.synonym || sense.opposite
									},
									subtitle: 'SEE ALSO'
								}
							}
							return item.getProperties()
						}
					}))
			}

			/* ************************
			Collocation examples
			************************ */
			if (sense.collocation_examples) {
				// Items.push(...sense.collocation_examples.map(collExample => {
				for (const collExample of sense.collocation_examples) {
					const exampleBool = collExample.example && collExample.example.text

					const item = new Render('Collocation Sentences',
						'title', 'subtitle', 'sentence', 'icon', 'arg')
					item.title = sense.signpost ? `${sense.signpost} ⇒ ${collExample.collocation || sense.definition[0]}` : collExample.collocation || sense.definition[0]
					item.subtitle = sense.definition[0]
					item.sentence = exampleBool ? collExample.example.text : notFound
					item.icon = exampleBool ? './icons/collocation.png' : './icons/red-collocation.png'
					item.arg = exampleBool ? {
						examples: collExample.example ? [collExample.example] : examples ? examples : null,
						definition: [`${sense.definition}<span class="neutral span"> [</span>${collExample.collocation}<span class="neutral span">]</span>`],
						sense
					} : quicklookurl
					// Const resultTest = item.getProperties() //?
					items.push(item.getProperties())
				}
				// For (const collExample of sense.collocation_examples) {
				// 	const exampleBool = collExample.example && collExample.example.text
				// 	addToItems.add(
				// 		new Render('collocation sentences',
				// 			{title: sense.signpost ? `${sense.signpost} ⇒ ${collExample.collocation || sense.definition[0]}` : collExample.collocation || sense.definition[0]},
				// 			{subtitle: sense.definition[0]},
				// 			{sentence: exampleBool ? collExample.example.text : notFound},
				// 			{icon: exampleBool ? './icons/collocation.png' : './icons/red-collocation.png'},
				// 			{
				// 				arg: exampleBool ? {
				// 					examples: collExample.example ? [collExample.example] : examples ? examples : null,
				// 					definition: [`${sense.definition}<span class="neutral span"> [</span>${collExample.collocation}<span class="neutral span">]</span>`],
				// 					sense
				// 				} : quicklookurl
				// 			}
				// 		))
				// }
			}

			// Show words: 'SEE ALSO' (syonym & opposite)
			const existSyn = examples && sense.synonym
			const existOpp = examples && sense.opposite
			if (existSyn || existOpp) {
				const title = `${sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${typeOfAddition(sense)}: ${sense.synonym || sense.opposite}`
				const item = new Render('words with synonyms & opposites case 2',
					'title', 'subtitle', 'sentence', 'icon', 'arg', 'mods')
				item.title = title
				item.subtitle = sense.definition[0]
				item.sentence = examples ? examples : notFound
				item.icon = examples ? './icons/flag.png' : './icons/red-flag.png'
				item.arg = examples ? {
					definition: sense.definition,
					examples: examples || null,
					sense
				} : quicklookurl
				item.valid = false
				item.mods = {
					ctrl: {
						valid: true,
						variables: {
							seeAlso: sense.synonym || sense.opposite
						},
						subtitle: 'SEE ALSO'
					}
				}
				items.push(item.getProperties())
			}
		}
	}
}
