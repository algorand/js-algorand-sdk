const { JSONRequest } = require('../jsonrequest');

class Status extends JSONRequest {
	constructor(c) {
		super(c);
	}

	_path() {
		return "/v2/status";
	}
}

module.exports = { Status };
