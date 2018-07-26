/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-unused-vars */
/* eslint-parserOptions: {"ecmaVersion: 2017"} */
'use strict'
const fs = require('fs')
const request = require('request-promise')
const jsonfile = require('jsonfile')
const cheerio = require('cheerio')
const translate = require('google-translate-api')
const streamToPromise = require('stream-to-promise')
const pMap = require('p-map')
const ankiAddCard = require('./anki/anki-add-card')
const {canAddNotes} = require('./anki/anki-add-card')
const data = require('./api/mydata')
const verbTable = require('./api/verb-table')
const config = require('./config')

const {language} = process.env
let output

async function main() {
	setupDirStructure()
	const inputCollection = jsonfile.readFileSync(config.input)
	const cleanedInput = cleanInput(inputCollection)
	const check = await canAddNotes(cleanedInput)
	const output = check[0] ? await processInput(cleanedInput) : cleanedInput.map(x => {
		return [{
			Headword: `${x.Headword}${x.Homnum ? `<span class="HOMNUM-title">${
				x.Homnum.toString()}</span>` : ''}`,
			Audio: '',
			Translation: '',
			Example: '',
			Image: '',
			Verb_table: '',
			Tag: [x.Part_of_speech]
		}]
	})[0]
	await ankiAddCard(output)
}

function setupDirStructure() {
	fs.existsSync(config.mediaDir)
	// "console.log(chalk.green('Success your media folder path!', config.mediaDir))"
}

function cleanInput(input) {
	const deUndefinedArray = input.filter(card => {
		return card.Headword !== undefined
	})
	const deDupedArray = removeDuplicates(deUndefinedArray, config.fields.headword)
	return deDupedArray
}

async function processInput(input) {
	const mapper = async card => {
		const data = await getData(card)
		const modifiedCard = card
		Object.assign(modifiedCard, data)
		// "console.log(`Card processed: ${chalk.blue(card[config.fields.headword])}`)"
		return modifiedCard
	}

	const result = await pMap(input, mapper, {
		concurrency: config.concurrency
	})
	return result
}

async function getData(card) {
	const word = card[config.fields.headword].replace(/\s/g, '-')
	const ldoceDictPage = await request(
		'http://www.ldoceonline.com/dictionary/' + word
	)
	let $ = cheerio.load(ldoceDictPage)
	if (card.Homnum !== undefined && $('.dictentry')) {
		$ = cheerio.load($('.dictentry')[card.Homnum - 1])
	}
	if ($('.dictentry')[0]) {
		$ = cheerio.load($('.dictentry')[0])
	}

	// "console.log('getData: ' + word)"

	const {definitionForTranslate} = data.body
	let header = ''
	const headerReg = () => {
		header = `${$('.Head')}`
		const regex = /<span class="POS">.*?<\/span>|<span\sdata-src-mp3.*?<\/span>|<\/span>$/g
		return header.replace(regex, '')
	}
	if ($('.Head').length < 2) {
		header = headerReg()
	} else {
		header += `<span class="frequent Head"><span class="HWD">${
			card.Headword}</span><span class="HYPHENATION">${card.Headword} </span>`
	}

	/* -----------------------------
	AudioFileName
 -------------------------------*/

	const audioURLBre = 'http://api.pearson.com' + card.Brit_audio
	const audioURLAme = 'http://api.pearson.com' + card.Amer_audio

	const audioFileNameBre = word + '_bre.mp3'
	const audioFileNameAme = word + '_ame.mp3'
	const writeStreamBre = fs.createWriteStream(
		`${config.mediaDir}/${audioFileNameBre}`
	)
	const writeStreamAme = fs.createWriteStream(
		`${config.mediaDir}/${audioFileNameAme}`
	)
	request.get(audioURLBre).pipe(writeStreamBre)
	request.get(audioURLAme).pipe(writeStreamAme)
	await streamToPromise(writeStreamBre)
	await streamToPromise(writeStreamAme)
	writeStreamBre.end()
	writeStreamAme.end()
	const audioField = `${header}<span class="speaker brefile fa fa-volume-up">[sound:${audioFileNameBre}]</span><span class="speaker amefile fa fa-volume-up">[sound:${audioFileNameAme}]</span></span>`
	// Translation
	let translation = ''
	/* eslint-disable no-await-in-loop */
	for (let z = 0; z < definitionForTranslate.length; z++) {
		const translated = await translate(definitionForTranslate[z], {
			from: 'en',
			to: language
		})
		translation += translated.text + ' | '
	}
	/* eslint-enable no-await-in-loop */
	// "console.log(chalk.blue('Translate: '), translation)"

	// Format example
	const originalExample = card[config.fields.example]
	let example = originalExample

	let definition = ''
	for (let i = 0; i < data.body.definition.length; i++) {
		definition += `${data.body.definition[i]} | `
	}
	let image
	for (let i = 0; i < data.body.definitionForTranslate.length; i++) {
		example += `${data.body.definitionForTranslate[i]} | `
	}
	if (card.Image) {
		const imageFileName = `${word}_ldoce.jpg`
		image = `<img src="${imageFileName}" />`
		const imageUrlName = `http://api.pearson.com${card.Image}`
		const writeStreamImage = fs.createWriteStream(
			`${config.mediaDir}/${imageFileName}`
		)
		request.get(imageUrlName).pipe(writeStreamImage)
		await streamToPromise(writeStreamImage)
		writeStreamImage.end()
	} else {
		image = ''
	}
	if (!card.Part_of_speech) {
		card.Part_of_speech = ''
	}
	return {
		Audio: audioField,
		Translation: translation,
		Example: data.HTMLoutput,
		Image: image,
		Verb_table: verbTable.verbTable,
		Tag: card.Part_of_speech
	}
}

function removeDuplicates(myArr, prop) {
	return myArr.filter((obj, pos, arr) => {
		return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos
	})
}

main()
