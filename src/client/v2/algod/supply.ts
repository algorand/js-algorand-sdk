import JSONRequest from '../jsonrequest.js';

export default class Supply extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/ledger/supply';
  }
}
