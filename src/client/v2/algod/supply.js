const { JSONRequest } = require('../jsonrequest');

class Supply extends JSONRequest {
	constructor(c, intDecoding) {
		super(c, intDecoding);
	}

	_path() {
		return "/v2/ledger/supply";
	}
}

module.exports = { Supply };
