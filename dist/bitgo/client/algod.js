"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const client = require('./client'); // token can either be the X-Algo-API-Token string value or is a JS Object to allow setting multiple headers in the request
// ex. 
// const token = {
//    'X-API-Key': 'SOME VALUE',
//   'X-Algo-API-Token': 'ANOTHER VALUE'
// };
// const algodclient = new algosdk.Algod(token, baseServer, port);


function Algod(token = '', baseServer = "http://r2.algorand.network", port = 4180) {
  // workaround to allow backwards compatibility for multiple headers
  let requestHeaders = token;

  if (typeof requestHeaders == 'string') {
    requestHeaders = {
      'X-Algo-API-Token': requestHeaders
    };
  }

  ; // Get client

  let c = new client.HTTPClient(requestHeaders, baseServer, port);
  /**
   * Takes an object and convert its note field to Buffer, if exist.
   * @param o
   * @returns {*}
   */

  function noteb64ToNote(o) {
    if (o.noteb64 !== undefined) {
      o.note = Buffer.from(o.noteb64, "base64");
    }

    return o;
  }
  /**
   * status retrieves the StatusResponse from the running node
   * @returns {Promise<*>}
   */


  this.status =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/v1/status");
    return res.body;
  });
  /**
   * helathCheck returns an empty object iff the node is running
   * @returns {Promise<*>}
   */

  this.healthCheck =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/health");
    return res.body;
  });
  /**
   * statusAfterBlock waits for round roundNumber to occur then returns the StatusResponse for this round.
   * This call blocks
   * @param roundNumber
   * @returns {Promise<*>}
   */

  this.statusAfterBlock =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(function* (roundNumber) {
      if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
      let res = yield c.get("/v1/status/wait-for-block-after/" + roundNumber);
      return res.body;
    });

    return function (_x) {
      return _ref3.apply(this, arguments);
    };
  }();
  /**
   * pendingTransactions asks algod for a snapshot of current pending txns on the node, bounded by maxTxns.
   * If maxTxns = 0, fetches as many transactions as possible.
   * @param maxTxns number
   * @returns {Promise<*>}
   */


  this.pendingTransactions =
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(function* (maxTxns) {
      if (!Number.isInteger(maxTxns)) throw Error("maxTxns should be an integer");
      let res = yield c.get("/v1/transactions/pending", {
        'max': maxTxns
      });

      if (res.statusCode === 200 && res.body.truncatedTxns.transactions !== undefined) {
        for (let i = 0; i < res.body.truncatedTxns.transactions.length; i++) {
          res.body.truncatedTxns.transactions[i] = noteb64ToNote(res.body.truncatedTxns.transactions[i]);
        }
      }

      return res.body;
    });

    return function (_x2) {
      return _ref4.apply(this, arguments);
    };
  }();
  /**
   * versions retrieves the VersionResponse from the running node
   * @returns {Promise<*>}
   */


  this.versions =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/versions");
    return res.body;
  });
  /**
   * LedgerSupply gets the supply details for the specified node's Ledger
   * @returns {Promise<*>}
   */

  this.ledgerSupply =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/v1/ledger/supply");
    return res.body;
  });
  /**
   * transactionsByAddress returns all transactions for a PK [addr] in the [first, last] rounds range.
   * @param addr string
   * @param first number
   * @param last number
   * @returns {Promise<*>}
   */

  this.transactionByAddress =
  /*#__PURE__*/
  function () {
    var _ref7 = _asyncToGenerator(function* (addr, first, last) {
      if (!Number.isInteger(first) || !Number.isInteger(last)) throw Error("first and last rounds should be integers");
      let res = yield c.get("/v1/account/" + addr + "/transactions", {
        'firstRound': first,
        'lastRound': last
      });

      if (res.statusCode === 200 && res.body.transactions !== undefined) {
        for (let i = 0; i < res.body.transactions.length; i++) {
          res.body.transactions[i] = noteb64ToNote(res.body.transactions[i]);
        }
      }

      return res.body;
    });

    return function (_x3, _x4, _x5) {
      return _ref7.apply(this, arguments);
    };
  }();
  /**
   * accountInformation returns the passed account's information
   * @param addr string
   * @returns {Promise<*>}
   */


  this.accountInformation =
  /*#__PURE__*/
  function () {
    var _ref8 = _asyncToGenerator(function* (addr) {
      let res = yield c.get("/v1/account/" + addr);
      return res.body;
    });

    return function (_x6) {
      return _ref8.apply(this, arguments);
    };
  }();
  /**
   * transactionInformation returns the a transaction information of a specific txid and an address
   * @param addr
   * @param txid
   * @returns {Promise<*>}
   */


  this.transactionInformation =
  /*#__PURE__*/
  function () {
    var _ref9 = _asyncToGenerator(function* (addr, txid) {
      let res = yield c.get("/v1/account/" + addr + "/transaction/" + txid);

      if (res.statusCode === 200) {
        res.body = noteb64ToNote(res.body);
      }

      return res.body;
    });

    return function (_x7, _x8) {
      return _ref9.apply(this, arguments);
    };
  }();
  /**
   * suggestedFee gets the recommended transaction fee from the node
   * @returns {Promise<*>}
   */


  this.suggestedFee =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/v1/transactions/fee");
    return res.body;
  });
  /**
   * sendRawTransaction gets an encoded SignedTxn and broadcasts it to the network
   * @param txn Uin8Array
   * @returns {Promise<*>}
   */

  this.sendRawTransaction =
  /*#__PURE__*/
  function () {
    var _ref11 = _asyncToGenerator(function* (txn) {
      let res = yield c.post("/v1/transactions", Buffer.from(txn));
      return res.body;
    });

    return function (_x9) {
      return _ref11.apply(this, arguments);
    };
  }();
  /**
   * getTransactionParams returns to common needed parameters for a new transaction
   * @returns {Promise<*>}
   */


  this.getTransactionParams =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/v1/transactions/params");
    return res.body;
  });
  /**
   * block gets the block info for the given round This call blocks
   * @param roundNumber
   * @returns {Promise<*>}
   */

  this.block =
  /*#__PURE__*/
  function () {
    var _ref13 = _asyncToGenerator(function* (roundNumber) {
      if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
      let res = yield c.get("/v1/block/" + roundNumber);

      if (res.statusCode === 200 && res.body.txns.transactions !== undefined) {
        for (let i = 0; i < res.body.txns.transactions.length; i++) {
          res.body.txns.transactions[i] = noteb64ToNote(res.body.txns.transactions[i]);
        }
      }

      return res.body;
    });

    return function (_x10) {
      return _ref13.apply(this, arguments);
    };
  }();
}

module.exports = {
  Algod
};