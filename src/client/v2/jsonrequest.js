class JSONRequest {
    /**
     * @param {HttpClient} client HTTPClient object.
     */
    constructor(client) {
        this.c = client;
        this.query = {};
        this.requestBigInt = false;
    }

    /**
     * @returns {string} The path of this request.
     */
    _path() {
        throw new Error("Must be overriden by implementing class.");
    }

    /**
	 * Execute the request.
	 * @param {object} headers Additional headers to send in the request. Optional.
	 * @returns {Promise<object>} A promise which resolves to the response data.
	 */
	async do(headers = {}) {
		let res = await this.c.get(this._path(), this.query, headers, this.requestBigInt);
		return res.body;
	};

    /**
     * Configure the useBigInt option. If this option is set for a request, all integers in the
     * response will be decoded as BigInts. If this option is not set, all integers will be decoded
     * as Numbers and if the response contains any integers greater than Number.MAX_SAFE_INTEGER an
     * error will be thrown.
     * @param {boolean} enabled Whether to enable BigInt support for this request. Defaults to true.
     */
    useBigInt(enabled=true) {
        this.requestBigInt = enabled;
        return this;
    }
}

module.exports = { JSONRequest };
