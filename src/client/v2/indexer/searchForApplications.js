class SearchForApplications{
    constructor(c) {
        this.c = c;
        this.query = {}
    }

    /**
     * returns information about indexed applications
     * @param headers, optional
     * @returns Promise<*>
     */
    async do(headers = {}) {
        let res = await this.c.get("/v2/applications", this.query, headers);
        return res.body;
    };

    // application ID for filter, as int
    index(index) {
        this.query["application-id"] = index;
        return this;
    }

    // specific round to search
    round(round) {
        this.query['round'] = round;
        return this;
    }

    // token for pagination
    nextToken(next) {
        this.query['next'] = next
        return this;
    }

    // limit results for pagination
    limit(limit) {
        this.query['limit'] = limit;
        return this;
    }
}

module.exports = {SearchForApplications};
