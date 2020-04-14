const client = require('../../client');

class IndexerClient {
    constructor(token, baseServer = "http://127.0.0.1", port = 8080) {
        // Get client
        let c = new client.HTTPClient({'X-KMD-API-Token': token}, baseServer, port);

        this.newLookupAssetBalancesService = function(index) {
            return LookupAssetBalancesService(c, index);
        };

        this.newLookupAssetTransactionsService = function (index) {
            return LookupAssetTransactionsService(c, index);
        };

        this.newLookupAccountTransactionsService = function(account) {
            return LookupAccountTransactionsService(c, account);
        };

        this.newLookupBlockService = function(round) {
            return LookupBlockService(c, round);
        };

        this.newLookupAccountByIDService = function(account){
            return LookupAccountByIDService(c, account);
        };

        this.newLookupAssetByIDService = function(index) {
            return LookupAssetByIDService(c, index);
        };

        this.newSearchAccountsService = function() {
            return SearchAccountsService(c);
        };

        this.newSearchForTransactionsService = function() {
            return SearchForTransactionsService(c);
        };

        this.newSearchForAssetsService = function() {
            return SearchForAssetsService(c);
        };
    }
}
module.exports = {IndexerClient};
