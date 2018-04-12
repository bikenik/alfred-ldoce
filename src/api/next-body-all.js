'use strict'
const alfy = require('alfy')
const jsonfile = require('jsonfile')

let logResult = {
	error: [],
	result: []
}

jsonfile.writeFile(
	'./src/input/body.json',
	alfy.config.get('allPhrases'),
	{
		spaces: 2
	},
	function (err) {
		logResult.error.push(err)
	}
)
