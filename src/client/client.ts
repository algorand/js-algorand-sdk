import { Buffer } from 'buffer';
import * as utils from '../utils/utils';
import {
  BaseHTTPClient,
  BaseHTTPClientResponse,
  Query,
} from './baseHTTPClient';
import { TokenHeader, URLTokenBaseHTTPClient } from './urlTokenBaseHTTPClient';

interface ErrorWithAdditionalInfo extends Error {
  rawResponse: string | null;
  statusCode: number;
}

export interface HTTPClientResponse {
  body: Uint8Array | any; // when content-type=JSON, body is a JSON object, otherwise it's a Uint8Array
  text?: string;
  headers: Record<string, string>;
  status: number;
  ok: boolean;
}

/**
 * Remove falsy values or values with a length of 0 from an object.
 */
function removeFalsyOrEmpty(obj: Record<string, any>) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // eslint-disable-next-line no-param-reassign
      if (!obj[key] || obj[key].length === 0) delete obj[key];
    }
  }
  return obj;
}

/**
 * Create a new object with lower-case keys
 * See https://codereview.stackexchange.com/a/162418
 * Used to ensure all headers are lower-case and to work more easily with them
 */
function tolowerCaseKeys(o: object): object {
  /* eslint-disable no-param-reassign,no-return-assign,no-sequences */
  return Object.keys(o).reduce((c, k) => ((c[k.toLowerCase()] = o[k]), c), {});
  /* eslint-enable no-param-reassign,no-return-assign,no-sequences */
}

/**
 * getAcceptFormat returns the correct Accept header depending on the
 * requested format.
 */
function getAcceptFormat(
  query?: Query<'msgpack' | 'json'>
): 'application/msgpack' | 'application/json' {
  if (
    query !== undefined &&
    Object.prototype.hasOwnProperty.call(query, 'format')
  ) {
    switch (query.format) {
      case 'msgpack':
        return 'application/msgpack';
      case 'json':
      default:
        return 'application/json';
    }
  } else return 'application/json';
}

/**
 * HTTPClient is a wrapper around a BaseHTTPClient
 * It takes care of setting the proper "Accept" header and of
 * decoding the JSON outputs.
 */
export default class HTTPClient {
  private bc: BaseHTTPClient;

  /**
   * Construct an HTTPClient from a BaseHTTPClient
   * @param bc - the BaseHTTPClient used
   */
  constructor(bc: BaseHTTPClient);
  /**
   * Construct an HTTPClient from a URL (baseServer+port) and a token
   */
  constructor(
    tokenHeader: TokenHeader,
    baseServer: string,
    port?: string | number,
    defaultHeaders?: Record<string, string>
  );

  constructor(
    bcOrTokenHeader: BaseHTTPClient | TokenHeader,
    baseServer?: string,
    port?: string | number,
    defaultHeaders: Record<string, string> = {}
  ) {
    if (baseServer !== undefined) {
      this.bc = new URLTokenBaseHTTPClient(
        bcOrTokenHeader as TokenHeader,
        baseServer,
        port,
        defaultHeaders
      );
    } else {
      this.bc = bcOrTokenHeader as BaseHTTPClient;
    }
  }

  /**
   * Parse JSON using either the built-in JSON.parse or utils.parseJSON
   * depending on whether jsonOptions are provided or not
   *
   * @param text - JSON data
   * @param status - Status of the response (used in case parseJSON fails)
   * @param jsonOptions - Options object to use to decode JSON responses. See
   *   utils.parseJSON for the options available.
   */
  public static parseJSON(
    text: string,
    status: number,
    jsonOptions: utils.JSONOptions = {}
  ) {
    try {
      if (Object.keys(jsonOptions).length === 0) {
        return text && JSON.parse(text);
      }
      return text && utils.parseJSON(text, jsonOptions);
    } catch (err_) {
      const err: ErrorWithAdditionalInfo = err_;
      // return the raw response if the response parsing fails
      err.rawResponse = text || null;
      // return the http status code if the response parsing fails
      err.statusCode = status;
      throw err;
    }
  }

  /**
   * Serialize the data according to the requestHeaders
   * Assumes that requestHeaders contain a key "content-type"
   * If the content-type is "application/json", data is JSON serialized
   * Otherwise, data needs to be either an UTF-8 string that is converted to an Uint8Array
   * or an Uint8Array
   * @private
   */
  private static serializeData(
    data: object,
    requestHeaders: Record<string, string>
  ): Uint8Array {
    if (!data) {
      return new Uint8Array(0); // empty Uint8Array
    }
    if (requestHeaders['content-type'] === 'application/json') {
      return new Uint8Array(Buffer.from(JSON.stringify(data)));
    }
    if (typeof data === 'string') {
      return new Uint8Array(Buffer.from(data));
    }
    if (data instanceof Uint8Array) {
      return data;
    }
    throw new Error(
      'provided data is neither a string nor a Uint8Array and content-type is not application/json'
    );
  }

  /**
   * Convert a BaseHTTPClientResponse into a full HTTPClientResponse
   * Parse the body in
   * Modifies in place res and return the result
   */
  private static prepareResponse(
    res: BaseHTTPClientResponse,
    format: 'application/msgpack' | 'application/json',
    parseBody: boolean,
    jsonOptions: utils.JSONOptions = {}
  ): HTTPClientResponse {
    let { body } = res;
    let text;

    if (format !== 'application/msgpack') {
      text = (body && Buffer.from(body).toString()) || '';
    }

    if (parseBody && format === 'application/json') {
      body = HTTPClient.parseJSON(text, res.status, jsonOptions);
    }

    return {
      ...res,
      body,
      text,
      ok: Math.trunc(res.status / 100) === 2,
    };
  }

  /**
   * Prepare an error with a response
   * (the type of errors BaseHTTPClient are supposed to throw)
   * by adding the status and preparing the internal response
   * @private
   */
  private static prepareResponseError(err) {
    if (err.response) {
      // eslint-disable-next-line no-param-reassign
      err.response = HTTPClient.prepareResponse(
        err.response,
        'application/json',
        true
      );
      // eslint-disable-next-line no-param-reassign
      err.status = err.response.status;
    }
    return err;
  }

  /**
   * Send a GET request.
   * @param relativePath - The path of the request.
   * @param query - An object containing the query parameters of the request.
   * @param requestHeaders - An object containing additional request headers to use.
   * @param jsonOptions - Options object to use to decode JSON responses. See
   *   utils.parseJSON for the options available.
   * @param parseBody - An optional boolean indicating whether the response body should be parsed
   *   or not.
   * @returns Response object.
   */
  async get(
    relativePath: string,
    query?: Query<any>,
    requestHeaders: Record<string, string> = {},
    jsonOptions: utils.JSONOptions = {},
    parseBody: boolean = true
  ): Promise<HTTPClientResponse> {
    const format = getAcceptFormat(query);
    const fullHeaders = { ...requestHeaders, accept: format };

    try {
      const res = await this.bc.get(
        relativePath,
        removeFalsyOrEmpty(query),
        fullHeaders
      );

      return HTTPClient.prepareResponse(res, format, parseBody, jsonOptions);
    } catch (err) {
      throw HTTPClient.prepareResponseError(err);
    }
  }

  /**
   * Send a POST request.
   * If no content-type present, adds the header "content-type: application/json"
   * and data is serialized in JSON (if not empty)
   */
  async post(
    relativePath: string,
    data: any,
    requestHeaders: Record<string, string> = {},
    query?: Query<any>,
    parseBody: boolean = true
  ): Promise<HTTPClientResponse> {
    const fullHeaders = {
      'content-type': 'application/json',
      ...tolowerCaseKeys(requestHeaders),
    };

    try {
      const res = await this.bc.post(
        relativePath,
        HTTPClient.serializeData(data, fullHeaders),
        query,
        fullHeaders
      );

      return HTTPClient.prepareResponse(res, 'application/json', parseBody);
    } catch (err) {
      throw HTTPClient.prepareResponseError(err);
    }
  }

  /**
   * Send a DELETE request.
   * If no content-type present, adds the header "content-type: application/json"
   * and data is serialized in JSON (if not empty)
   */
  async delete(
    relativePath: string,
    data: any,
    requestHeaders: Record<string, string> = {},
    parseBody: boolean = true
  ) {
    const fullHeaders = {
      'content-type': 'application/json',
      ...tolowerCaseKeys(requestHeaders),
    };

    const res = await this.bc.delete(
      relativePath,
      HTTPClient.serializeData(data, fullHeaders),
      undefined,
      fullHeaders
    );

    return HTTPClient.prepareResponse(res, 'application/json', parseBody);
  }
}
