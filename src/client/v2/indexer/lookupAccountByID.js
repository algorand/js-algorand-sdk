const { JSONRequest } = require('../jsonrequest');

class LookupAccountByID extends JSONRequest {
	constructor(c, account) {
		super(c);
		this.account = account;
	}

	_path() {
		return "/v2/accounts/" + this.account;
	}

	round(round) {
		this.query["round"] = round;
		return this;
	}
}

module.exports = {LookupAccountByID};
