import Url from 'url-parse';
import path from 'path';
import * as request from 'superagent';

export type Query<F> = {
  format?: F;
  [key: string]: any;
};

export interface AlgodTokenHeader {
  'X-Algo-API-Token': string;
}

export interface IndexerTokenHeader {
  'X-Indexer-API-Token': string;
}

export interface KMDTokenHeader {
  'X-KMD-API-Token': string;
}

export interface CustomTokenHeader {
  [headerName: string]: string;
}

export type TokenHeader =
  | AlgodTokenHeader
  | IndexerTokenHeader
  | KMDTokenHeader
  | CustomTokenHeader;

export interface BaseHTTPClientResponse {
  body: Uint8Array;
  status: number; // status must always be 200 except when the response is inside an error
  headers: Record<string, string>;
}

/**
 * BaseHTTPClientError is the interface that errors thrown
 * by methods of BaseHTTPClient should be using
 */
export interface BaseHTTPClientError {
  response: BaseHTTPClientResponse;
}

/**
 * BaseHTTPClient is an interface abstracting the queries that can be
 * made to an algod/indexer endpoint.
 * The SDK normally uses the URLTokenBaseHTTPClient implementation.
 * But when used via wallets, the wallet may provide a different object
 * satisfying the HTTPClient interface. This is useful to allow
 * wallets to provide access to paid API services without leaking
 * the secret tokens/URLs.
 *
 * Note that post and delete also have an optional query parameter
 * This is to allow future extension where post and delete may have queries
 * Currently however HTTPClient does not make use of it
 *
 * Compared to HTTPClient, BaseHTTPClient does not deal with serialization/deserialization
 * Everything is already string/Uint8Array
 * and all the headers (including Accept/Content-Type) are assumed to be provided
 *
 * In case of non-200 status, all methods must throw an error of type
 * BaseHTTPClientError
 */
export interface BaseHTTPClient {
  get: (
    relativePath: string,
    query?: Query<string>,
    requestHeaders?: Record<string, string>
  ) => Promise<BaseHTTPClientResponse>;
  post: (
    relativePath: string,
    data: Uint8Array,
    query?: Query<string>,
    requestHeaders?: Record<string, string>
  ) => Promise<BaseHTTPClientResponse>;
  delete: (
    relativePath: string,
    data: Uint8Array,
    query?: Query<string>,
    requestHeaders?: Record<string, string>
  ) => Promise<BaseHTTPClientResponse>;
}

export class URLTokenBaseHTTPClient implements BaseHTTPClient {
  private readonly baseURL: Url;
  private readonly tokenHeader: TokenHeader;

  constructor(
    tokenHeader: TokenHeader,
    baseServer: string,
    port?: string | number,
    private defaultHeaders: Record<string, any> = {}
  ) {
    const baseServerURL = new Url(baseServer, {});
    if (typeof port !== 'undefined') {
      baseServerURL.set('port', port.toString());
    }

    if (baseServerURL.protocol.length === 0) {
      throw new Error('Invalid base server URL, protocol must be defined.');
    }

    this.baseURL = baseServerURL;
    this.tokenHeader = tokenHeader;
  }

  /**
   * Compute the URL for a path relative to the instance's address
   * @param relativePath - A path string
   * @returns A URL string
   */
  private addressWithPath(relativePath: string) {
    const address = new Url(
      path.posix.join(this.baseURL.pathname, relativePath),
      this.baseURL
    );
    return address.toString();
  }

  /**
   * Convert a superagent response to a valid BaseHTTPClientResponse
   * Modify the superagent response
   * @param res
   * @private
   */
  private static superagentToHTTPClientResponse(
    res: request.Response
  ): BaseHTTPClientResponse {
    if (res.body instanceof ArrayBuffer) {
      // Handle the case where the body is an arraybuffer which happens in the browser
      res.body = new Uint8Array(res.body);
    }
    return res;
  }

  async get(
    relativePath: string,
    query?: Query<string>,
    requestHeaders: Record<string, string> = {}
  ): Promise<BaseHTTPClientResponse> {
    const r = request
      .get(this.addressWithPath(relativePath))
      .set(this.tokenHeader)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .responseType('arraybuffer')
      .query(query);

    const res = await r;
    return URLTokenBaseHTTPClient.superagentToHTTPClientResponse(res);
  }

  async post(
    relativePath: string,
    data: Uint8Array,
    query?: Query<string>,
    requestHeaders: Record<string, string> = {}
  ): Promise<BaseHTTPClientResponse> {
    const r = request
      .post(this.addressWithPath(relativePath))
      .set(this.tokenHeader)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .query(query)
      .serialize((o) => o) // disable serialization from superagent
      .responseType('arraybuffer')
      .send(Buffer.from(data)); // Buffer.from necessary for superagent

    const res = await r;
    return URLTokenBaseHTTPClient.superagentToHTTPClientResponse(res);
  }

  async delete(
    relativePath: string,
    data: Uint8Array,
    query?: Query<string>,
    requestHeaders: Record<string, string> = {}
  ): Promise<BaseHTTPClientResponse> {
    const r = request
      .delete(this.addressWithPath(relativePath))
      .set(this.tokenHeader)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .query(query)
      .serialize((o) => o) // disable serialization from superagent
      .responseType('arraybuffer')
      .send(Buffer.from(data)); // Buffer.from necessary for superagent

    const res = await r;
    return URLTokenBaseHTTPClient.superagentToHTTPClientResponse(res);
  }
}
