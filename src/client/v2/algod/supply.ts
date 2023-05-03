import JSONRequest from '../jsonrequest';
import { SupplyResponse } from './models/types';

export default class Supply extends JSONRequest<SupplyResponse> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/ledger/supply';
  }
}
