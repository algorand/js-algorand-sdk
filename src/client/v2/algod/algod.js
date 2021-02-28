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
        let tokenHeader = {};
        if (typeof (token) == 'string' && token !== '') {
            tokenHeader = {"X-Algo-API-Token": token};
        }

        // Get client
        this.c = new client.HTTPClient(tokenHeader, baseServer, port, headers);

        this.intDecoding = 'default';
    }

    /**
     * Set the default int decoding method for all JSON requests this client creates.
     * @param {"default" | "safe" | "mixed" | "bigint"} method The method to use when parsing the
     *   response for request. Must be one of "default", "safe", "mixed", or "bigint". See
     *   JSONRequest.setIntDecoding for more details about what each method does.
     */
    setIntEncoding(method) {
        this.intDecoding = method;
    }

    /**
     * Get the default int decoding method for all JSON requests this client creates.
     */
    getIntEncoding() {
        return this.intDecoding;
    }

    healthCheck() {
        return new hc.HealthCheck(this.c);
    }

    versionsCheck() {
        return new versions.Versions(this.c);
    }

    sendRawTransaction(stx_or_stxs) {
        return new srt.SendRawTransaction(this.c, stx_or_stxs);
    }

    /**
     * Returns the given account's information.
     * @param {string} account The address of the account to look up.
     */
    accountInformation(account) {
        return new ai.AccountInformation(this.c, this.intDecoding, account);
    }

    /**
     * Gets the block info for the given round.
     * @param {number} roundNumber The round number of the block to get.
     */
    block(roundNumber) {
        return new blk.Block(this.c, roundNumber);
    }

    /**
     * Returns the transaction information for a specific pending transaction.
     * @param {string} txid The TxID string of the pending transaction to look up.
     */
    pendingTransactionInformation(txid) {
        return new pti.PendingTransactionInformation(this.c, txid);
    }

    /**
     * Returns transactions that are pending in the pool.
     */
    pendingTransactionsInformation() {
        return new pt.PendingTransactions(this.c);
    }

    /**
     * Returns transactions that are pending in the pool sent by a specific sender.
     * @param {string} address The address of the sender.
     */
    pendingTransactionByAddress(address) {
        return new ptba.PendingTransactionsByAddress(this.c, address);
    }

    /**
     * Retrieves the StatusResponse from the running node.
     */
    status() {
        return new status.Status(this.c, this.intDecoding);
    }

    /**
     * Waits for a specific round to occur then returns the StatusResponse for that round.
     * @param {number} round The number of the round to wait for.
     */
    statusAfterBlock(round) {
        return new sab.StatusAfterBlock(this.c, this.intDecoding, round);
    }

    /**
     * Returns the common needed parameters for a new transaction.
     */
    getTransactionParams() {
        return new sp.SuggestedParams(this.c);
    }

    /**
     * Gets the supply details for the specified node's ledger.
     */
    supply() {
        return new supply.Supply(this.c, this.intDecoding);
    }

    compile(source) {
        return new compile.Compile(this.c, source);
    }

    dryrun(dr) {
        return new dryrun.Dryrun(this.c, dr);
    }

    /**
     * Given an asset ID, return asset information including creator, name, total supply and
     * special addresses.
     * @param {number} index The asset ID to look up.
     */
    getAssetByID(index) {
        return new gasbid.GetAssetByID(this.c, this.intDecoding, index);
    }

    /**
     * Given an application ID, it returns application information including creator, approval
     * and clear programs, global and local schemas, and global state.
     * @param {number} index The application ID to look up.
     */
    getApplicationByID(index) {
        return new gapbid.GetApplicationByID(this.c, this.intDecoding, index);
    }
}


module.exports = { AlgodClient };
