import JSONRequest from '../jsonrequest.js';
import { SupplyResponse } from './models/types.js';

export default class Supply extends JSONRequest<
  SupplyResponse,
  Record<string, any>
> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/ledger/supply';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): SupplyResponse {
    return SupplyResponse.fromDecodedJSON(body);
  }
}
