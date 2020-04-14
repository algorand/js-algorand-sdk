const client = require('../../client');

class AlgodClient {
    constructor(token = '', baseServer = "http://r2.algorand.network", port = 4180, headers = {}) {
        // workaround to allow backwards compatibility for multiple headers
        let tokenHeader = token;
        if (typeof (tokenHeader) == 'string') {
            tokenHeader = {"X-Algo-API-Token": tokenHeader};
        }

        // Get client
        let c = new client.HTTPClient(tokenHeader, baseServer, port, headers);

        this.newHealthCheckService = function () {
            return HealthCheckService(c)
        };

        this.newVersionsCheckService = function () {
            return VersionsService(c)
        };

        this.newSendRawTransactionService = function(stx_or_stxs) {
            return SendRawTransactionService(stx_or_stxs)
        };

        this.newAccountInformationService = function(account) {
            return AccountInformationService(c, account)
        };

        this.newBlockService = function(roundNumber) {
            return BlockService(c, roundNumber)
        };

        this.newPendingTransactionInformationService = function(txid) {
            return PendingTransactionInformationService(c, txid)
        };

        this.newPendingTransactionsInformationService = function() {
            return PendingTransactionsService(c)
        };

        this.newPendingTransactionByAddressService = function(address) {
            return PendingTransactionsByAddressService(c, address)
        };

        this.newRegisterParticipationKeyService = function(account) {
            return RegisterParticipationKeysService(c, account)
        };

        this.newShutdownService = function () {
            return ShutdownService(c)
        };

        this.newStatusAfterBlockService = function (round) {
            return StatusAfterBlockService(c, round)
        };

        this.newGetTransactionParamsService = function () {
            return SuggestedParamsService(c)
        };

        this.newSupplyService = function () {
            return SupplyService(c)
        };
    }
}


module.exports = { AlgodClient };
