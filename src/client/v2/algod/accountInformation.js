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
        let res = await this.c.get("/v2/accounts/" + this.account, {}, headers);
        return res.body;
    }
}

module.exports = { AccountInformation };
