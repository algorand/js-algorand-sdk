class GetApplicationByID {
    constructor(c, index) {
        this.c = c;
        this.index = index;
        this.query = {};
    }

    /**
     * Given an application id, it returns application information including creator, approval and clear programs, global and local schemas, and global state
     * @param headers, optional
     * @returns {Promise<*>}
     */
    async do(headers={}) {
        let res = await this.c.get("/v2/applications/" + this.index, this.query, headers);
        return res.body;
    }
}

module.exports = { GetApplicationByID };