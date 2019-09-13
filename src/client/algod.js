const client = require('./client');

// token can either be the X-Algo-API-Token string value or is a JS Object to allow setting multiple headers in the request
// ex. 
// const token = {
//    'X-API-Key': 'SOME VALUE',
//   'X-Algo-API-Token': 'ANOTHER VALUE'
// };
// const algodclient = new algosdk.Algod(token, baseServer, port);


function Algod(token = '', baseServer = "http://r2.algorand.network", port = 4180) {

    // workaround to allow backwards compatibility for multiple headers
    let requestHeaders = token;
    if (typeof (requestHeaders) == 'string') {
        requestHeaders = {'X-Algo-API-Token': requestHeaders};
    }

    // Get client
    let c = new client.HTTPClient(requestHeaders, baseServer, port);

    /**
     * Takes an object and convert its note field to Buffer, if exist.
     * @param o
     * @returns {*}
     */
    function noteb64ToNote(o) {
        if (o.noteb64 !== undefined) {
            o.note = Buffer.from(o.noteb64, "base64")
        }
        return o
    }

    /**
     * status retrieves the StatusResponse from the running node
     * @returns {Promise<*>}
     */
    this.status = async function () {
        let res = await c.get("/v1/status");
        return res.body;
    };

    /**
     * healthCheck returns an empty object iff the node is running
     * @returns {Promise<*>}
     */
    this.healthCheck = async function () {
        let res = await c.get("/health");
        return res.body;
    };

    /**
     * statusAfterBlock waits for round roundNumber to occur then returns the StatusResponse for this round.
     * This call blocks
     * @param roundNumber
     * @returns {Promise<*>}
     */
    this.statusAfterBlock = async function (roundNumber) {
        if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
        let res = await c.get("/v1/status/wait-for-block-after/" + roundNumber);
        return res.body;
    };

    /**
     * pendingTransactions asks algod for a snapshot of current pending txns on the node, bounded by maxTxns.
     * If maxTxns = 0, fetches as many transactions as possible.
     * @param maxTxns number
     * @returns {Promise<*>}
     */
    this.pendingTransactions = async function (maxTxns) {
        if (!Number.isInteger(maxTxns)) throw Error("maxTxns should be an integer");
        let res = await c.get("/v1/transactions/pending", { 'max': maxTxns });
        if (res.statusCode === 200 && res.body.truncatedTxns.transactions !== undefined) {
            for (let i = 0; i < res.body.truncatedTxns.transactions.length; i++) {
                res.body.truncatedTxns.transactions[i] = noteb64ToNote(res.body.truncatedTxns.transactions[i]);
            }
        }
        return res.body;
    };

    /**
     * versions retrieves the VersionResponse from the running node
     * @returns {Promise<*>}
     */
    this.versions = async function () {
        let res = await c.get("/versions");
        return res.body;
    };

    /**
     * LedgerSupply gets the supply details for the specified node's Ledger
     * @returns {Promise<*>}
     */
    this.ledgerSupply = async function () {
        let res = await c.get("/v1/ledger/supply");
        return res.body;
    };

    /**
     * transactionsByAddress returns all transactions for a PK [addr] in the [first, last] rounds range.
     * @param addr string
     * @param first number, optional
     * @param last number, optional
     * @param maxTxns number, optional
     * @returns {Promise<*>}
     */
    this.transactionByAddress = async function (addr, first=null, last=null, maxTxns=null) {

        if (( first !== null ) && (!Number.isInteger(first) )){
            throw Error("first round should be an integer")
        }
        if (( last !== null ) && (!Number.isInteger(last) )){
            throw Error("last round should be an integer")
        }
        let res = await c.get("/v1/account/" + addr + "/transactions", { 'firstRound': first, 'lastRound': last, 'max': maxTxns });
        if (res.statusCode === 200 && res.body.transactions !== undefined) {
            for (let i = 0; i < res.body.transactions.length; i++) {
                res.body.transactions[i] = noteb64ToNote(res.body.transactions[i]);
            }
        }
        return res.body;
    };

    /**
     * transactionsByAddressAndDate returns all transactions for a PK [addr] in the [fromDate, toDate] date range. 
     * The date is a string in the YYYY-MM-DD format.
     * @param addr string
     * @param fromDate string
     * @param toDate string
     * @param maxTxns number, optional
     * @returns {Promise<*>}
     */
    this.transactionByAddressAndDate = async function (addr, fromDate, toDate, maxTxns=null) {
        let res = await c.get("/v1/account/" + addr + "/transactions", { 'fromDate': fromDate, 'toDate': toDate, 'max': maxTxns });
        if (res.statusCode === 200 && res.body.transactions !== undefined) {
            for (let i = 0; i < res.body.transactions.length; i++) {
                res.body.transactions[i] = noteb64ToNote(res.body.transactions[i]);
            }
        }
        return res.body;
    };

    /**
     * transactionById returns the a transaction information of a specific txid [txId]
     * Note - This method is allowed only when Indexer is enabled.
     * @param txid
     * @returns {Promise<*>}
     */
    this.transactionById = async function (txid) {
        let res = await c.get("/v1/transaction/" + txid);
        if (res.statusCode === 200) {
            res.body = noteb64ToNote(res.body);
        }
        return res.body;
    };

    /**
     * transactionInformation returns the transaction information of a specific txid and an address
     * @param addr
     * @param txid
     * @returns {Promise<*>}
     */
    this.transactionInformation = async function (addr, txid) {
        let res = await c.get("/v1/account/" + addr + "/transaction/" + txid);
        if (res.statusCode === 200) {
            res.body = noteb64ToNote(res.body);
        }
        return res.body;
    };

    /**
     * pendingTransactionInformation returns the transaction information for a specific txid of a pending transaction
     * @param txid
     * @returns {Promise<*>}
     */
    this.pendingTransactionInformation = async function (txid) {
        let res = await c.get("/v1/transactions/pending/" + txid);
        if (res.statusCode === 200) {
            res.body = noteb64ToNote(res.body);
        }
        return res.body;
    };

    /**
     * accountInformation returns the passed account's information
     * @param addr string
     * @returns {Promise<*>}
     */
    this.accountInformation = async function (addr) {
        let res = await c.get("/v1/account/" + addr);
        return res.body;
    };

    /**
     * suggestedFee gets the recommended transaction fee from the node
     * @returns {Promise<*>}
     */
    this.suggestedFee = async function () {
        let res = await c.get("/v1/transactions/fee");
        return res.body;
    };

    /**
     * sendRawTransaction gets an encoded SignedTxn and broadcasts it to the network
     * @param txn Uin8Array
     * @returns {Promise<*>}
     */
    this.sendRawTransaction = async function (txn) {
        let res = await c.post("/v1/transactions", Buffer.from(txn));
        return res.body;
    };

    /**
     * getTransactionParams returns to common needed parameters for a new transaction
     * @returns {Promise<*>}
     */
    this.getTransactionParams = async function () {
        let res = await c.get("/v1/transactions/params");
        return res.body;
    };

    /**
     * block gets the block info for the given round This call blocks
     * @param roundNumber
     * @returns {Promise<*>}
     */
    this.block = async function (roundNumber) {
        if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
        let res = await c.get("/v1/block/" + roundNumber);
        if (res.statusCode === 200 && res.body.txns.transactions !== undefined) {
            for (let i = 0; i < res.body.txns.transactions.length; i++) {
                res.body.txns.transactions[i] = noteb64ToNote(res.body.txns.transactions[i]);
            }
        }
        return res.body;
    };

}


module.exports = { Algod };
