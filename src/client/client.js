const { Buffer } = require("buffer");
const request = require("superagent");

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

    this.get = async function (path, query, requestHeaders={}) {
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