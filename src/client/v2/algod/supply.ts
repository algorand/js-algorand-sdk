import JSONRequest from '../jsonrequest';
import { SupplyResponse } from './models/types';

export default class Supply extends JSONRequest<SupplyResponse> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/ledger/supply';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): SupplyResponse {
    return SupplyResponse.from_obj_for_encoding(body);
  }
}
