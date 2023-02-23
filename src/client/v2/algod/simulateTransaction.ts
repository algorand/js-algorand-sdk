import { Buffer } from 'buffer';
import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import { concatArrays } from '../../../utils/utils';

/**
 * Sets the default header (if not previously set) for simulating a raw
 * transaction.
 * @param headers - A headers object
 */
export function setSimulateTransactionHeaders(headers = {}) {
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
export default class SimulateRawTransaction extends JSONRequest {
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
    const txHeaders = setSimulateTransactionHeaders(headers);
    const res = await this.c.post(
      this.path(),
      Buffer.from(this.txnBytesToPost),
      txHeaders
    );
    return res.body;
  }
}
