const { JSONRequest } = require('../jsonrequest');

class LookupBlock extends JSONRequest {
	constructor(c, round) {
		super(c);
		this.round = round;
	}

	_path() {
		return "/v2/blocks/" + this.round;
	}
}

module.exports = {LookupBlock};
