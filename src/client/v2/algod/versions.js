class Versions {
	constructor(c) {
		this.c = c
	}

	/**
	 * retrieves the VersionResponse from the running node
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let res = await c.get("/versions", {}, headers);
		return res.body;
	};
}

module.exports = { Versions };
