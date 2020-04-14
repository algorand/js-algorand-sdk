class SearchAccountsService {
	constructor(c) {
		this.c = c;
		this.query = {};
	}

	/**
	 * returns information about indexed accounts
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do(headers = {}) {
		let res = await this.c.get("/v2/accounts/", this.query, headers);
		return res.body;
	};

	// filtered results should have an amount greater than this value, as int, representing microAlgos, unless an asset-id is provided, in which case units are in the asset's units
	currencyGreaterThan(greater) {
		this.query["currency-greater-than"] = greater;
		return this;
	}

	// filtered results should have an amount less than this value, as int, representing microAlgos, unless an asset-id is provided, in which case units are in the asset's units
	currencyLessThan(lesser) {
		this.query["currency-less-than"] = lesser;
		return this;
	}

	// limit for filter, as int
	limit(limit) {
		this.query["limit"] = limit;
		return this;
	}

	// asset ID to filter with, as int
	assetID(id) {
		this.query["asset-id"] = id;
		return this;
	}

	// combine with limit to page through results, as string
	afterAddress(after) {
		this.query["after-address"] = after;
		return this;
	}
}