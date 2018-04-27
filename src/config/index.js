/* eslint camelcase: ["error", {properties: "never"}] */
const os = require('os')

const user = os.userInfo()
const {pathToAnkiMedia} = process.env
// const pathToAnkiMedia = '/Library/Application Support/Anki2/English/collection.media'
// console.log(user)

module.exports = {
	concurrency: 10,
	input: './src/input/header.json',
	body: './src/input/body.json',
	fields: {
		headword: 'Headword',
		audio: 'Audio',
		translation: 'Translation',
		example: 'Example',
		image: 'Image',
		verb_table: 'Verb_table',
		tag: 'Tag'
	},
	get mediaDir() {
		return user.homedir + pathToAnkiMedia
	},
	defaults: {
		'default-deck': 'default'
	}
}
