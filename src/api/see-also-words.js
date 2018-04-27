/* eslint one-var: [2, { var: "always", let: "always" }] */
'use strict'
const alfy = require('alfy')

alfy.input = ''
const {seeAlso} = process.env
if (seeAlso) {
	const newData = seeAlso.split('\t')

	const items = alfy.inputMatches(newData)
		.map(x => ({
			title: x,
			arg: x
		}))
	alfy.output(items)
}
