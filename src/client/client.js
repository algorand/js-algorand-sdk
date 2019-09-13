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

function HTTPClient(requestHeaders, baseServer, port) {
    // Do not need colon if port is empty
    if (port !== '') {
        baseServer += ":" + port.toString();
    }
    this.address = baseServer;

    this.get = async function (path, query) {
        try {
            return await request
                .get(this.address + path)
                .set(requestHeaders)
                .set('Accept', 'application/json')
                .query(removeEmpty(query));
        } catch (e) {
            throw e;
        }
    };

    this.post = async function (path, data) {
        try {
            return await request
                .post(this.address + path)
                .set(requestHeaders)
                .send(data);
        } catch (e) {
            throw e.response;
        }
    };

    this.delete = async function (path, data) {
        try {
            return await request
                .delete(this.address + path)
                .set(requestHeaders)
                .send(data);
        } catch (e) {
            throw e.response;
        }
    };
}

module.exports = { HTTPClient };