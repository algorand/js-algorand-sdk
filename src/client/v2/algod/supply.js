class Supply {
	constructor(c) {
		this.c = c;
	}

	/**
	 * gets the supply details for the specified node's ledger
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let res = await this.c.get("/v2/ledger/supply", {}, headers);
		return res.body;
	};
}

module.exports = { Supply };
