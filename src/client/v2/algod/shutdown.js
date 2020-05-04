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
		let path = "/v2/shutdown";
		if (this.shutdownParams["timeout"] != undefined && this.shutdownParams["timeout"] != 0) {
			path = path + "?timeout=" + this.shutdownParams["timeout"].toString();
		}
		let res = await this.c.post(path, this.shutdownParams, headers);
		return res.body;
	}

	// set the number of seconds to wait before shutdown
	timeout(timeout) {
		this.shutdownParams["timeout"] = timeout;
		return this;
	}
}

module.exports = { Shutdown };
