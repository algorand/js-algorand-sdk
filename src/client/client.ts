import request from 'superagent';
import * as utils from '../utils/utils';
import IntDecoding from '../types/intDecoding';

interface ErrorWithAdditionalInfo extends Error {
  rawResponse: string | null;
  statusCode: number;
}

function createJSONParser(options: utils.JSONOptions) {
  return (
    res: request.Response,
    // eslint-disable-next-line no-unused-vars
    fnOrStr: string | ((err: Error, obj: any) => void)
    // eslint-disable-next-line consistent-return
  ) => {
    if (typeof fnOrStr === 'string') {
      // in browser
      return fnOrStr && utils.parseJSON(fnOrStr, options);
    }

    // in node
    // based off https://github.com/visionmedia/superagent/blob/1277a880c32191e300b229e352e0633e421046c8/src/node/parsers/json.js
    res.text = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      res.text += chunk;
    });
    res.on('end', () => {
      let body: any;
      let err: ErrorWithAdditionalInfo | null;
      try {
        body = res.text && utils.parseJSON(res.text, options);
      } catch (err_) {
        err = err_;
        // issue #675: return the raw response if the response parsing fails
        err.rawResponse = res.text || null;
        // issue #876: return the http status code if the response parsing fails
        err.statusCode = res.status;
      } finally {
        fnOrStr(err, body);
      }
    });
  };
}

/**
 * Remove falsy values or values with a length of 0 from an object.
 * @param obj
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

type Query<F> = {
  format?: F;
  [key: string]: any;
};

/**
 * getAcceptFormat returns the correct Accept header depending on the
 * requested format.
 * @param query
 */
/* eslint-disable no-redeclare,no-unused-vars */
function getAcceptFormat(
  query?: Query<'msgpack' | 'json'>
): 'application/msgpack' | 'application/json' {
  /* eslint-enable no-redeclare,no-unused-vars */
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

export interface AlgodTokenHeader {
  'X-Algo-API-Token': string;
}

export interface IndexerTokenHeader {
  'X-Indexer-API-Token': string;
}

export interface KMDTokenHeader {
  'X-KMD-API-Token': string;
}

export type TokenHeader =
  | AlgodTokenHeader
  | IndexerTokenHeader
  | KMDTokenHeader;

export default class HTTPClient {
  private address: string;
  private tokenHeader: TokenHeader;
  public intDecoding: IntDecoding = IntDecoding.DEFAULT;

  constructor(
    tokenHeader: string | TokenHeader,
    baseServer: string,
    port?: number,
    private defaultHeaders: Record<string, any> = {}
  ) {
    // Do not need colon if port is empty
    let baseServerWithPort = baseServer;
    if (typeof port !== 'undefined') {
      baseServerWithPort += `:${port.toString()}`;
    }
    this.address = baseServerWithPort;
    this.defaultHeaders = defaultHeaders;

    // Accept token header as string or object
    // - workaround to allow backwards compatibility for multiple headers
    if (typeof tokenHeader === 'string') {
      this.tokenHeader = {
        'X-Algo-API-Token': tokenHeader,
      };
    } else {
      this.tokenHeader = tokenHeader;
    }
  }

  /**
   * Send a GET request.
   * @param {string} path The path of the request.
   * @param {object} query An object containing the query paramters of the request.
   * @param {object} requestHeaders An object containing additional request headers to use.
   * @param {object} jsonOptions Options object to use to decode JSON responses. See
   *   utils.parseJSON for the options available.
   * @returns Response object.
   */
  async get(
    path: string,
    query?: Query<any>,
    requestHeaders: Record<string, any> = {},
    jsonOptions: utils.JSONOptions = {}
  ) {
    const format = getAcceptFormat(query);
    let r = request
      .get(this.address + path)
      .set(this.tokenHeader)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .set('Accept', format)
      .query(removeFalsyOrEmpty(query));

    if (format === 'application/msgpack') {
      r = r.responseType('arraybuffer');
    } else if (
      format === 'application/json' &&
      Object.keys(jsonOptions).length !== 0
    ) {
      if (utils.isNode()) {
        // in node, need to set buffer
        r = r.buffer(true);
      }
      r = r.parse(createJSONParser(jsonOptions));
    }

    const res = await r;
    if (Buffer.isBuffer(res.body)) {
      // In node res.body will be a Buffer, but in the browser it will be an ArrayBuffer
      // (thanks superagent...), so convert it to an ArrayBuffer for consistency.
      const underlyingArrayBuffer = res.body.buffer;
      const start = res.body.byteOffset;
      const end = start + res.body.byteLength;
      res.body = underlyingArrayBuffer.slice(start, end);
    }
    return res;
  }

  async post(
    path: string,
    data: string | object,
    requestHeaders: Record<string, any> = {}
  ) {
    return request
      .post(this.address + path)
      .set(this.tokenHeader)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .send(data);
  }

  async delete(
    path: string,
    data: string | object,
    requestHeaders: Record<string, any> = {}
  ) {
    return request
      .delete(this.address + path)
      .set(this.tokenHeader)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .send(data);
  }
}
