class Shutdown {
	constructor(c) {
		this.c = c;
		this.shutdownParams = {}
	}

	/**
	* shuts down the node
	* @param headers, optional
	*/
	async do(headers={}) {
		let res = await this.c.post("/v2/shutdown", Buffer.from(this.shutdownParams), headers);
		return res.body;
	}

	// set the number of seconds to wait before shutdown
	timeout(timeout) {
		this.shutdownParams["timeout"] = timeout;
		return this;
	}
}

module.exports = { Shutdown };
