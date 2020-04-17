const client = require('../../client');

class AlgodClient {
    constructor(token = '', baseServer = "http://r2.algorand.network", port = 4180, headers = {}) {
        // workaround to allow backwards compatibility for multiple headers
        let tokenHeader = token;
        if (typeof (tokenHeader) == 'string') {
            tokenHeader = {"X-Algo-API-Token": tokenHeader};
        }

        // Get client
        let c =  client.HTTPClient(tokenHeader, baseServer, port, headers);

        this.healthCheck = function () {
            return HealthCheck(c)
        };

        this.versionsCheck = function () {
            return Versions(c)
        };

        this.sendRawTransaction = function(stx_or_stxs) {
            return SendRawTransaction(stx_or_stxs)
        };

        this.accountInformation = function(account) {
            return AccountInformation(c, account)
        };

        this.block = function(roundNumber) {
            return Block(c, roundNumber)
        };

        this.pendingTransactionInformation = function(txid) {
            return PendingTransactionInformation(c, txid)
        };

        this.pendingTransactionsInformation = function() {
            return PendingTransactions(c)
        };

        this.pendingTransactionByAddress = function(address) {
            return PendingTransactionsByAddress(c, address)
        };

        this.registerParticipationKey = function(account) {
            return RegisterParticipationKeys(c, account)
        };

        this.shutdown = function () {
            return Shutdown(c)
        };

        this.status = function() {
            return Status(c)
        };

        this.statusAfterBlock = function (round) {
            return StatusAfterBlock(c, round)
        };

        this.getTransactionParams = function () {
            return SuggestedParams(c)
        };

        this.supply = function () {
            return Supply(c)
        };
    }
}


module.exports = { AlgodClient };
