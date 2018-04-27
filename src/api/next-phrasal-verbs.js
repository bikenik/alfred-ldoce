/* eslint max-depth: ["error", 8] */
/* eslint-disable no-unused-vars */
'use strict'
const alfy = require('alfy')
const headers = require('../input/header.json')

const {wordOfURL} = process.env

const url = 'http://api.pearson.com' + wordOfURL
const warning = {
	notFound: 'Not found Phrasal Verbs  🤔',
	notFoundCouse: `Press ⇧⌅ to turn back for "${headers[0].Headword.toUpperCase()}" (${headers[0].Part_of_speech})`
}
const items = []
alfy.fetch(url).then(data => {
	const $ = data.result
	if ($.phrasal_verbs) {
		$.phrasal_verbs.forEach(phrasalVerbs => {
			if (phrasalVerbs.senses) {
				phrasalVerbs.senses.forEach(sense => {
					if (sense.examples) {
						items.push({
							title: phrasalVerbs.headword,
							subtitle: sense.definition[0],
							arg: {
								definition: [
									`<span class="neutral span">[</span>${
									phrasalVerbs.headword
									}<span class="neutral span">] </span>${sense.definition}`
								],
								examples: sense.examples,
								sense: sense
							},
							text: {
								copy: sense.definition[0],
								largetype: `🔑 :${sense.definition[0]}\n\n🎯 ${sense.examples[0].text}`
							},
							icon: {path: './icons/phrasal_verbs.png'}
						})
					}
					if (sense.gramatical_examples) {
						sense.gramatical_examples.forEach(gramaticalExample => {
							if (gramaticalExample.examples) {
								items.push({
									title: gramaticalExample.pattern,
									subtitle: sense.definition[0],
									arg: {
										examples: gramaticalExample.examples,
										definition: [
											`<span class="neutral span">[</span>${
											phrasalVerbs.headword
											}<span class="neutral span">] </span>> ${sense.definition} [${
											gramaticalExample.pattern
											}]`
										],
										sense: sense
									},
									text: {
										copy: gramaticalExample.examples[0].text,
										largetype: `🔑 :${sense.definition[0]}\n\n🎯${gramaticalExample.examples[0].text}`
									},
									valid: true,
									icon: {path: './icons/gramatical.png'}
								})
							}
						})
					}
				})
				if (phrasalVerbs.variants) {
					items[items.length - 1].arg.sense.variants = phrasalVerbs.variants
				}
			}
		})
	}

	const elements = []
	// elements.push(header)
	for (let i = 0; i < items.length; i++) {
		if (items[i] !== undefined) {
			elements.push(items[i])
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
		autocomplete: x.title
	}))

	try {
		let test = items[0].title
	} catch (err) {
		variantsToSingleChoose.push({
			title: warning.notFound,
			subtitle: warning.notFoundCouse,
			text: {
				copy: warning.notFound,
				largetype: warning.notFoundCouse
			},
			icon: {
				path: '/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/AlertStopIcon.icns'
			},
			quicklookurl: `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(
				/\s/g,
				'-'
			)}`,
			valid: false,
			mods: {
				shift: {
					subtitle: 'Turn back'
				}
			}
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
