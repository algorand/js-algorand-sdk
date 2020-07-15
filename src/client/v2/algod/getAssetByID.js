class GetAssetByID {
    constructor(c, index) {
        this.c = c;
        this.index = index;
        this.query = {};
    }

    /**
     * Given an asset id, return asset information including creator, name, total supply and special addresses
     * @param headers, optional
     * @returns {Promise<*>}
     */
    async do(headers={}) {
        let res = await this.c.get("/v2/assets/" + this.index, this.query, headers);
        return res.body;
    }
}

module.exports = { GetAssetByID };