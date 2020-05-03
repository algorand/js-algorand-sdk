class PendingTransactions {
	constructor(c) {
		this.c = c;
	}

	/**
	 * pendingTransactionsInformation returns transactions that are pending in the pool
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let res = await this.c.get("/v2/transactions/pending/", {}, headers);
		return res.body;
	}
}

module.exports = { PendingTransactions };
