import JSONRequest from '../jsonrequest.js';
import { GetSyncRoundResponse } from './models/types.js';

export default class GetSyncRound extends JSONRequest<
  GetSyncRoundResponse,
  Record<string, any>
> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/ledger/sync`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): GetSyncRoundResponse {
    return GetSyncRoundResponse.from_obj_for_encoding(body);
  }
}
