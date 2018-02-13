/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-unused-vars */
'use strict';
const fs = require('fs');
const request = require('request-promise');
const jsonfile = require('jsonfile');
const cheerio = require('cheerio');
const translate = require('google-translate-api');
const streamToPromise = require('stream-to-promise');
const pMap = require('p-map');
const chalk = require('chalk');
const ankiConnect = require('./anki-connect.js');
const data = require('./mydata.js');
const verbTable = require('./verb-table.js');
// Config file
const config = require('./config/config.js');

const {language} = process.env;
let output;

main();

async function main() {
	setupDirStructure();
	let inputCollection = jsonfile.readFileSync(config.input);
	let cleanedInput = cleanInput(inputCollection);
	let output = await processInput(cleanedInput);
	await ankiConnect(output);
}

function setupDirStructure() {
	fs.existsSync(config.mediaDir);
	console.log(chalk.green('Success your media folder path!', config.mediaDir));
}

function cleanInput(input) {
	let deUndefinedArray = input.filter(card => {
		return card.Headword !== undefined;
	});
	let deDupedArray = removeDuplicates(deUndefinedArray, config.fields.headword);
	return deDupedArray;
}

async function processInput(input) {
	const mapper = async card => {
		let data = await getData(card);
		let modifiedCard = card;
		Object.assign(modifiedCard, data);
		console.log(`Card processed: ${chalk.blue(card[config.fields.headword])}`);
		return modifiedCard;
	};

	let result = await pMap(input, mapper, {
		concurrency: config.concurrency
	});
	return result;
}

async function getData(card) {
	let word = card[config.fields.headword].replace(/\s/g, '-');
	let ldoceDictPage = await request(
		'http://www.ldoceonline.com/dictionary/' + word
	);
	let $ = cheerio.load(ldoceDictPage);
	if (card.Homnum !== undefined && $('.dictentry')) {
		$ = cheerio.load($('.dictentry')[card.Homnum - 1]);
	}
	if ($('.dictentry')[0]) {
		$ = cheerio.load($('.dictentry')[0]);
	}

	console.log('getData: ' + word);

	let definitionForTranslate = data.body.definitionForTranslate;
	let header = '';
	const headerReg = () => {
		// let frequentHeader = $('.Head');
		header = `${$('.Head')}`;
		const regex = /<span class="POS">.*?<\/span>|<span\sdata-src-mp3.*?<\/span>|<\/span>$/g;
		return header.replace(regex, '');
	};
	if ($('.Head').length < 2) {
		header = headerReg();
	} else {
		header += `<span class="frequent Head"><span class="HWD">${
			card.Headword
			}</span><span class="HYPHENATION">${card.Headword} </span>`;
	}

	// audio

	let audioAttrExp = [];

	let audioURLExp = data.body.audioExamples;
	let audioFileNameExp = [];
	let writeStreamExp = [];
	let audioExp = '';
	const regex = /.*exa_pron\/(.*)/;
	const subst = `$1`;
	for (let i = 0; i < audioURLExp.length; i++) {
		audioFileNameExp[i] = audioURLExp[i].replace(regex, subst);
		writeStreamExp[i] = fs.createWriteStream(
			`${config.mediaDir}/${audioFileNameExp[i]}`
		);
		request
			.get(`http://api.pearson.com${audioURLExp[i]}`)
			.pipe(writeStreamExp[i]);
		await streamToPromise(writeStreamExp[i]);
		writeStreamExp[i].end();
		audioExp += `[sound:${audioFileNameExp[i]}]`;
		console.log(audioExp);
	}

	let audioURLBre = 'http://api.pearson.com' + card.Brit_audio;
	let audioURLAme = 'http://api.pearson.com' + card.Amer_audio;

	let audioFileNameBre = word + '_bre.mp3';
	let audioFileNameAme = word + '_ame.mp3';
	let writeStreamBre = fs.createWriteStream(
		`${config.mediaDir}/${audioFileNameBre}`
	);
	let writeStreamAme = fs.createWriteStream(
		`${config.mediaDir}/${audioFileNameAme}`
	);
	request.get(audioURLBre).pipe(writeStreamBre);
	request.get(audioURLAme).pipe(writeStreamAme);
	await streamToPromise(writeStreamBre);
	await streamToPromise(writeStreamAme);
	writeStreamBre.end();
	writeStreamAme.end();
	let audioBre = `[sound:${audioFileNameBre}]`;
	let audioAme = `[sound:${audioFileNameAme}]`;
	let audioField = `${header}<span class="speaker brefile fa fa-volume-up">[sound:${audioFileNameBre}]</span><span class="speaker amefile fa fa-volume-up">[sound:${audioFileNameAme}]</span></span>`;
	// translation
	let translation = '';
	for (let z = 0; z < definitionForTranslate.length; z++) {
		let translated = await translate(definitionForTranslate[z], {
			from: 'en',
			to: language
		});
		translation += translated.text + ' | ';
	}
	console.log(chalk.blue('Translate: '), translation);

	// format example
	let originalExample = card[config.fields.example];
	let example = originalExample;

	let definition = '';
	for (let i = 0; i < data.body.definition.length; i++) {
		definition += `${data.body.definition[i]} | `;
	}
	let image;
	for (let i = 0; i < data.body.definitionForTranslate.length; i++) {
		example += `${data.body.definitionForTranslate[i]} | `;
	}
	if (card.Image) {
		let imageFileName = `${word}_ldoce.jpg`;
		image = `<img src="${imageFileName}" />`;
		let imageUrlName = `http://api.pearson.com${card.Image}`;
		let writeStreamImage = fs.createWriteStream(
			`${config.mediaDir}/${imageFileName}`
		);
		request.get(imageUrlName).pipe(writeStreamImage);
		await streamToPromise(writeStreamImage);
		writeStreamImage.end();
	} else {
		image = undefined;
	}
	return {
		Audio: audioField,
		Translation: translation,
		Example: data.HTMLoutput,
		Image: image,
		Verb_table: verbTable.verbTable,
		Tag: card.Part_of_speech
	};
}

function removeDuplicates(myArr, prop) {
	return myArr.filter((obj, pos, arr) => {
		return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
	});
}
