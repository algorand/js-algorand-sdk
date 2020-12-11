const utils = require('../../../utils/utils');

class AccountInformation {
	constructor(c, account) {
	    this.c = c;
        this.account = account;
    }

    /**
     * accountInformation returns the passed account's information
     * @param headers, optional
     * @returns {Promise<*>}
     */
    async do(headers={}) {
        const res = await this.c.get("/v2/accounts/" + this.account, {}, headers);
        if (res.text) {
            res.body = utils.JSONParseWithBigInt(res.text);
        }
        return res.body;
    }
}

module.exports = { AccountInformation };
