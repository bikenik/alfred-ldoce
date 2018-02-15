/* eslint camelcase: ["error", {properties: "never"}] */
const mainDataExp = require('./input/body.json');
const header = require('./input/header.json');

const body = {
	definitionForTranslate: [],
	definition: [],
	audioExamples: [],
	lexicalUnit: [],
	registerLabel: []
};

function removeDuplicates(arr) {
	let uniqueArray = [];
	let data = [];
	arr.forEach(elem => {
		if (uniqueArray.indexOf(elem.examples[0].text) === -1) {
			uniqueArray.push(elem.examples[0].text);
			data.push(elem);
		}
	});
	return data;
}
const mainData = removeDuplicates(mainDataExp);

for (let i = 0; i < mainData.length; i++) {
	const sense = mainData[i].sense;
	let options = '';
	if (sense.signpost) {
		options += `<span class="SIGNPOST">${sense.signpost}</span>`;
	}
	if (sense.gramatical_info) {
		options += `<span class="GRAM"><span class="neutral span"> [</span>${
			sense.gramatical_info.type
			}<span class="neutral span">]</span></span>`;
	}
	if (header[0].Type_of_gramm && !sense.gramatical_info) {
		options += `<span class="GRAM"><span class="neutral span"> [</span>${
			header[0].Type_of_gramm
			}<span class="neutral span">]</span></span>`;
	}

	if (sense.opposite) {
		options += `<span class="OPP"> <span class="synopp span">OPP</span> ${
			sense.opposite
			}</span>`;
	}
	if (sense.synonym) {
		options += `<span class="SYN"> <span class="synopp span">SYN</span> ${
			sense.synonym
			}</span>`;
	}
	let options2 = '';
	if (sense.geography) {
		options2 += `<span class="GEO"> ${sense.geography}</span>`;
	}
	if (header[0].Geography) {
		options2 += `<span class="GEO"> ${header[0].Geography}</span>`;
	}

	if (sense.register_label) {
		options2 += `<span class="REGISTERLAB"> ${sense.register_label}</span>`;
	}
	if (header[0].Register_label) {
		options2 += `<span class="REGISTERLAB"> ${header[0].Register_label}</span>`;
	}

	if (sense.variants) {
		if (sense.variants[0].link_word) {
			options2 += `<span class="neutral span">(</span><span class="LINKWORD">${
				sense.variants[0].link_word
				}</span>`;
		}
		if (sense.variants[0].lexical_variant) {
			options2 += `<span class="LEXVAR"> ${
				sense.variants[0].lexical_variant
				}</span>`;
		}
		if (sense.variants[0].lang) {
			options2 += `<span class="geo span"> ${
				sense.variants[0].lang
				}</span><span class="neutral span">)</span>`;
		}
	}
	if (options2 !== '') {
		options += `<br>${options2}`;
	}
	mainData[i].definition[0] = `${options}<br>${mainData[i].definition[0]}`;

	if (sense.related_words) {
		sense.related_words.forEach((word, index) => {
			if (index > 0) {
				mainData[i].definition[0] += `
        <span class="RELATEDWD"> ,<a class="defRef" title="${word}" href="https://www.ldoceonline.com/dictionary/${word}">${word}</a></span>
        `;
			} else {
				mainData[i].definition[0] += `
      <span class="RELATEDWD"><span class="neutral span"> → </span>
      <a class="defRef" title="${word}" href="https://www.ldoceonline.com/dictionary/${word}">${word}</a></span>
      `;
			}
		});
	}
}

for (let i = 0; i < mainData.length; i++) {
	body.lexicalUnit.push(mainData[i].lexical_unit);
	body.registerLabel.push(mainData[i].register_label);
	if (mainData[i].definition) {
		for (let y = 0; y < mainData[i].definition.length; y++) {
			body.definition.push(mainData[i].definition[y]);
		}
	}

	if (mainData[i].examples && mainData[i].headword === undefined) {
		for (let x = 0; x < mainData[i].examples.length; x++) {
			// const element = $.examples[x];
			body.definitionForTranslate.push(mainData[i].examples[x].text);
			for (let z = 0; z < mainData[i].examples[x].audio.length; z++) {
				body.audioExamples.push(mainData[i].examples[x].audio[z].url);
			}
		}
	}
}

let HTMLoutput = '';
for (let i = 0; i < mainData.length; i++) {
	let data = mainData[i];
	if (data.definition) {
		HTMLoutput += `<span class="newline Sense"><span class="DEF">${
			data.definition[0]
			}</span>`;
	}
	if (data.examples && data.headword === undefined) {
		for (let x = 0; x < data.examples.length; x++) {
			HTMLoutput += `<span class="EXAMPLE"><span class="speaker exafile fa fa-volume-up">${
				data.examples[x].audio[0].url
				}</span>${data.examples[x].text}</span>`;
			// console.log("examle: ", x);
		}
	}

	HTMLoutput += `</span>`;
}
const regex = /\/v2\/.*?exa_pron\/(.*?mp3)/g;
const subst = `[sound:$1]`;
HTMLoutput = HTMLoutput.replace(regex, subst);

module.exports = {
	body,
	HTMLoutput
};
