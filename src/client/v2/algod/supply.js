const { JSONRequest } = require('../jsonrequest');

class Supply extends JSONRequest {
	constructor(c) {
		super(c);
	}

	_path() {
		return "/v2/ledger/supply";
	}
}

module.exports = { Supply };
