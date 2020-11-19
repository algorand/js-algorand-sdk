const { Buffer } = require('buffer');

class Compile {
	constructor(c, source) {
		this.c = c;
		this.source = source
	}

	/**
	 * Sets the default header (if not previously set)
	 * @param headers
	 * @returns {*}
	 */
	 setHeaders(headers) {
		let hdrs = headers;
		if (Object.keys(hdrs).every(key=> key.toLowerCase() !== 'content-type')) {
			hdrs = {...headers};
			hdrs['Content-Type'] = 'text/plain';
		}
		return hdrs;
	}

	/**
	 * Executes dryrun
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let txHeaders = this.setHeaders(headers);
		let res = await this.c.post("/v2/teal/compile", Buffer.from(this.source), txHeaders);
		return res.body;
	}
}

module.exports = { Compile };
