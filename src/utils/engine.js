/* eslint max-params: ["error", 9] */
'use strict'
module.exports = class Render {
	constructor(title, subtitle, sentence, text, icon, arg, valid, mods, variables = null) {
		const clearSentences = argSentence => argSentence.replace(/\s(\.|\?|!)/g, `$1`)
		let largetype
		if (sentence && arg) {
			sentence = Array.isArray(sentence) ? sentence.map(x => clearSentences(x.text)) : clearSentences(sentence)
			largetype = `${title}${arg.sense && arg.sense.register_label ? ` ⇒ [${arg.sense.register_label}]` : ''}\n\n🔑 :${subtitle}${Array.isArray(sentence) ? `\n\n🎯 ${sentence.map(x => x).join('\n🎯 ')}` : `\n\n🎯 ${sentence}`}`
		}
		if (arg && arg.examples) {
			arg.examples.forEach(example => {
				if (example.text) {
					example.text = clearSentences(example.text)
				}
			})
		}
		this.title = title
		this.subtitle = subtitle
		this.sentence = sentence
		this.path = icon
		this.arg = arg
		this.items = []
		this.text = text ? text : {copy: largetype, largetype}
		this.icon = {path: icon}
		this.autocomplete = `${process.env.inputInfo}\u2023 ${title}`
		this.valid = valid ? valid : true
		this.mods = mods ? mods : {
			ctrl: {
				valid: false
			}
		}
		this.variables = variables
	}

	add(item) {
		this.items.push(item)
	}
}

module.exports.warning = {
	notFound: `\n\n🎯 does not offer examples\n\n🎲 API not exist examples, so the card won't created.\nHint the Enter to go to ldoce.com`,
	notFoundCouse: `Current page of API should include the Audio with an example but it doesn't contain them.  Maybe a path to file is damaged.`
}
