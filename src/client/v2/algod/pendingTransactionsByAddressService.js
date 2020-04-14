class PendingTransactionsByAddressService {
	constructor(c, address) {
		this.c = c;
		this.address = address;
		this.query = {"format": "msgpack"};
	}

	/**
	 * returns all transactions for a PK [addr] in the [first, last] rounds range.
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let res = await this.c.get("/v2/accounts/" + this.address + "/transactions/pending", this.query, headers);
		return res.body;
	}

	// max sets the maximum number of txs to return
	max(max){
		this.query["max"] = max;
		return this;
	}
}