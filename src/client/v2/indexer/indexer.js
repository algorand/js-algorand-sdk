const client = require('../../client');

class IndexerClient {
    constructor(token, baseServer = "http://127.0.0.1", port = 8080) {
        // Get client
        let c =  client.HTTPClient({'X-Indexer-API-Token': token}, baseServer, port);

        this.lookupAssetBalances = function(index) {
            return LookupAssetBalances(c, index);
        };

        this.lookupAssetTransactions = function (index) {
            return LookupAssetTransactions(c, index);
        };

        this.lookupAccountTransactions = function(account) {
            return LookupAccountTransactions(c, account);
        };

        this.lookupBlock = function(round) {
            return LookupBlock(c, round);
        };

        this.lookupAccountByID = function(account){
            return LookupAccountByID(c, account);
        };

        this.lookupAssetByID = function(index) {
            return LookupAssetByID(c, index);
        };

        this.searchAccounts = function() {
            return SearchAccounts(c);
        };

        this.searchForTransactions = function() {
            return SearchForTransactions(c);
        };

        this.searchForAssets = function() {
            return SearchForAssets(c);
        };
    }
}
module.exports = {IndexerClient};
