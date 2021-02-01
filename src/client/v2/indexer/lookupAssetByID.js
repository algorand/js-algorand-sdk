const { JSONRequest } = require('../jsonrequest');

class LookupAssetByID extends JSONRequest {
	constructor(c, intDecoding, index){
		super(c, intDecoding);
		this.index = index;
	}

	_path() {
		return "/v2/assets/" + this.index;
	}
}

module.exports = {LookupAssetByID};
