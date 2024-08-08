import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { GetSyncRoundResponse } from './models/types.js';

export default class GetSyncRound extends JSONRequest<GetSyncRoundResponse> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/ledger/sync`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): GetSyncRoundResponse {
    return decodeJSON(response.getJSONText(), GetSyncRoundResponse);
  }
}
