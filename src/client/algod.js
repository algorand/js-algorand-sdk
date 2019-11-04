const client = require('./client');

function Algod(token = '', baseServer = "http://r2.algorand.network", port = 4180, headers = {}) {
    // workaround to allow backwards compatibility for multiple headers
    let tokenHeader = token;
    if (typeof (tokenHeader) == 'string') {
        tokenHeader = {"X-Algo-API-Token": tokenHeader};
    }

    // Get client
    let c = new client.HTTPClient(tokenHeader, baseServer, port, headers);

    /**
     * Takes an object and convert its note field to Buffer, if exist.
     * @param o
     * @returns {*}
     */
    function noteb64ToNote(o) {
        if (!(o.noteb64 === undefined || o.noteb64 === null)) {
            o.note = Buffer.from(o.noteb64, "base64")
        }
        return o
    }

    /**
     * status retrieves the StatusResponse from the running node
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.status = async function (headers={}) {
        let res = await c.get("/v1/status", {}, headers);
        return res.body;
    };

    /**
     * healthCheck returns an empty object iff the node is running
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.healthCheck = async function (headers={}) {
        let res = await c.get("/health", {}, headers);
        return res.body;
    };

    /**
     * statusAfterBlock waits for round roundNumber to occur then returns the StatusResponse for this round.
     * This call blocks
     * @param roundNumber
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.statusAfterBlock = async function (roundNumber, headers={}) {
        if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
        let res = await c.get("/v1/status/wait-for-block-after/" + roundNumber, {}, headers);
        return res.body;
    };

    /**
     * pendingTransactions asks algod for a snapshot of current pending txns on the node, bounded by maxTxns.
     * If maxTxns = 0, fetches as many transactions as possible.
     * @param maxTxns number
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.pendingTransactions = async function (maxTxns, headers={}) {
        if (!Number.isInteger(maxTxns)) throw Error("maxTxns should be an integer");
        let res = await c.get("/v1/transactions/pending", { 'max': maxTxns }, headers);
        if (res.statusCode === 200 && res.body.truncatedTxns.transactions !== undefined) {
            for (let i = 0; i < res.body.truncatedTxns.transactions.length; i++) {
                res.body.truncatedTxns.transactions[i] = noteb64ToNote(res.body.truncatedTxns.transactions[i]);
            }
        }
        return res.body;
    };

    /**
     * versions retrieves the VersionResponse from the running node
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.versions = async function (headers={}) {
        let res = await c.get("/versions", {}, headers);
        return res.body;
    };

    /**
     * LedgerSupply gets the supply details for the specified node's Ledger
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.ledgerSupply = async function (headers={}) {
        let res = await c.get("/v1/ledger/supply", {}, headers);
        return res.body;
    };

    /**
     * transactionsByAddress returns all transactions for a PK [addr] in the [first, last] rounds range.
     * @param addr string
     * @param first number, optional
     * @param last number, optional
     * @param maxTxns number, optional
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.transactionByAddress = async function (addr, first=null, last=null, maxTxns=null, headers={}) {

        if (( first !== null ) && (!Number.isInteger(first) )){
            throw Error("first round should be an integer")
        }
        if (( last !== null ) && (!Number.isInteger(last) )){
            throw Error("last round should be an integer")
        }
        let res = await c.get("/v1/account/" + addr + "/transactions", { 'firstRound': first, 'lastRound': last, 'max': maxTxns }, headers);
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
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.transactionByAddressAndDate = async function (addr, fromDate, toDate, maxTxns=null, headers={}) {
        let res = await c.get("/v1/account/" + addr + "/transactions", { 'fromDate': fromDate, 'toDate': toDate, 'max': maxTxns }, headers);
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
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.transactionById = async function (txid, headers={}) {
        let res = await c.get("/v1/transaction/" + txid, {}, headers);
        if (res.statusCode === 200) {
            res.body = noteb64ToNote(res.body);
        }
        return res.body;
    };

    /**
     * transactionInformation returns the transaction information of a specific txid and an address
     * @param addr
     * @param txid
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.transactionInformation = async function (addr, txid, headers={}) {
        let res = await c.get("/v1/account/" + addr + "/transaction/" + txid, {}, headers);
        if (res.statusCode === 200) {
            res.body = noteb64ToNote(res.body);
        }
        return res.body;
    };

    /**
     * pendingTransactionInformation returns the transaction information for a specific txid of a pending transaction
     * @param txid
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.pendingTransactionInformation = async function (txid, headers={}) {
        let res = await c.get("/v1/transactions/pending/" + txid, {}, headers);
        if (res.statusCode === 200) {
            res.body = noteb64ToNote(res.body);
        }
        return res.body;
    };

    /**
     * accountInformation returns the passed account's information
     * @param addr string
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.accountInformation = async function (addr, headers={}) {
        let res = await c.get("/v1/account/" + addr, {}, headers);
        return res.body;
    };

    /**
     * assetInformation returns the information for the asset with the passed creator and index
     * @param index number
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.assetInformation = async function (index, headers={}) {
        let res = await c.get("/v1/asset/" + index, {}, headers);
        return res.body;
    };

    /**
     * suggestedFee gets the recommended transaction fee from the node
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.suggestedFee = async function (headers={}) {
        let res = await c.get("/v1/transactions/fee", {}, headers);
        return res.body;
    };

    /**
     * sendRawTransaction gets an encoded SignedTxn and broadcasts it to the network
     * @param txn Uin8Array
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.sendRawTransaction = async function (txn, headers={}) {
        let res = await c.post("/v1/transactions", Buffer.from(txn), headers);
        return res.body;
    };

    /**
     * sendRawTransactions gets a list of encoded SignedTxns and broadcasts it to the network
     * @param txn Array of Uin8Array
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.sendRawTransactions = async function (txns, headers={}) {
        const merged = Array.prototype.concat(...txns.map(arr => Array.from(arr)));
        let res = await c.post("/v1/transactions", Buffer.from(merged), headers);
        return res.body;
    };

    /**
     * getTransactionParams returns to common needed parameters for a new transaction
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.getTransactionParams = async function (headers={}) {
        let res = await c.get("/v1/transactions/params", {}, headers);
        return res.body;
    };

    /**
     * block gets the block info for the given round This call blocks
     * @param roundNumber
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.block = async function (roundNumber, headers={}) {
        if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
        let res = await c.get("/v1/block/" + roundNumber, {}, headers);
        if (res.statusCode === 200 && res.body.txns.transactions !== undefined) {
            for (let i = 0; i < res.body.txns.transactions.length; i++) {
                res.body.txns.transactions[i] = noteb64ToNote(res.body.txns.transactions[i]);
            }
        }
        return res.body;
    };

}


module.exports = { Algod };
