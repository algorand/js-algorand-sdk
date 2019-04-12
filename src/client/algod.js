const client = require('./client');

function Algod(token, baseServer = "http://r2.algorand.network", port = 4180) {
    // Get client
    let c = new client.HTTPClient('X-algo-api-token', token, baseServer, port);

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
        try {
            let res = await c.get("/v1/status");
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * helathCheck returns an empty object iff the node is running
     * @returns {Promise<*>}
     */
    this.healthCheck = async function () {
        try {
            let res = await c.get("/health");
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * statusAfterBlock waits for round roundNumber to occur then returns the StatusResponse for this round.
     * This call blocks
     * @param roundNumber
     * @returns {Promise<*>}
     */
    this.statusAfterBlock = async function (roundNumber) {
        if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
        try {
            let res = await c.get("/v1/status/wait-for-block-after/" + roundNumber);
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * pendingTransactions asks algod for a snapshot of current pending txns on the node, bounded by maxTxns.
     * If maxTxns = 0, fetches as many transactions as possible.
     * @param maxTxns number
     * @returns {Promise<*>}
     */
    this.pendingTransactions = async function (maxTxns) {
        if (!Number.isInteger(maxTxns)) throw Error("maxTxns should be an integer");
        try {
            let res = await c.get("/v1/transactions/pending", {'max': maxTxns});
            if (res.statusCode === 200) {
                for (var i = 0; i < res.body.truncatedTxns.transactions.length; i++) {
                    res.body.truncatedTxns.transactions[i] = noteb64ToNote(res.body.truncatedTxns.transactions[i]);
                }
            }
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * versions retrieves the VersionResponse from the running node
     * @returns {Promise<*>}
     */
    this.versions = async function () {
        try {
            let res = await c.get("/versions");
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * LedgerSupply gets the supply details for the specified node's Ledger
     * @returns {Promise<*>}
     */
    this.ledgerSupply = async function () {
        try {
            let res = await c.get("/v1/ledger/supply");
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * transactionsByAddress returns all transactions for a PK [addr] in the [first, last] rounds range.
     * @param addr string
     * @param first number
     * @param last number
     * @returns {Promise<*>}
     */
    this.transactionByAddress = async function (addr, first, last) {
        if (!Number.isInteger(first) || !Number.isInteger(last)) throw Error("first and last rounds should be integers");
        try {
            let res = await c.get("/v1/account/" + addr + "/transactions", {'firstRound': first, 'lastRound': last});
            if (res.statusCode === 200) {
              for(var i = 0; i < res.body.transactions.length; i++) {
                res.body.transactions[i] = noteb64ToNote(res.body.transactions[i]);
              }
            }
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * accountInformation returns the passed account's information
     * @param addr string
     * @returns {Promise<*>}
     */
    this.accountInformation = async function (addr) {
        try {
            let res = await c.get("/v1/account/" + addr);
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * transactionInformation returns the a transaction information of a specific txid and an address
     * @param addr
     * @param txid
     * @returns {Promise<*>}
     */
    this.transactionInformation = async function (addr, txid) {
        try {
            let res = await c.get("/v1/account/" + addr + "/transaction/" + txid);
            if (res.statusCode === 200) {
               res.body = noteb64ToNote(res.body);
            }
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * suggestedFee gets the recommended transaction fee from the node
     * @returns {Promise<*>}
     */
    this.suggestedFee = async function () {
        try {
            let res = await c.get("/v1/transactions/fee");
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * sendRawTransaction gets an encoded SignedTxn and broadcasts it to the network
     * @param txn Uin8Array
     * @returns {Promise<*>}
     */
    this.sendRawTransaction = async function (txn) {
        try {
            let res = await c.post("/v1/transactions", Buffer.from(txn));
            return res.body;
        } catch (e) {
            e.message = e.error.message;
            throw e;
        }
    };

    /**
     * getTransactionParams returns to common needed parameters for a new transaction
     * @returns {Promise<*>}
     */
    this.getTransactionParams = async function () {
        try {
            let res = await c.get("/v1/transactions/params");
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

    /**
     * block gets the block info for the given round This call blocks
     * @param roundNumber
     * @returns {Promise<*>}
     */
    this.block = async function (roundNumber) {
        if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
        try {
            let res = await c.get("/v1/block/" + roundNumber);
            if (res.statusCode === 200 && res.txns.transactions !== undefined) {
              for(var i = 0; i < res.body.txns.transactions.length; i++) {
                res.body.txns.transactions[i] = noteb64ToNote(res.body.txns.transactions[i]);
              }
            }
            return res.body;
        } catch (e) {
            e.message = e.response.error.message;
            throw e;
        }
    };

}


module.exports = {Algod};
