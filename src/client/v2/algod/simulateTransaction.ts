import { Buffer } from 'buffer';
import * as encoding from '../../../encoding/encoding';
import HTTPClient from '../../client';
import JSONRequest from '../jsonrequest';
import { SimulateRequest, SimulateResponse } from './models/types';

/**
 * Sets the default header (if not previously set) for simulating a raw
 * transaction.
 * @param headers - A headers object
 */
export function setSimulateTransactionsHeaders(headers = {}) {
  let hdrs = headers;
  if (Object.keys(hdrs).every((key) => key.toLowerCase() !== 'content-type')) {
    hdrs = { ...headers };
    hdrs['Content-Type'] = 'application/msgpack';
  }
  return hdrs;
}

/**
 * Simulates signed txns.
 */
export default class SimulateRawTransactions extends JSONRequest<
  SimulateResponse,
  Uint8Array
> {
  private requestBytes: Uint8Array;

  constructor(c: HTTPClient, request: SimulateRequest) {
    super(c);
    this.query.format = 'msgpack';
    this.requestBytes = encoding.rawEncode(request.get_obj_for_encoding(true));
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/transactions/simulate';
  }

  async do(headers = {}) {
    const txHeaders = setSimulateTransactionsHeaders(headers);
    const res = await this.c.post(
      this.path(),
      Buffer.from(this.requestBytes),
      txHeaders,
      this.query,
      false
    );
    return this.prepare(res.body);
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): SimulateResponse {
    const decoded = encoding.decode(body);
    return SimulateResponse.from_obj_for_encoding(decoded);
  }
}
