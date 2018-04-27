/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint complexity: ["error", 24] */
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

mainData.forEach(data => {
	let options = ''
	if (data.sense.signpost) {
		options += `<span class="SIGNPOST">${data.sense.signpost}</span>`
	}
	if (data.sense.gramatical_info) {
		options += `<span class="GRAM"><span class="neutral span"> [</span>${
			data.sense.gramatical_info.type
			}<span class="neutral span">]</span></span>`
	}
	if (header[0].Type_of_gramm && !data.sense.gramatical_info) {
		options += `<span class="GRAM"><span class="neutral span"> [</span>${
			header[0].Type_of_gramm
			}<span class="neutral span">]</span></span>`
	}

	if (data.sense.opposite) {
		options += `<span class="OPP"> <span class="synopp span">OPP</span> ${
			data.sense.opposite
			}</span>`
	}
	if (data.sense.synonym) {
		options += `<span class="SYN"> <span class="synopp span">SYN</span> ${
			data.sense.synonym
			}</span>`
	}
	let options2 = ''
	if (data.sense.geography) {
		options2 += `<span class="GEO"> ${data.sense.geography}</span>`
	}
	if (header[0].Geography) {
		options2 += `<span class="GEO"> ${header[0].Geography}</span>`
	}

	if (data.sense.register_label) {
		options2 += `<span class="REGISTERLAB"> ${data.sense.register_label}</span>`
	}
	if (header[0].Register_label) {
		options2 += `<span class="REGISTERLAB"> ${header[0].Register_label}</span>`
	}

	if (data.sense.variants) {
		if (data.sense.variants[0].link_word) {
			options2 += `<span class="neutral span">(</span><span class="LINKWORD">${
				data.sense.variants[0].link_word
				}</span><span class="neutral span">)</span>`
		}
		if (data.sense.variants[0].spelling_variant) {
			options2 += `<span class="neutral span">(</span><span class="ORTHVAR"> ${data.sense.variants[0].spelling_variant}</span><span class="neutral span">)</span>`
		}
		if (data.sense.variants[0].lexical_variant) {
			options2 += `<span class="LEXVAR"> ${
				data.sense.variants[0].lexical_variant
				}</span>`
		}
		if (data.sense.variants[0].lang) {
			options2 += `<span class="neutral span">(</span><span class="geo span"> ${
				data.sense.variants[0].lang
				}</span><span class="neutral span">)</span>`
		}
	}
	if (data.sense.american_equivalent) {
		options2 += `<br><b>${data.sense.american_equivalent}</b><span class="geo span"> American English</span>`
	}
	if (options2 !== '') {
		options += `<br>${options2}`
	}
	data.definition[0] = `${options}<br>${data.definition[0]}`

	if (data.sense.related_words) {
		data.sense.related_words.forEach((word, index) => {
			if (index > 0) {
				data.sense.definition[0] += `
        <span class="RELATEDWD"> ,<a class="defRef" title="${word}" href="https://www.ldoceonline.com/dictionary/${word}">${word}</a></span>
        `
			} else {
				data.sense.definition[0] += `
      <span class="RELATEDWD"><span class="neutral span"> → </span>
      <a class="defRef" title="${word}" href="https://www.ldoceonline.com/dictionary/${word}">${word}</a></span>
      `
			}
		})
	}

	body.lexicalUnit.push(data.sense.lexical_unit)
	body.registerLabel.push(data.sense.register_label)
	if (data.sense.definition) {
		for (let y = 0; y < data.sense.definition.length; y++) {
			body.definition.push(data.sense.definition[y])
		}
	}

	if (data.examples && data.examples[0].audio) {
		data.examples.forEach(example => {
			body.audioExamples.push(example.audio[0].url)
			body.definitionForTranslate.push(example.text)
		})
	}

	if (!data.sense.examples && !data.sense.gramatical_examples && data.examples && !data.examples[0].audio && data.sense.headword === undefined) {
		data.examples.forEach(example => {
			body.definitionForTranslate.push(example.text)
		})
	}
	if (data.sense.examples && !data.sense.examples[0].audio && data.sense.headword === undefined) {
		for (let x = 0; x < data.sense.examples.length; x++) {
			body.definitionForTranslate.push(data.sense.examples[x].text)
		}
	}
})
body.definitionForTranslate.forEach((clearText, i) => {
	body.definitionForTranslate[i] = clearText.replace(/([a-z])\(/, `$1 (`)
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
