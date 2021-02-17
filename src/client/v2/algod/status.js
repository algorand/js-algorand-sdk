const { JSONRequest } = require('../jsonrequest');

class Status extends JSONRequest {
	constructor(c, intDecoding) {
		super(c, intDecoding);
	}

	_path() {
		return "/v2/status";
	}
}

module.exports = { Status };
