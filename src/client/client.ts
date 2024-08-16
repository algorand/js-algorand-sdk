import * as utils from '../utils/utils.js';
import {
  BaseHTTPClient,
  BaseHTTPClientResponse,
  Query,
} from './baseHTTPClient.js';
import {
  TokenHeader,
  URLTokenBaseHTTPClient,
} from './urlTokenBaseHTTPClient.js';

interface ErrorWithAdditionalInfo extends Error {
  rawResponse: string | null;
  statusCode: number;
}

export class HTTPClientResponse {
  /**
   * The raw response bytes
   */
  body: Uint8Array;
  /**
   * If the expected response type is JSON, this is the response bytes converted to a string.
   */
  text?: string;
  format: 'application/msgpack' | 'application/json';
  headers: Record<string, string>;
  status: number;
  ok: boolean;

  constructor(options: {
    body: Uint8Array;
    text?: string;
    format: 'application/msgpack' | 'application/json';
    headers: Record<string, string>;
    status: number;
    ok: boolean;
  }) {
    this.body = options.body;
    this.text = options.text;
    this.format = options.format;
    this.headers = options.headers;
    this.status = options.status;
    this.ok = options.ok;
  }

  /**
   * Returns the response body as a string, ready to be parsed as JSON.
   */
  getJSONText(): string {
    if (this.text === undefined) {
      throw new Error(
        `Response body does not contain JSON data. Format is ${this.format}`
      );
    }
    return this.text;
  }

  /**
   * Parses the response body as JSON with the given options.
   */
  parseBodyAsJSON(jsonOptions: utils.ParseJSONOptions) {
    if (this.text === undefined) {
      throw new Error(
        `Response body does not contain JSON data. Format is ${this.format}`
      );
    }
    // eslint-disable-next-line no-use-before-define
    return HTTPClient.parseJSON(this.text, this.status, jsonOptions);
  }
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
function tolowerCaseKeys(o: Record<string, any>): Record<string, any> {
  /* eslint-disable no-param-reassign,no-return-assign,no-sequences */
  return Object.keys(o).reduce(
    (c, k) => ((c[k.toLowerCase()] = o[k]), c),
    {} as Record<string, any>
  );
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
export class HTTPClient {
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
   * Parse JSON using utils.parseJSON
   *
   * @param text - JSON data
   * @param status - Status of the response (used in case parseJSON fails)
   * @param jsonOptions - Options object to use to decode JSON responses. See
   *   utils.parseJSON for the options available.
   */
  public static parseJSON(
    text: string,
    status: number,
    jsonOptions: utils.ParseJSONOptions
  ) {
    try {
      if (!text) {
        return null;
      }
      return utils.parseJSON(text, jsonOptions);
    } catch (err_) {
      const err = err_ as ErrorWithAdditionalInfo;
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
      return new TextEncoder().encode(utils.stringifyJSON(data));
    }
    if (typeof data === 'string') {
      return new TextEncoder().encode(data);
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
    format: 'application/msgpack' | 'application/json'
  ): HTTPClientResponse {
    const { body } = res;
    let text: string | undefined;

    if (format !== 'application/msgpack') {
      text = (body && new TextDecoder().decode(body)) || '';
    }

    return new HTTPClientResponse({
      ...res,
      format,
      text,
      ok: Math.trunc(res.status / 100) === 2,
    });
  }

  /**
   * Prepare an error with a response
   * (the type of errors BaseHTTPClient are supposed to throw)
   * by adding the status and preparing the internal response
   * @private
   */
  private static prepareResponseError(err: any) {
    if (err.response) {
      // eslint-disable-next-line no-param-reassign
      err.response = HTTPClient.prepareResponse(
        err.response,
        'application/json'
      );
      // eslint-disable-next-line no-param-reassign
      err.status = err.response.status;
    }
    return err;
  }

  /**
   * Send a GET request.
   *
   * @param options - The options to use for the request.
   * @param options.relativePath - The path of the request.
   * @param options.query - An object containing the query parameters of the request.
   * @param options.requestHeaders - An object containing additional request headers to use.
   *   or not.
   * @param options.customOptions - An object containing additional options to pass to the
   *   underlying BaseHTTPClient instance.
   * @returns Response object.
   */
  async get({
    relativePath,
    query,
    requestHeaders,
    customOptions,
  }: {
    relativePath: string;
    query?: Query<any>;
    requestHeaders?: Record<string, string>;
    customOptions?: Record<string, unknown>;
  }): Promise<HTTPClientResponse> {
    const format = getAcceptFormat(query);
    const fullHeaders = { ...(requestHeaders ?? {}), accept: format };

    try {
      const res = await this.bc.get(
        relativePath,
        query ? removeFalsyOrEmpty(query) : undefined,
        fullHeaders,
        customOptions
      );

      return HTTPClient.prepareResponse(res, format);
    } catch (err) {
      throw HTTPClient.prepareResponseError(err);
    }
  }

  /**
   * Send a POST request.
   * If no content-type present, adds the header "content-type: application/json"
   * and data is serialized in JSON (if not empty)
   * @param options - The options to use for the request.
   */
  async post({
    relativePath,
    data,
    query,
    requestHeaders,
    customOptions,
  }: {
    relativePath: string;
    data: any;
    query?: Query<any>;
    requestHeaders?: Record<string, string>;
    customOptions?: Record<string, unknown>;
  }): Promise<HTTPClientResponse> {
    const fullHeaders = {
      'content-type': 'application/json',
      ...tolowerCaseKeys(requestHeaders ?? {}),
    };

    try {
      const res = await this.bc.post(
        relativePath,
        HTTPClient.serializeData(data, fullHeaders),
        query,
        fullHeaders,
        customOptions
      );

      return HTTPClient.prepareResponse(res, 'application/json');
    } catch (err) {
      throw HTTPClient.prepareResponseError(err);
    }
  }

  /**
   * Send a DELETE request.
   * If no content-type present, adds the header "content-type: application/json"
   * and data is serialized in JSON (if not empty)
   * @param options - The options to use for the request.
   */
  async delete({
    relativePath,
    data,
    requestHeaders,
    customOptions,
  }: {
    relativePath: string;
    data: any;
    requestHeaders?: Record<string, string>;
    customOptions?: Record<string, unknown>;
  }) {
    const fullHeaders = {
      'content-type': 'application/json',
      ...tolowerCaseKeys(requestHeaders ?? {}),
    };

    try {
      const res = await this.bc.delete(
        relativePath,
        typeof data !== 'undefined'
          ? HTTPClient.serializeData(data, fullHeaders)
          : undefined,
        undefined,
        fullHeaders,
        customOptions
      );

      return HTTPClient.prepareResponse(res, 'application/json');
    } catch (err) {
      throw HTTPClient.prepareResponseError(err);
    }
  }
}
