class GetApplicationByID {
    constructor(c, index) {
        this.c = c;
        this.index = index;
        this.query = {};
    }

    /**
     * Given an application id, it returns application information including creator, approval and clear programs, global and local schemas, and global state
     * @param {object} headers Additional headers to include in the request.
     * @param {boolean} useBigInt If true, all integers in the response will be decoded as BigInts.
     *   If false, all integers will be decoded as Numbers and if the response contains integers
     *   greater than Number.MAX_SAFE_INTEGER, an error will be thrown. Defaults to false.
     * @returns {Promise<*>}
     */
    async do(headers={}, useBigInt=false) {
        const res = await this.c.get("/v2/applications/" + this.index, this.query, headers, useBigInt);
        return res.body;
    }
}

module.exports = { GetApplicationByID };