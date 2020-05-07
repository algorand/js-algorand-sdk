class Status {
	constructor(c) {
		this.c = c
	}

	/**
	 * retrieves the StatusResponse from the running node
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let res = await this.c.get("/v2/status", {}, headers);
		return res.body;
	};
}

module.exports = { Status };
