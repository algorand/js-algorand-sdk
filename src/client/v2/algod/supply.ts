import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { SupplyResponse } from './models/types.js';

export default class Supply extends JSONRequest<SupplyResponse> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/ledger/supply';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): SupplyResponse {
    return decodeJSON(response.getJSONText(), SupplyResponse);
  }
}
