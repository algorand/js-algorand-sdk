const { JSONRequest } = require('../jsonrequest');

class LookupBlock extends JSONRequest {
  constructor(c, intDecoding, round) {
    super(c, intDecoding);
    this.round = round;
  }

  _path() {
    return `/v2/blocks/${this.round}`;
  }
}

module.exports = { LookupBlock };
