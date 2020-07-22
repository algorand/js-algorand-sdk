const client = require('../../client');
const ai = require('../algod/accountInformation');
const blk = require('../algod/block');
const compile = require('./compile');
const dryrun = require('./dryrun');
const gasbid = require('./getAssetByID');
const gapbid = require('./getApplicationByID');
const hc = require('../algod/healthCheck');
const pti = require('../algod/pendingTransactionInformation');
const pt = require('../algod/pendingTransactions');
const ptba = require('../algod/pendingTransactionsByAddress');
const srt = require('../algod/sendRawTransaction');
const status = require('../algod/status');
const sab = require('../algod/statusAfterBlock');
const sp = require('../algod/suggestedParams');
const supply = require('../algod/supply');
const versions = require('../algod/versions');

class AlgodClient {
    constructor(token = '', baseServer = "http://r2.algorand.network", port = 4180, headers = {}) {
        // workaround to allow backwards compatibility for multiple headers
        let tokenHeader = token;
        if (typeof (tokenHeader) == 'string') {
            tokenHeader = {"X-Algo-API-Token": tokenHeader};
        }

        // Get client
        let c = new client.HTTPClient(tokenHeader, baseServer, port, headers);

        this.healthCheck = function () {
            return new hc.HealthCheck(c);
        };

        this.versionsCheck = function () {
            return new versions.Versions(c);
        };

        this.sendRawTransaction = function(stx_or_stxs) {
            return new srt.SendRawTransaction(c, stx_or_stxs);
        };

        this.accountInformation = function(account) {
            return new ai.AccountInformation(c, account);
        };

        this.block = function(roundNumber) {
            return new blk.Block(c, roundNumber);
        };

        this.pendingTransactionInformation = function(txid) {
            return new pti.PendingTransactionInformation(c, txid);
        };

        this.pendingTransactionsInformation = function() {
            return new pt.PendingTransactions(c);
        };

        this.pendingTransactionByAddress = function(address) {
            return new ptba.PendingTransactionsByAddress(c, address);
        };

        this.status = function() {
            return new status.Status(c);
        };

        this.statusAfterBlock = function (round) {
            return new sab.StatusAfterBlock(c, round);
        };

        this.getTransactionParams = function () {
            return new sp.SuggestedParams(c);
        };

        this.supply = function () {
            return new supply.Supply(c);
        };

        this.compile = function (source) {
            return new compile.Compile(c, source);
        };

        this.dryrun = function (dr) {
            return new dryrun.Dryrun(c, dr);
        };

        this.getAssetByID = function (index) {
            return new gasbid.GetAssetByID(c, index);
        }

        this.getApplicationByID = function (index) {
            return new gapbid.GetApplicationByID(c, index);
        }
    }
}


module.exports = { AlgodClient };
