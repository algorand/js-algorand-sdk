import JSONRequest from '../jsonrequest';
import { HTTPClient } from '../../client';

/**
 * Sets the default header (if not previously set) for sending a raw
 * transaction.
 * @param headers
 * @returns {*}
 */
export function setSendTransactionHeaders(headers = {}) {
  let hdrs = headers;
  if (Object.keys(hdrs).every((key) => key.toLowerCase() !== 'content-type')) {
    hdrs = { ...headers };
    hdrs['Content-Type'] = 'application/x-binary';
  }
  return hdrs;
}

function isByteArray(array: Uint8Array) {
  return array && array.byteLength !== undefined;
}

/**
 * broadcasts the passed signed txns to the network
 */
export default class SendRawTransaction extends JSONRequest {
  private txnBytesToPost: Uint8Array;

  constructor(c: HTTPClient, stxOrStxs: Uint8Array | Uint8Array[]) {
    super(c);

    let forPosting = stxOrStxs;
    if (Array.isArray(stxOrStxs)) {
      if (!stxOrStxs.every(isByteArray)) {
        throw new TypeError('Array elements must be byte arrays');
      }
      forPosting = Array.prototype.concat(
        ...stxOrStxs.map((arr) => Array.from(arr))
      );
    } else if (!isByteArray(forPosting as Uint8Array)) {
      throw new TypeError('Argument must be byte array');
    }
    this.txnBytesToPost = forPosting as Uint8Array;
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/transactions';
  }

  async do(headers = {}) {
    const txHeaders = setSendTransactionHeaders(headers);
    const res = await this.c.post(
      this.path(),
      Buffer.from(this.txnBytesToPost),
      txHeaders
    );
    return res.body;
  }
}
