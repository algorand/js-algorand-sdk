import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { encodeMsgpack, decodeMsgpack } from '../../../encoding/encoding.js';
import JSONRequest from '../jsonrequest.js';
import { SimulateRequest, SimulateResponse } from './models/types.js';

/**
 * Sets the default header (if not previously set) for simulating a raw
 * transaction.
 * @param headers - A headers object
 */
export function setSimulateTransactionsHeaders(
  headers: Record<string, any> = {}
) {
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
export default class SimulateRawTransactions extends JSONRequest<SimulateResponse> {
  private requestBytes: Uint8Array;

  constructor(c: HTTPClient, request: SimulateRequest) {
    super(c);
    this.query.format = 'msgpack';
    this.requestBytes = encodeMsgpack(request);
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/transactions/simulate';
  }

  protected executeRequest(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<HTTPClientResponse> {
    const txHeaders = setSimulateTransactionsHeaders(headers);
    return this.c.post({
      relativePath: this.path(),
      data: this.requestBytes,
      query: this.query,
      requestHeaders: txHeaders,
      customOptions,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): SimulateResponse {
    return decodeMsgpack(response.body, SimulateResponse);
  }
}
