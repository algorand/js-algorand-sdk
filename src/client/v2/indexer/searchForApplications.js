const { JSONRequest } = require('../jsonrequest');

class SearchForApplications extends JSONRequest {
    constructor(c, intDecoding) {
        super(c, intDecoding);
    }

    _path() {
        return "/v2/applications";
    }

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
