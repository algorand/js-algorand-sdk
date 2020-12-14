const { JSONRequest } = require('../jsonrequest');

class GetApplicationByID extends JSONRequest {
    constructor(c, index) {
        super(c);
        this.index = index;
    }

    _path() {
        return "/v2/applications/" + this.index;
    }
}

module.exports = { GetApplicationByID };