class SuggestedParams {
	constructor(c) {
		this.c = c;
	}

	/**
	 * returns the common needed parameters for a new transaction, in a format the transaction builder expects
	 * @param headers, optional
	 * @returns {Object}
	 */
	async do(headers={}) {
		let result = await this.c.get("/v2/transactions/params", {}, headers);
		return {
			"flatFee": false,
			"fee": result.fee,
			"firstRound": result.lastRound,
			"lastRound": result.lastRound + 1000,
			"genesisID": result.genesisID,
			"genesisHash": result.genesishashb64,
		};
	};
}