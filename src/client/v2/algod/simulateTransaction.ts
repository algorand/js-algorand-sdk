import { Buffer } from 'buffer';
import * as encoding from '../../../encoding/encoding';
import { concatArrays } from '../../../utils/utils';
import HTTPClient from '../../client';
import JSONRequest from '../jsonrequest';
import { SimulateResponse } from './models/types';

/**
 * Sets the default header (if not previously set) for simulating a raw
 * transaction.
 * @param headers - A headers object
 */
export function setSimulateTransactionsHeaders(headers = {}) {
  let hdrs = headers;
  if (Object.keys(hdrs).every((key) => key.toLowerCase() !== 'content-type')) {
    hdrs = { ...headers };
    hdrs['Content-Type'] = 'application/x-binary';
  }
  return hdrs;
}

function isByteArray(array: any): array is Uint8Array {
  return array && array.byteLength !== undefined;
}

/**
 * Simulates signed txns.
 */
export default class SimulateRawTransactions extends JSONRequest<
  SimulateResponse,
  Uint8Array
> {
  private txnBytesToPost: Uint8Array;

  constructor(c: HTTPClient, stxOrStxs: Uint8Array | Uint8Array[]) {
    super(c);
    this.query.format = 'msgpack';

    let forPosting = stxOrStxs;
    if (Array.isArray(stxOrStxs)) {
      if (!stxOrStxs.every(isByteArray)) {
        throw new TypeError('Array elements must be byte arrays');
      }
      // Flatten into a single Uint8Array
      forPosting = concatArrays(...stxOrStxs);
    } else if (!isByteArray(forPosting)) {
      throw new TypeError('Argument must be byte array');
    }
    this.txnBytesToPost = forPosting;
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/transactions/simulate';
  }

  async do(headers = {}) {
    const txHeaders = setSimulateTransactionsHeaders(headers);
    const res = await this.c.post(
      this.path(),
      Buffer.from(this.txnBytesToPost),
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
