/* eslint max-params: ["error", 8] */
/* eslint max-depth: ["error", 8] */
/* eslint complexity: ["error", 30] */
/* eslint-disable no-unused-vars */
/* eslint-env es6 */
'use strict'
const fs = require('fs')
const alfy = require('alfy')

const fileBody = './src/input/body.json'
const {wordOfURL} = process.env

try {
	fs.unlinkSync(fileBody) // delete file
	console.log('successfully deleted: fileBody')
} catch (err) {
	// handle the error
}

let url = 'http://api.pearson.com' + wordOfURL
if (wordOfURL === undefined) {
	url = 'http://api.pearson.com' + alfy.config.get('wordOfURL')
}

const warning = {
	notFound: `Not Found The Audio or Example  🤔`,
	notFoundCouse: `Current page of API should include the Audio with an example but it doesn't contain them.  Maybe a path to file is damaged.`
}
class Render {
	constructor(title, subtitle, sentence, icon, arg, valid = true, mods) {
		const clearSentences = sentence => sentence ? sentence.replace(/\s(\.|\?|!)/g, `$1`) : sentence
		sentence = clearSentences(sentence)
		if (arg) {
			arg.examples.forEach(sentence => {
				sentence.text = clearSentences(sentence.text)
			})
		}
		this.title = title
		this.subtitle = subtitle
		this.sentence = sentence
		this.path = icon
		this.arg = arg
		this.items = []
		this.text = {
			copy: `${title}\n\n🔑 :${subtitle} \n\n🎯 ${sentence}`,
			largetype: `${title}\n\n🔑 :${subtitle} \n\n🎯 ${sentence}`
		}
		this.icon = {path: icon}
		this.autocomplete = title
		this.valid = valid
		this.mods = mods
	}
	add(item) {
		this.items.push(item)
	}
}

const addToItems = new Render()

alfy.fetch(url).then(data => {
	const $ = data.result

	/* ************************
	Run-ons
	************************ */
	if ($.run_ons) {
		$.run_ons.forEach(runOn => {
			if (runOn.examples) {
				addToItems.add(
					new Render(
						runOn.derived_form,
						runOn.part_of_speech || runOn.examples[0].text,
						runOn.examples[0].text,
						'./icons/runon.png',
						{
							definition: [
								`${runOn.derived_form}<span class="neutral span"> [</span>${
								runOn.part_of_speech
								}<span class="neutral span">]</span>`
							],
							examples: runOn.examples,
							sense: runOn
						},
						null,
						null
					))
			}
		})
	}

	/* ************************
	Regular senses
	************************ */
	if ($.senses) {
		$.senses.forEach(sense => {
			if (sense.examples && sense.lexical_unit && !sense.synonym && !sense.opposite) {
				addToItems.add(
					new Render(
						sense.signpost || sense.lexical_unit || $.headword,
						sense.definition[0],
						sense.examples[0].text,
						'./icons/flag.png',
						{
							definition: [
								`${sense.lexical_unit}<span class="neutral span"> [</span>${
								sense.definition
								}<span class="neutral span">]</span>`
							],
							examples: sense.examples,
							sense: sense
						},
						null,
						null
					))
			}
			if (sense.examples && !sense.lexical_unit && !sense.synonym && !sense.opposite) {
				addToItems.add(
					new Render(
						sense.signpost || $.headword || sense.definition[0],
						sense.definition[0],
						sense.examples[0].text,
						'./icons/flag.png',
						{
							definition: sense.definition,
							examples: sense.examples,
							sense: sense
						},
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
								gramaticalExample.pattern ||
								sense.signpost ||
								sense.definition[0],
								sense.definition[0],
								gramaticalExample.examples[0].text,
								'./icons/gramatical.png',
								{
									examples: gramaticalExample.examples,
									definition: [
										`${sense.definition}<span class="neutral span"> [</span>${
										gramaticalExample.pattern
										}<span class="neutral span">]</span>`
									],
									sense: sense
								}
							))
					}

					// show words: 'SEE ALSO' (syonym & opposite)
					if (sense.synonym || sense.opposite) {
						let typeOfAddition
						for (const key in sense) {
							if (key === 'synonym') {
								typeOfAddition = key
							} else if (key === 'opposite') {
								typeOfAddition = key
							}
						}
						let title = `${gramaticalExample.pattern || sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${typeOfAddition}: ${sense.synonym || sense.opposite}`
						addToItems.add(
							new Render(
								title,
								sense.definition[0],
								gramaticalExample.examples[0].text,
								'./icons/gramatical.png',
								{
									examples: gramaticalExample.examples,
									definition: [
										`${sense.definition}<span class="neutral span"> [</span>${
										gramaticalExample.pattern
										}<span class="neutral span">]</span>`
									],
									sense: sense
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
								collExample.collocation || sense.definition[0],
								sense.definition[0],
								collExample.example.text,
								'./icons/collocation.png',
								{
									examples: [collExample.example],
									definition: [
										`${sense.definition}<span class="neutral span"> [</span>${
										collExample.collocation
										}<span class="neutral span">]</span>`
									],
									sense: sense
								},
								null,
								null
							))
					}
				})
			}

			// show words: 'SEE ALSO' (syonym & opposite)
			let existSyn = sense.examples && sense.synonym
			let existOpp = sense.examples && sense.opposite
			if (existSyn || existOpp) {
				let typeOfAddition
				for (const key in sense) {
					if (key === 'synonym') {
						typeOfAddition = key
					} else if (key === 'opposite') {
						typeOfAddition = key
					}
				}
				let title = `${sense.signpost || $.headword || sense.definition[0]}\t 🔦 ${typeOfAddition}: ${sense.synonym || sense.opposite}`
				addToItems.add(
					new Render(
						title,
						sense.definition[0],
						sense.examples[0].text,
						'./icons/flag.png',
						{
							definition: sense.definition,
							examples: sense.examples,
							sense: sense
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
			if (!addToItems.items[0] && sense.definition && $.examples) {
				let examples = []
				for (let i = 0; i < $.examples.length && i < 3; i++) {
					examples.push($.examples[i])
				}
				addToItems.add(
					new Render(
						$.headword,
						sense.definition[0],
						$.examples[0].text,
						'./icons/flag.png',
						{
							definition: sense.definition,
							examples: examples,
							sense: sense
						},
						null,
						null
					))
			}

			/* ************************
			Conditions for case without examples
			************************ */
			if (!addToItems.items[0] && sense.definition) {
				addToItems.items.push({
					title: $.headword,
					subtitle: sense.definition[0],
					text: {
						copy: `🔑 ${sense.definition[0]}`,
						largetype: `🔑 ${sense.definition[0]}\n\n🎲 API not exist examples, so the card won't created.\nHint the Enter to go to ldoce.com`
					},
					icon: {
						path: './icons/warning.png'
					},
					arg: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(
						/\s/g,
						'-'
					)}`
				})
			}
		})
	}

	const items = addToItems.items.filter(item => addToItems.items)

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
			word: data.result.headword.toUpperCase()
		},
		autocomplete: x.title,
		quicklookurl: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(/\s/g, '-')}`,
		mods: x.mods
	}))

	try {
		let test = addToItems.items[0].title
	} catch (err) {
		variantsToSingleChoose.push({
			title: warning.notFound,
			subtitle: warning.notFoundCouse,
			text: {
				copy: warning.notFound,
				largetype: warning.notFoundCouse
			},
			arg: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(/\s/g, '-')}`,
			icon: {
				path: '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'
			},
			quicklookurl: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(/\s/g, '-')}`
		})
	}

	alfy.output(variantsToSingleChoose)

	const variantsAll = alfy.inputMatches(items, 'title').map(x => ({
		arg: x.arg,
		variables: {word: `${data.result.headword}`}
	}))

	let variantsAllExp = []
	for (let i = 0; i < variantsAll.length; i++) {
		variantsAllExp.push(variantsAll[i].arg)
	}
	alfy.config.set('allPhrases', variantsAllExp)
})
