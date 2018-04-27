'use strict'
const alfy = require('alfy')
const jsonfile = require('jsonfile')

jsonfile.writeFile(
	'./src/input/body.json',
	alfy.config.get('allPhrases'),
	{
		spaces: 2
	},
	function (err) {
		if (err !== null) {
			console.error(err)
		}
	}
)
