class LookupAssetByID {
	constructor(c, index){
		this.c = c;
		this.index = index;
	}

	/**
	 * returns information about the passed asset
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do(headers = {}) {
		let res = await this.c.get(this.versionPrefix + "/assets/" + this.index, {}, headers);
		return res.body;
	};
}

module.exports = {LookupAssetByID};
