const { JSONRequest } = require('../jsonrequest');

class AccountInformation extends JSONRequest {
	constructor(c, account) {
	    super(c);
        this.account = account;
    }

    _path() {
        return "/v2/accounts/" + this.account;
    }
}

module.exports = { AccountInformation };
