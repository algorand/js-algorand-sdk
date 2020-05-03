class LookupBlock {
	constructor(c, round) {
		this.c = c;
		this.round = round;
	}

	/**
	 * returns the block for the passed round
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do (headers = {}) {
		let res = await this.c.get("/v2/blocks/" + this.round, {}, headers);
		return res.body;
	};
}

module.exports = {LookupBlock};
