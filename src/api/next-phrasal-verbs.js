/* eslint max-depth: ["error", 8] */
/* eslint-disable no-unused-vars */
'use strict'
const fs = require('fs')
const alfy = require('alfy')
const headers = require('../input/header.json')

const fileBody = './src/input/body.json'
const {wordOfURL} = process.env
// "" const wordOfURL = '/v2/dictionaries/entries/cqAFMyPFGC'
try {
	fs.unlinkSync(fileBody)
	console.log('successfully deleted: fileBody')
} catch (err) {
}

let url = 'http://api.pearson.com' + wordOfURL
if (wordOfURL === undefined) {
	url = 'http://api.pearson.com' + alfy.config.get('wordOfURL')
}
const warning = {
	notFound: 'Not found Phrasal Verbs  🤔',
	notFoundCouse: `Press ⌃+↵ to turn back for "${headers[0].Headword.toUpperCase()}" (${headers[0].Part_of_speech})`
}

const items = []
/* eslint-disable promise/prefer-await-to-then */
alfy.fetch(url).then(data => {
	const $ = data.result
	const quicklookurl = `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(/\s/g, '-')}`
	if ($.phrasal_verbs) {
		const notFound = `\n\n🎲 API not exist examples, so the card won't created.\nHint the Enter to go to ldoce.com`
		const notDefinition = '_'
		$.phrasal_verbs.forEach(phrasalVerbs => {
			if (phrasalVerbs.senses) {
				phrasalVerbs.senses.forEach(sense => {
					if (sense.examples || sense.definition) {
						const definition = sense.definition ? sense.definition[0] : notDefinition
						const example = sense.examples ? sense.examples[0].text : notFound
						const largetype = `${phrasalVerbs.headword}\n\n🔑 :${definition}\n\n🎯 ${example}`
						items.push({
							title: phrasalVerbs.headword,
							subtitle: sense.definition[0],
							arg: sense.examples ? {
								definition: sense.definition ? [`<span class="neutral span">[</span>${phrasalVerbs.headword}<span class="neutral span">] </span>${sense.definition}`] : notDefinition,
								examples: sense.examples ? sense.examples : notFound,
								sense
							} : `https://www.ldoceonline.com/dictionary/${data.result.headword.replace(/\s/g, '-')}`,
							text: {
								copy: largetype,
								largetype
							},
							icon: sense.examples ? {path: './icons/phrasal_verbs.png'} : {path: './icons/red/phrasal_verbs.png'}
						})
						if (sense.gramatical_examples) {
							sense.gramatical_examples.forEach(gramaticalExample => {
								if (gramaticalExample.examples) {
									const largetype = `${gramaticalExample.pattern}\n\n🔑 :${sense.definition[0]}\n\n🎯${gramaticalExample.examples[0].text}`
									items.push({
										title: gramaticalExample.pattern,
										subtitle: sense.definition[0],
										arg: {
											examples: gramaticalExample.examples,
											definition: [`<span class="neutral span">[</span>${phrasalVerbs.headword}<span class="neutral span">] </span>> ${sense.definition} [${gramaticalExample.pattern}]`],
											sense
										},
										text: {
											copy: largetype,
											largetype
										},
										valid: true,
										icon: {path: './icons/gramatical.png'}
									})
								}
							})
						}
					}
				})
				if (phrasalVerbs.variants) {
					items[items.length - 1].arg.sense.variants = phrasalVerbs.variants
				}
			}
		})
	}

	const elements = []
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
			word: data.result.headword.toUpperCase(),
			currentSense: x.text.largetype
		},
		autocomplete: x.title,
		quicklookurl
	}))

	try {
		const test = items[0].title
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
			quicklookurl,
			valid: false,
			mods: {
				ctrl: {
					subtitle: 'Turn back'
				}
			}
		})
	}

	alfy.output(variantsToSingleChoose)

	const variantsAll = alfy.inputMatches(elements, 'title').map(x => ({
		arg: x.arg,
		variables: {word: `${data.result.headword}`}
	})).filter(x => x.arg.examples)

	const variantsAllArgs = variantsAll.map(x => x.arg)
	alfy.config.set('allPhrases', variantsAllArgs)
})
/* eslint-enable promise/prefer-await-to-then */
