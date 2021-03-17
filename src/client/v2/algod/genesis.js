const { JSONRequest } = require('../jsonrequest');

class Genesis extends JSONRequest {
  // eslint-disable-next-line no-underscore-dangle,class-methods-use-this
  _path() {
    return '/v2/genesis';
  }
}

module.exports = { Genesis };
