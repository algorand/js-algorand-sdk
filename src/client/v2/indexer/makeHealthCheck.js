const { JSONRequest } = require('../jsonrequest');

class MakeHealthCheck extends JSONRequest {
	constructor(c) {
		super(c);
	}

	_path() {
		return "/health";
	}
}

module.exports = {MakeHealthCheck};
