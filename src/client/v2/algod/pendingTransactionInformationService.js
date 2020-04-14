class PendingTransactionInformationService {
	constructor(c, txid) {
		this.c = c;
		this.txid = txid;
		this.query = {};
		this.query["format"] = "msgpack";
	}

	/**
	 * returns the transaction information for a specific txid of a pending transaction
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}){
		let res = await this.c.get("/v2/transactions/pending/" + this.txid, this.query, headers);
		return res.body;
	};

	// max sets the maximum number of txs to return
	max(max){
		this.query["max"] = max;
		return this;
	}
}