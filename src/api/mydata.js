/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint complexity: ["error", 22] */
const md5 = require('md5')
const mainDataExp = require('../input/body.json')
const header = require('../input/header.json')

const body = {
	definitionForTranslate: [],
	definition: [],
	audioExamples: [],
	lexicalUnit: [],
	audioFileName: [],
	registerLabel: []
}

function removeDuplicates(arr) {
	let uniqueArray = []
	let data = []
	arr.forEach(elem => {
		if (uniqueArray.indexOf(elem.examples[0].text) === -1) {
			uniqueArray.push(elem.examples[0].text)
			data.push(elem)
		}
	})
	return data
}
const mainData = removeDuplicates(mainDataExp)

mainData.forEach(sense => {
	let options = ''
	if (sense.signpost) {
		options += `<span class="SIGNPOST">${sense.signpost}</span>`
	}
	if (sense.gramatical_info) {
		options += `<span class="GRAM"><span class="neutral span"> [</span>${
			sense.gramatical_info.type
			}<span class="neutral span">]</span></span>`
	}
	if (header[0].Type_of_gramm && !sense.gramatical_info) {
		options += `<span class="GRAM"><span class="neutral span"> [</span>${
			header[0].Type_of_gramm
			}<span class="neutral span">]</span></span>`
	}

	if (sense.opposite) {
		options += `<span class="OPP"> <span class="synopp span">OPP</span> ${
			sense.opposite
			}</span>`
	}
	if (sense.synonym) {
		options += `<span class="SYN"> <span class="synopp span">SYN</span> ${
			sense.synonym
			}</span>`
	}
	let options2 = ''
	if (sense.geography) {
		options2 += `<span class="GEO"> ${sense.geography}</span>`
	}
	if (header[0].Geography) {
		options2 += `<span class="GEO"> ${header[0].Geography}</span>`
	}

	if (sense.register_label) {
		options2 += `<span class="REGISTERLAB"> ${sense.register_label}</span>`
	}
	if (header[0].Register_label) {
		options2 += `<span class="REGISTERLAB"> ${header[0].Register_label}</span>`
	}

	if (sense.variants) {
		if (sense.variants[0].link_word && sense.variants[0].spelling_variant) {
			options2 += `<span class="neutral span">(</span><span class="LINKWORD">${
				sense.variants[0].link_word
				}</span><span class="ORTHVAR"> ${sense.variants[0].spelling_variant}</span><span class="neutral span">)</span>`
		}
		if (sense.variants[0].lexical_variant) {
			options2 += `<span class="LEXVAR"> ${
				sense.variants[0].lexical_variant
				}</span>`
		}
		if (sense.variants[0].lang) {
			options2 += `<span class="geo span"> ${
				sense.variants[0].lang
				}</span><span class="neutral span">)</span>`
		}
	}
	if (sense.american_equivalent) {
		options2 += `<br><b>${sense.american_equivalent}</b><span class="geo span"> American English</span>`
	}
	if (options2 !== '') {
		options += `<br>${options2}`
	}
	sense.definition[0] = `${options}<br>${sense.definition[0]}`

	if (sense.related_words) {
		sense.related_words.forEach((word, index) => {
			if (index > 0) {
				sense.definition[0] += `
        <span class="RELATEDWD"> ,<a class="defRef" title="${word}" href="https://www.ldoceonline.com/dictionary/${word}">${word}</a></span>
        `
			} else {
				sense.definition[0] += `
      <span class="RELATEDWD"><span class="neutral span"> → </span>
      <a class="defRef" title="${word}" href="https://www.ldoceonline.com/dictionary/${word}">${word}</a></span>
      `
			}
		})
	}

	body.lexicalUnit.push(sense.lexical_unit)
	body.registerLabel.push(sense.register_label)
	if (sense.definition) {
		for (let y = 0; y < sense.definition.length; y++) {
			body.definition.push(sense.definition[y])
		}
	}

	if (sense.examples && sense.examples[0].audio && sense.headword === undefined) {
		sense.examples.forEach(example => {
			// const element = $.examples[x]
			body.definitionForTranslate.push(example.text)
			for (let z = 0; z < example.audio.length; z++) {
				body.audioExamples.push(example.audio[z].url)
			}
		})
	}
	if (sense.examples && !sense.examples[0].audio && sense.headword === undefined) {
		for (let x = 0; x < sense.examples.length; x++) {
			body.definitionForTranslate.push(sense.examples[x].text)
		}
	}
})

let HTMLoutput = ''
mainData.forEach(data => {
	if (data.definition) {
		HTMLoutput += `<span class="newline Sense"><span class="DEF">${
			data.definition[0]
			}</span>`
	}
	if (data.examples && data.examples[0].audio && data.headword === undefined) {
		data.examples.forEach(example => {
			HTMLoutput += `<span class="EXAMPLE"><span class="speaker exafile fa fa-volume-up">${
				example.audio[0].url
				}</span>${example.text}</span>`
		})
	}
	if (data.examples && !data.examples[0].audio && data.headword === undefined) {
		data.examples.forEach(example => {
			let id = md5(example.text)
			HTMLoutput += `<span class="EXAMPLE"><span class="speaker exafile fa fa-volume-up">[sound:${id}.mp3]</span>${example.text}</span>`
			body.audioFileName.push(`${id}.mp3`)
		})
	}
	HTMLoutput += `</span>`
})

const regex = /\/v2\/.*?exa_pron\/(.*?mp3)/g
const subst = `[sound:$1]`
HTMLoutput = HTMLoutput.replace(regex, subst)

module.exports = {
	body,
	HTMLoutput
}
