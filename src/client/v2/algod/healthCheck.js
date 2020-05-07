
class HealthCheck {
	constructor(c) {
		this.c = c
	}

	/**
	 * healthCheck returns an empty object iff the node is running
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let res = await this.c.get("/health", {}, headers);
		return res.body;
	}
}

module.exports = { HealthCheck };
