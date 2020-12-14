const { JSONRequest } = require('../jsonrequest');

class StatusAfterBlock extends JSONRequest {
	constructor(c, round) {
		super(c);
		if (!Number.isInteger(round)) throw Error("round should be an integer");
		this.round = round;
	}

	_path() {
		return "/v2/status/wait-for-block-after/" + this.round;
	}
}

module.exports = { StatusAfterBlock };
