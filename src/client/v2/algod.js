const client = require('../client');

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
     * Sets the default header (if not previously set) for sending a raw
     * transaction.
     * @param headers
     * @returns {*}
     */
    function setSendTransactionHeaders(headers) {
        let hdrs = headers;
        if (Object.keys(hdrs).every(key=> key.toLowerCase() !== 'content-type')) {
            hdrs = {...headers};
            hdrs['Content-Type'] = 'application/x-binary';
        }
        return hdrs;
    }

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
     * versions retrieves the VersionResponse from the running node
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.versions = async function (headers={}) {
        let res = await c.get("/versions", {}, headers);
        return res.body;
    };

    /**
     * sendRawTransaction gets an encoded SignedTxn and broadcasts it to the network
     * @param txn Uint8Array
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.sendRawTransaction = async function (txn, headers={}) {
        let txHeaders = setSendTransactionHeaders(headers);
        let res = await c.post("/v2/transactions", Buffer.from(txn), txHeaders);
        return res.body;
    };

    /**
     * sendRawTransactions gets a list of encoded SignedTxns and broadcasts it to the network
     * @param txns Array of Uint8Array
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.sendRawTransactions = async function (txns, headers={}) {
        let txHeaders = setSendTransactionHeaders(headers);
        const merged = Array.prototype.concat(...txns.map(arr => Array.from(arr)));
        let res = await c.post("/v2/transactions", Buffer.from(merged), txHeaders);
        return res.body;
    };

    /**
     * accountInformation returns the passed account's information
     * @param addr string
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.accountInformation = async function (addr, headers={}) {
        let res = await c.get("/v2/accounts/" + addr, {}, headers);
        return res.body;
    };

    /**
     * block gets the block info for the given round. this call may block
     * @param roundNumber
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.block = async function (roundNumber, headers={}) {
        if (!Number.isInteger(roundNumber)) throw Error("roundNumber should be an integer");
        let res = await c.get("/v2/blocks/" + roundNumber, {}, headers);
        return res.body;
    };

    /**
     * pendingTransactionInformation returns the transaction information for a specific txid of a pending transaction
     * @param txid
     * @param query, optional
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.pendingTransactionInformation = async function (txid, query={}, headers={}) {
        let res = await c.get("/v2/transactions/pending/" + txid, query, headers);
        return res.body;
    };


    /**
     * pendingTransactionByAddress returns all transactions for a PK [addr] in the [first, last] rounds range.
     * @param addr string
     * @param query, optional
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.pendingTransactionByAddress = async function (addr, query={}, headers={}) {
        let res = await c.get("/v2/accounts/" + addr + "/transactions/pending", query, headers);
        return res.body;
    };

    /**
     * registerParticipationKeys creates an issues a partkey registration for the passed addr
     * @param addr string
     * @param registerParams, optional
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.registerParticipationKeys = async function (addr, registerParams={}, headers={}) {
        let res = await c.post("/v2/register-participation-keys/"+addr, Buffer.from(registerParams), headers);
        return res.body;
    };

    /**
     * shutdown shuts down the node
     * @param shutdownParams, optional
     * @param headers, optional
     */
    this.shutdown = async function (shutdownParams={}, headers={}) {
        let res = await c.post("/v2/register-participation-keys/"+addr, Buffer.from(registerParams), headers);
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
        let res = await c.get("/v2/status/wait-for-block-after/" + roundNumber, {}, headers);
        return res.body;
    };

    /**
     * getTransactionParams returns to common needed parameters for a new transaction
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.getTransactionParams = async function (headers={}) {
        let res = await c.get("/v2/transactions/params", {}, headers);
        return res.body;
    };

    /**
     * suggestParams returns to common needed parameters for a new transaction, in a format the transaction builder expects
     * @param headers, optional
     * @returns {Object}
     */
    this.suggestParams = async function (headers={}) {
        let result = await this.getTransactionParams(headers);
        return {
            "flatFee": false,
            "fee": result.fee,
            "firstRound": result.lastRound,
            "lastRound": result.lastRound + 1000,
            "genesisID": result.genesisID,
            "genesisHash": result.genesishashb64,
        };
    };

    /**
     * supply gets the supply details for the specified node's ledger
     * @param headers, optional
     * @returns {Promise<*>}
     */
    this.supply = async function (headers={}) {
        let res = await c.get("/v2/ledger/supply", {}, headers);
        return res.body;
    };
}


module.exports = { Algod };
