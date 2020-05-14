class LookupAssetBalances {
	constructor(c, index) {
		this.c = c;
		this.index = index;
		this.query = {}
	}

	/**
	 * returns holder balances for the given asset
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do(headers = {}) {
		let res = await this.c.get("/v2/assets/" + this.index + "/balances", this.query, headers);
		return res.body;
	};

	// limit for filter, as int
	limit(limit) {
		this.query["limit"] = limit;
		return this;
	}

	// round to filter with, as int
	round(round) {
		this.query["round"] = round;
		return this;
	}

	// filtered results should have an amount greater than this value, as int, with units representing the asset
	currencyGreaterThan(greater) {
		this.query["currency-greater-than"] = greater;
		return this;
	}

	// filtered results should have an amount less than this value, as int, with units representing the asset units
	currencyLessThan(lesser) {
		this.query["currency-less-than"] = lesser;
		return this;
	}

	// used for pagination
	nextToken(nextToken) {
		this.query['next'] = nextToken;
		return this;
	}
}

module.exports = {LookupAssetBalances};
