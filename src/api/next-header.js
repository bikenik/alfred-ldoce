/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-env es6 */
/* eslint max-depth: ["error", 8] */

const fs = require('fs')
const alfy = require('alfy')
const jsonfile = require('jsonfile')

const {wordOfURL} = process.env
alfy.config.set('wordOfURL', wordOfURL)

const url = 'http://api.pearson.com' + wordOfURL
const fileHeader = './src/input/header.json'
const fileBody = './src/input/body.json'
alfy.fetch(url).then(data => {
	const header = [
		{
			Headword: data.result.headword,
			Brit_audio: data.result.audio[0].url,
			Amer_audio: data.result.audio[1].url,
			Part_of_speech: data.result.part_of_speech,
			Register_label: data.result.register_label
		}
	]
	if (data.result.run_ons && !data.result.part_of_speech) {
		header[0].Part_of_speech = data.result.run_ons[0].part_of_speech
	}

	if (data.result.images) {
		header[0].Image = data.result.images.filter(image => /\.jpg$/.test(image.url)).length > 0 ? data.result.images.filter(image => /\.jpg$/.test(image.url))[0].url : data.result.images[0].url
	}

	if (data.result.gramatical_info) {
		header[0].Type_of_gramm = data.result.gramatical_info.type
	}

	if (data.result.lexical_unit) {
		header[0].Lexical_unit = data.lexical_unit
	}

	if (data.result.homnum) {
		header[0].Homnum = data.result.homnum
	}

	if (data.result.inflections) {
		header[0].Inflections = data.result.inflections[0]
	}

	if (data.result.geography) {
		header[0].Geography = data.result.geography
	}

	try {
		fs.unlinkSync(fileBody)
		process.stdout.write('successfully deleted: fileBody')
	} catch (error) {
		if (error.code !== 'ENOENT') {
			process.stderr.write(error)
		}
	}

	jsonfile.writeFile(fileHeader, header, {
		spaces: 2
	}, err => {
		if (err !== null) {
			console.error(err)
		}
	})
}
)
