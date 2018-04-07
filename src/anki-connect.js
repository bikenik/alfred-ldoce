const Promise = require('promise')
const {XMLHttpRequest} = require('xmlhttprequest')

module.exports = function (action, version, params) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		xhr.addEventListener('error', () =>
			reject('failed to connect to AnkiConnect')
		)
		xhr.addEventListener('load', () => {
			try {
				const response = JSON.parse(xhr.responseText)
				if (response.error) {
					throw response.error
				}
				if (Object.prototype.hasOwnProperty.call(response, 'result')) {
					resolve(response.result)
				}
				reject('failed to get results from AnkiConnect')
			} catch (err) {
				reject(err)
			}
		})

		xhr.open('POST', 'http://127.0.0.1:8765')
		xhr.send(
			JSON.stringify({
				action,
				version,
				params
			})
		)
	})
}
