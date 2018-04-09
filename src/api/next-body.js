/* eslint max-depth: ["error", 8] */
/* eslint complexity: ["error", 30] */
/* eslint max-params: ["error", 6] */
/* eslint-disable no-unused-vars */
/* eslint-env es6 */
'use strict'
const alfy = require('alfy')
const utils = require('../utils')

const url = 'http://api.pearson.com' + utils.wordOfURL
const warning = {
	notFound: `Not Found The Audio or Example  🤔`,
	notFoundCouse: `Current page of API should include the Audio with an example but it doesn't contain them.  Maybe a path to file is damaged.`
}
function Render(title, subtitle, sentence, path, arg) {
	this.title = title
	this.subtitle = subtitle
	this.sentence = sentence
	this.path = path
	this.arg = arg
	this.items = []
	this.text = {
		copy: subtitle,
		largetype: `🔑 :${subtitle} \n\n🎯 ${sentence}`
	}
	this.icon = {path: path}
	this.autocomplete = title
}

Render.prototype.add = function (item) {
	this.items.push(item)
}
const addToItems = new Render()

alfy.fetch(url).then(data => {
	const $ = data.result
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
						}
					))
			}
		})
	}
	if ($.senses) {
		$.senses.forEach(sense => {
			if (sense.examples !== undefined && sense.lexical_unit) {
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
						}
					))
			}
			if (sense.examples && !sense.lexical_unit) {
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
						}
					))
			}

			if (sense.gramatical_examples) {
				for (let i = 0; i < sense.gramatical_examples.length; i++) {
					if (sense.gramatical_examples[i].examples) {
						addToItems.add(
							new Render(
								sense.gramatical_examples[i].pattern ||
								sense.signpost ||
								sense.definition[0],
								sense.definition[0],
								sense.gramatical_examples[i].examples[0].text,
								'./icons/gramatical.png',
								{
									examples: sense.gramatical_examples[i].examples,
									definition: [
										`${sense.definition}<span class="neutral span"> [</span>${
										sense.gramatical_examples[i].pattern
										}<span class="neutral span">]</span>`
									],
									sense: sense
								}
								// valid = true,
							))
					}
				}
			}

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
								}
								// valid: false,
								// autocomplete = collExample.collocation,
							))
					}
				})
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
						}
					))
			}
			if (!addToItems.items[0] && sense.definition) {
				addToItems.items.push({
					title: $.headword,
					subtitle: sense.definition[0],
					text: {
						copy: `🔑 ${sense.definition[0]}`,
						largetype: `🔑 ${sense.definition[0]}\n\n🎲 It's not exist examples, so the card won't created.\nHint the Enter to go ldoce.com`
					},
					icon: {
						path: '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'
					},
					arg: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(
						/\s/g,
						'-'
					)}`

				})
			}
		})
	}

	const elements = []
	for (let i = 0; i < addToItems.items.length; i++) {
		if (addToItems.items[i] !== undefined) {
			elements.push(addToItems.items[i])
		}
	}
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
			word: data.result.headword.toUpperCase()
		},
		autocomplete: x.title,
		quicklookurl: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(
			/\s/g,
			'-'
		)}`
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
			arg: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(
				/\s/g,
				'-'
			)}`,
			icon: {
				path: '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'
			},
			quicklookurl: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(
				/\s/g,
				'-'
			)}`
		})
	}

	alfy.output(variantsToSingleChoose)

	const variantsAll = alfy.inputMatches(elements, 'title').map(x => ({
		arg: x.arg,
		variables: {word: `${data.result.headword}`}
	}))

	let variantsAllExp = []
	for (let i = 0; i < variantsAll.length; i++) {
		variantsAllExp.push(variantsAll[i].arg)
	}
	alfy.config.set('allPhrases', variantsAllExp)
})
