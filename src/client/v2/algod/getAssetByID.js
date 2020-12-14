const { JSONRequest } = require('../jsonrequest');

class GetAssetByID extends JSONRequest {
    constructor(c, index) {
        super(c);
        this.index = index;
    }

    _path() {
        return "/v2/assets/" + this.index;
    }
}

module.exports = { GetAssetByID };