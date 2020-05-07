class SendRawTransaction {
	constructor(c, stx_or_stxs) {
		let forPosting = stx_or_stxs;
		if (Array.isArray(stx_or_stxs)) {
			forPosting = Array.prototype.concat(...txns.map(arr => Array.from(arr)));
		}
		this.txnBytesToPost = forPosting;
		this.c = c;
	}

	/**
	 * Sets the default header (if not previously set) for sending a raw
	 * transaction.
	 * @param headers
	 * @returns {*}
	 */
	 setSendTransactionHeaders(headers) {
		let hdrs = headers;
		if (Object.keys(hdrs).every(key=> key.toLowerCase() !== 'content-type')) {
			hdrs = {...headers};
			hdrs['Content-Type'] = 'application/x-binary';
		}
		return hdrs;
	}

	/**
	 * broadcasts the passed signed txns to the network
	 * @param headers, optional
	 * @returns {Promise<*>}
	 */
	async do(headers={}) {
		let txHeaders = this.setSendTransactionHeaders(headers);
		let res = await this.c.post("/v2/transactions", Buffer.from(this.txnBytesToPost), txHeaders);
		return res.body;
	}
}

module.exports = { SendRawTransaction };
