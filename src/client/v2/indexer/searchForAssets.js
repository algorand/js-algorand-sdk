class SearchForAssets{
	constructor(c) {
		this.c = c;
		this.query = {}
	}

	/**
	 * returns information about indexed assets
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do(headers = {}) {
		let res = await this.c.get("/v2/assets", this.query, headers);
		return res.body;
	};

	// limit for filter, as int
	limit(limit) {
		this.query["limit"] = limit;
		return this;
	}

	// asset creator address for filter, as string
	creator(creator) {
		this.query["creator"] = creator;
		return this;
	}

	// asset name for filter, as string
	name(name) {
		this.query["name"] = name;
		return this;
	}

	// asset unit name for filter, as string
	unit(unit) {
		this.query["unit"] = unit;
		return this;
	}

	// asset ID for filter, as int
	index(index) {
		this.query["asset-id"] = index;
		return this;
	}

	// used for pagination
	nextToken(nextToken) {
		this.query['next'] = nextToken;
		return this;
	}
}

module.exports = {SearchForAssets};
