const { Buffer } = require('buffer');
const request = require('superagent');
const utils = require('../utils/utils');

function createJSONParser(options) {
  // eslint-disable-next-line consistent-return
  return (res, fn) => {
    if (typeof fn === 'string') {
      // in browser
      return fn && utils.parseJSON(fn, options);
    }

    // in node
    // based off https://github.com/visionmedia/superagent/blob/1277a880c32191e300b229e352e0633e421046c8/src/node/parsers/json.js
    res.text = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      res.text += chunk;
    });
    res.on('end', () => {
      let body;
      let err;
      try {
        body = res.text && utils.parseJSON(res.text, options);
      } catch (err_) {
        err = err_;
        // issue #675: return the raw response if the response parsing fails
        err.rawResponse = res.text || null;
        // issue #876: return the http status code if the response parsing fails
        err.statusCode = res.statusCode;
      } finally {
        fn(err, body);
      }
    });
  };
}

/**
 * removeEmpty gets a dictionary and removes empty values
 * @param obj
 * @returns {*}
 */
function removeEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // eslint-disable-next-line no-param-reassign
      if (!obj[key] || obj[key].length === 0) delete obj[key];
    }
  }
  return obj;
}

/**
 * getAccceptFormat returns the correct Accept header depending on the
 * requested format.
 * @param query
 * @returns {string}
 */
function getAccceptFormat(query) {
  if (
    query !== undefined &&
    Object.prototype.hasOwnProperty.call(query, 'format')
  ) {
    switch (query.format) {
      case 'msgpack':
        return 'application/msgpack';
      case 'json':
        return 'application/json';
      default:
        return 'application/json';
    }
  } else return 'application/json';
}

function HTTPClient(token, baseServer, port, headers = {}) {
  // Do not need colon if port is empty
  let baseServerWithPort = baseServer;
  if (port !== '') {
    baseServerWithPort += `:${port.toString()}`;
  }
  this.address = baseServerWithPort;
  this.token = token;
  this.defaultHeaders = headers;

  /**
   * Send a GET request.
   * @param {string} path The path of the request.
   * @param {object} query An object containing the query paramters of the request.
   * @param {object} requestHeaders An object containing additional request headers to use.
   * @param {object} jsonOptions Options object to use to decode JSON responses. See
   *   utils.parseJSON for the options available.
   * @returns {Promise<object>} Response object.
   */
  this.get = async (path, query, requestHeaders = {}, jsonOptions = {}) => {
    const format = getAccceptFormat(query);
    let r = request
      .get(this.address + path)
      .set(this.token)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .set('Accept', format)
      .query(removeEmpty(query));

    if (format === 'application/msgpack') {
      r = r.responseType('arraybuffer');
    } else if (
      format === 'application/json' &&
      Object.keys(jsonOptions).length !== 0
    ) {
      if (r.buffer !== r.ca) {
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
  };

  this.post = async (path, data, requestHeaders = {}) =>
    request
      .post(this.address + path)
      .set(this.token)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .send(data);

  this.delete = async (path, data, requestHeaders = {}) =>
    request
      .delete(this.address + path)
      .set(this.token)
      .set(this.defaultHeaders)
      .set(requestHeaders)
      .send(data);
}

module.exports = { HTTPClient };
