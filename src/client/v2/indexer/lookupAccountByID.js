import { JSONRequest } from '../jsonrequest';

class LookupAccountByID extends JSONRequest {
  constructor(c, intDecoding, account) {
    super(c, intDecoding);
    this.account = account;
  }

  // eslint-disable-next-line no-underscore-dangle
  _path() {
    return `/v2/accounts/${this.account}`;
  }

  round(round) {
    this.query.round = round;
    return this;
  }
}

module.exports = { LookupAccountByID };
