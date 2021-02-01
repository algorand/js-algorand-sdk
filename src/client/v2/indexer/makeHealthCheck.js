const { JSONRequest } = require('../jsonrequest');

class MakeHealthCheck extends JSONRequest {
	constructor(c, intDecoding) {
		super(c, intDecoding);
	}

	_path() {
		return "/health";
	}
}

module.exports = {MakeHealthCheck};
