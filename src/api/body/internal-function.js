const typeOfAddition = sense => {
	for (const key in sense) {
		if (Object.prototype.hasOwnProperty.call(sense, key)) {
			return key
		}
	}
}

module.exports = {typeOfAddition}
