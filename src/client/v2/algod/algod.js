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

        /**
         * Returns the given account's information.
         * @param {string} account The address of the account to look up.
         */
        this.accountInformation = function(account) {
            return new ai.AccountInformation(c, account);
        };

        /**
         * Gets the block info for the given round.
         * @param {number} roundNumber The round number of the block to get.
         */
        this.block = function(roundNumber) {
            return new blk.Block(c, roundNumber);
        };

        /**
         * Returns the transaction information for a specific pending transaction.
         * @param {string} txid The TxID string of the pending transaction to look up.
         */
        this.pendingTransactionInformation = function(txid) {
            return new pti.PendingTransactionInformation(c, txid);
        };

        /**
         * Returns transactions that are pending in the pool.
         */
        this.pendingTransactionsInformation = function() {
            return new pt.PendingTransactions(c);
        };

        /**
         * Returns transactions that are pending in the pool sent by a specific sender.
         * @param {string} address The address of the sender.
         */
        this.pendingTransactionByAddress = function(address) {
            return new ptba.PendingTransactionsByAddress(c, address);
        };

        /**
         * Retrieves the StatusResponse from the running node.
         */
        this.status = function() {
            return new status.Status(c);
        };

        /**
         * Waits for a specific round to occur then returns the StatusResponse for that round.
         * @param {number} round The number of the round to wait for.
         */
        this.statusAfterBlock = function (round) {
            return new sab.StatusAfterBlock(c, round);
        };

        /**
         * Returns the common needed parameters for a new transaction.
         */
        this.getTransactionParams = function () {
            return new sp.SuggestedParams(c);
        };

        /**
         * Gets the supply details for the specified node's ledger.
         */
        this.supply = function () {
            return new supply.Supply(c);
        };

        this.compile = function (source) {
            return new compile.Compile(c, source);
        };

        this.dryrun = function (dr) {
            return new dryrun.Dryrun(c, dr);
        };

        /**
         * Given an asset ID, return asset information including creator, name, total supply and
         * special addresses.
         * @param {number} index The asset ID to look up.
         */
        this.getAssetByID = function (index) {
            return new gasbid.GetAssetByID(c, index);
        }

        /**
         * Given an application ID, it returns application information including creator, approval
         * and clear programs, global and local schemas, and global state.
         * @param {number} index The application ID to look up.
         */
        this.getApplicationByID = function (index) {
            return new gapbid.GetApplicationByID(c, index);
        }
    }
}


module.exports = { AlgodClient };
