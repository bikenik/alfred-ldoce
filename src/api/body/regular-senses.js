'use strict'
const Render = require('../../utils/engine')
const {notFound} = require('../../utils/engine').warning

const objectOfSense = (sense, $) => {
	return {
		checkForEmpty: sense.examples || sense.definition,
		booleanTitle: sense.signpost || sense.lexical_unit || $.headword,
		booleanExamles: sense.examples || !sense.gramatical_examples,
		title: sense.signpost || sense.lexical_unit || $.headword,
		subtitle: sense.definition ? sense.definition[0] : '_',
		exampleExist: $.senses.filter(x => x.gramatical_examples || x.examples).length > 0
	}
}

const getLargetype = (sense, examples, title, subtitle) => {
	return `${title}${sense.register_label ? ` ⇒ [${sense.register_label}]` : ''}\n\n🔑 :${subtitle}${examples ? (Array.isArray(examples) ? `\n\n🎯 ${examples.map(x => x.text).join('\n🎯 ')}` : `\n\n🎯 ${examples.text}`) : notFound}`
}

const exampleExist = (sense, commonExamples, $) => sense.examples || objectOfSense(sense, $).exampleExist ? sense.examples : commonExamples ? commonExamples : '???????'

const regular = obj => {
	if (obj.booleanTitle && obj.checkForEmpty && !obj.sense.synonym && !obj.sense.opposite && obj.booleanExamles) {
		const item = new Render('Regular Block',
			'title', 'subtitle', 'sentence', 'text', 'icon', 'arg')
		item.title = obj.title
		item.subtitle = obj.subtitle
		item.sentence = obj.examples ? obj.examples : notFound
		item.text = {
			copy: obj.largetype,
			largetype: obj.largetype
		}
		item.icon = obj.examples ? './icons/flag.png' : './icons/red-flag.png'
		item.arg = obj.examples ? {
			definition: [`${obj.sense.lexical_unit ? obj.sense.lexical_unit : ''}<span class="neutral span"> [</span>${obj.sense.definition}<span class="neutral span">]</span>`],
			examples: obj.examples || null,
			sense: obj.sense
		} : obj.quicklookurl
		obj.items.push(item.getProperties())
	}
}

const grammaticalCom = obj => {
	const {sense, gramaticalExample} = obj
	let {item} = obj
	item = new Render('Grammatical Examples',
		'title', 'subtitle', 'sentence', 'icon', 'arg')
	item.title = sense.signpost ? `${sense.signpost} ⇒ ${gramaticalExample.pattern || sense.definition[0]}` : gramaticalExample.pattern || sense.definition[0]
	item.subtitle = sense.definition[0]
	item.sentence = gramaticalExample.examples ? gramaticalExample.examples : obj.examples ? obj.examples : notFound
	item.icon = gramaticalExample.examples || obj.examples ? './icons/gramatical.png' : './icons/red-gramatical.png'
	item.arg = gramaticalExample.examples || obj.examples ? {
		examples: gramaticalExample.examples ? gramaticalExample.examples : obj.examples ? obj.examples : null,
		definition: [`${sense.definition}${gramaticalExample.pattern ? `<span class="neutral span"> [</span>${gramaticalExample.pattern}<span class="neutral span">]</span>` : ''}`],
		sense
	} : obj.quicklookurl
	return item.getProperties()
}

const grammaticalSynAndOpp = (obj, $) => {
	const {sense, gramaticalExample, examples, quicklookurl} = obj
	let {item} = obj
	const title = `${gramaticalExample.pattern || sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${sense.synonym ? 'SYN' : 'OPP'}: ${sense.synonym || sense.opposite}`
	item = new Render('Words with Synonyms & opposites',
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

const seeAlso = obj => {
	const {sense, examples, quicklookurl, $} = obj
	const title = `${sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${sense.synonym ? 'SYN' : 'OPP'}: ${sense.synonym || sense.opposite}`
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
	return item.getProperties()
}

module.exports = (items, $, quicklookurl, commonExamples) => {
	if ($.senses) {
		for (const sense of $.senses) {
			const {checkForEmpty, booleanTitle, booleanExamles, title, subtitle} = objectOfSense(sense, $)
			const examples = exampleExist(sense, commonExamples, $)
			const largetype = getLargetype(sense, examples, title, subtitle)
			const objOfSenesParams = {booleanTitle, checkForEmpty, sense, booleanExamles, title, subtitle, items, largetype, examples, quicklookurl}
			regular(objOfSenesParams)

			/* ************************
			Grammatiacal examples
			************************ */
			if (sense.gramatical_examples) {
				items.push(...sense.gramatical_examples
					.map(gramaticalExample => {
						let item
						let result
						const obj = {sense, gramaticalExample, item, examples, quicklookurl}
						if (gramaticalExample.examples && (!sense.synonym && !sense.opposite)) {
							result = grammaticalCom(obj)
						}

						/* -----------------------------
						Show words: 'SEE ALSO' (syonym & opposite)
					  -------------------------------*/
						if (sense.synonym || sense.opposite) {
							result = grammaticalSynAndOpp(obj, $)
						}

						return result
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
					items.push(item.getProperties())
				}
			}

			// Show words: 'SEE ALSO' (syonym & opposite)
			const existSyn = examples && sense.synonym
			const existOpp = examples && sense.opposite
			if (existSyn || existOpp) {
				const obj = {sense, examples, quicklookurl, $}
				items.push(seeAlso(obj))
			}
		}
	}
}
