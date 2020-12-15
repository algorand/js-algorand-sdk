const { Buffer } = require("buffer");
const request = require("superagent");
const utils = require("../utils/utils");

function createJSONParser(options) {
    return (res, fn) => {
        if (typeof fn === 'string') {
            // in browser
            return utils.parseJSON(fn, options);
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
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
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
    if (query !== undefined && query.hasOwnProperty('format'))
        switch(query.format) {
            case 'msgpack':
                return 'application/msgpack';
            case 'json':
                return 'application/json';
            default:
                return 'application/json';
        }
    else
        return "application/json"
 }

function HTTPClient(token, baseServer, port, headers={}) {
    // Do not need colon if port is empty
    if (port !== '') {
        baseServer += ":" + port.toString();
    }
    this.address = baseServer;
    this.token = token;
    this.defaultHeaders = headers;

    /**
     * Send a GET request.
     * @param {string} path The path of the request.
     * @param {object} query An object containing the query paramters of the request.
     * @param {object} requestHeaders An object containing additional request headers to use.
     * @param {boolean} useBigInt If true and the response for this request returns JSON, the all
     *   integers in the response will be decoded as BigInts. If false and the request returns JSON,
     *   all integers will be decoded as Numbers and if the response contains any integers greater
     *   than Number.MAX_SAFE_INTEGER an error will be thrown. If this parameter is omitted, the
     *   JSON response will be parsed regularly and no additional checks on integer values will be
     *   performed.
     * @returns {Promise<object>} Response object.
     */
    this.get = async function (path, query, requestHeaders={}, useBigInt=undefined) {
        try {
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
            } else if (format === 'application/json' && useBigInt != null) {
                if (r.buffer !== r.ca) {
                    // in node, need to set buffer
                    r = r.buffer(true);
                }
                r = r.parse(createJSONParser({ useBigInt }));
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
        } catch (e) {
            throw e;
        }
    };

    this.post = async function (path, data, requestHeaders={}) {
        try {
            return await request
                .post(this.address + path)
                .set(this.token)
                .set(this.defaultHeaders)
                .set(requestHeaders)
                .send(data);
        } catch (e) {
            throw e;
        }
    };

    this.delete = async function (path, data, requestHeaders={}) {
        try {
            return await request
                .delete(this.address + path)
                .set(this.token)
                .set(this.defaultHeaders)
                .set(requestHeaders)
                .send(data);
        } catch (e) {
            throw e;
        }
    };
}

module.exports = { HTTPClient };