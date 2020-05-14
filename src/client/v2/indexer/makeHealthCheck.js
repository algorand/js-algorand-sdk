class MakeHealthCheck{
	constructor(c) {
		this.c = c;
	}

	/**
	 * returns the block for the passed round
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do (headers = {}) {
		let res = await this.c.get("/health", {}, headers);
		return res.body;
	};
}

module.exports = {MakeHealthCheck};
