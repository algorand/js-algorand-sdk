class MakeHealthCheck{
	constructor(c) {
		this.c = c;
	}

	/**
	 * returns the health object for the service
	 * @param headers, optional
	 * @returns Promise<*>
	 */
	async do (headers = {}) {
		let res = await this.c.get("/health", {}, headers);
		return res.body;
	};
}

module.exports = {MakeHealthCheck};
