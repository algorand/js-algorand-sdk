var request = require("superagent");

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
            return await request
                .get(this.address + path)
                .set(this.token)
                .set(this.defaultHeaders)
                .set(requestHeaders)
                .set('Accept', getAccceptFormat(query))
                .query(removeEmpty(query));
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
            throw e.response;
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
            throw e.response;
        }
    };
}

module.exports = { HTTPClient };