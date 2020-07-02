class LookupApplications {
    constructor(c, index) {
        this.c = c;
        this.query = {};
        this.index = index;
    }

    /**
     * returns information about indexed applications
     * @param headers, optional
     * @returns Promise<*>
     */
    async do(headers = {}) {
        let res = await this.c.get("/v2/applications/" + this.index, this.query, headers);
        return res.body;
    };

    // specific round to search
    round(round) {
        this.query['round'] = round;
        return this;
    }
}

module.exports = {LookupApplications};