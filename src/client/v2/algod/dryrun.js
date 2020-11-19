const { Buffer } = require('buffer');
const encoding = require('../../../encoding/encoding');

class Dryrun {
	constructor(c, dr) {
		this.c = c;
		this.blob = encoding.encode(dr.get_obj_for_encoding());
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
			hdrs['Content-Type'] = 'application/msgpack';
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
		let res = await this.c.post("/v2/teal/dryrun", Buffer.from(this.blob), txHeaders);
		return res.body;
	}
}

module.exports = { Dryrun };
