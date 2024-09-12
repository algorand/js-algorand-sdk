import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { GetBlockTimeStampOffsetResponse } from './models/types.js';

export default class GetBlockOffsetTimestamp extends JSONRequest<GetBlockTimeStampOffsetResponse> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/devmode/blocks/offset`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): GetBlockTimeStampOffsetResponse {
    return decodeJSON(response.getJSONText(), GetBlockTimeStampOffsetResponse);
  }
}
