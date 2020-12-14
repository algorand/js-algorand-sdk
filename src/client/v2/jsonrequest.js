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
	 * returns holder balances for the given asset
	 * @param {object} headers Additional headers to send in the request. Optional.
	 * @returns {Promise<*>}
	 */
	async do(headers = {}) {
		let res = await this.c.get(this._path(), this.query, headers, this.requestBigInt);
		return res.body;
	};

    /**
     * Set the useBigInt option. If not set, defaults to false.
     * @param {boolean} useBigInt If true, all integers in the response will be decoded as BigInts.
     *   If false, all integers will be decoded as Numbers and if the response contains integers
     *   greater than Number.MAX_SAFE_INTEGER, an error will be thrown.
     */
    useBigInt(useBigInt) {
        this.requestBigInt = useBigInt;
        return this;
    }
}

module.exports = { JSONRequest };
