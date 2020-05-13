class LookupAccountByID {
	constructor(c, account) {
		this.c = c;
		this.account = account;
		this.query = {}
	}

	/**
	 * returns information about the identified account
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do (headers = {}) {
		let res = await this.c.get("/v2/accounts/" + this.account, this.query, headers);
		return res.body;
	};

	round(round) {
		this.query["round"] = round;
		return this;
	}
}

module.exports = {LookupAccountByID};
