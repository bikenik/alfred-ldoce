module.exports = class WorkflowError extends Error {
	constructor(message, data) {
		// `data` is an object with the following optional props:
		//   .tip - message to show so the user can fix the error
		//   .autocomplete - self-explanatory

		super(message)
		this.name = 'Workflow'

		Object.assign(this, data)
	}
}

module.exports.checkStatus = response => {
	if (response.status === 200) {
		return Promise.resolve(response)
	}
	return Promise.reject(new Error(response.status))
}
