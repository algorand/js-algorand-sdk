import JSONRequest from '../jsonrequest';

export default class GetSyncRound extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/ledger/sync`;
  }
}
