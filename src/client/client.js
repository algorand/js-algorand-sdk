var request = require("superagent");

function HTTPClient(tokenHeader, token, baseServer, port) {
    this.address = baseServer + ":" + port.toString();
    this.token = token;

    this.get = async function (path, query) {
        try {
            return await request
                .get(this.address + path)
                .set(tokenHeader, token)
                .set('Accept', 'application/json')
                .query(query);
        } catch (e) {
            throw e;
        }
    };

    this.post = async function (path, data) {
        try {
            return await request
                .post(this.address + path)
                .set(tokenHeader, token)
                .send(data);
        } catch (e) {
            throw e.response;
        }
    };

    this.delete = async function (path, data) {
        try {
            return await request
                .delete(this.address + path)
                .set(tokenHeader, token)
                .send(data);
        } catch (e) {
            throw e.response;
        }
    };
}

module.exports = {HTTPClient};