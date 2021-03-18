import JSONRequest from '../jsonrequest';

export default class Supply extends JSONRequest {
  // eslint-disable-next-line no-underscore-dangle,class-methods-use-this
  path() {
    return '/v2/ledger/supply';
  }
}
