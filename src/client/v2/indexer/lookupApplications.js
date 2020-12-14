const { JSONRequest } = require('../jsonrequest');

class LookupApplications extends JSONRequest {
    constructor(c, index) {
        super(c);
        this.index = index;
    }

    _path() {
        return "/v2/applications/" + this.index;
    }

    // specific round to search
    round(round) {
        this.query['round'] = round;
        return this;
    }
}

module.exports = {LookupApplications};