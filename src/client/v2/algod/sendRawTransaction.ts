import { concatArrays } from '../../../utils/utils.js';
import { PostTransactionsResponse } from './models/types.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import JSONRequest from '../jsonrequest.js';

/**
 * Sets the default header (if not previously set) for sending a raw
 * transaction.
 * @param headers - A headers object
 */
export function setSendTransactionHeaders(
  headers: Record<string, string> = {}
) {
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
 * broadcasts the passed signed txns to the network
 */
export default class SendRawTransaction extends JSONRequest<PostTransactionsResponse> {
  private txnBytesToPost: Uint8Array;

  constructor(c: HTTPClient, stxOrStxs: Uint8Array | Uint8Array[]) {
    super(c);

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
    return '/v2/transactions';
  }

  protected executeRequest(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<HTTPClientResponse> {
    const txHeaders = setSendTransactionHeaders(headers);
    return this.c.post({
      relativePath: this.path(),
      data: this.txnBytesToPost,
      requestHeaders: txHeaders,
      customOptions,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): PostTransactionsResponse {
    return decodeJSON(response.getJSONText(), PostTransactionsResponse);
  }
}
