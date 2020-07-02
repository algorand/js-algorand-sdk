const client = require('../../client');
const mhc = require('../indexer/makeHealthCheck');
const lacbid = require('../indexer/lookupAccountByID');
const lact = require('../indexer/lookupAccountTransactions');
const lapp = require('../indexer/lookupApplications')
const lasb = require('../indexer/lookupAssetBalances');
const lasbid = require('../indexer/lookupAssetByID');
const last = require('../indexer/lookupAssetTransactions');
const lb = require('../indexer/lookupBlock');
const sfas = require('../indexer/searchForAssets');
const sfapp = require('../indexer/searchForApplications')
const sft = require('../indexer/searchForTransactions');
const sac = require('../indexer/searchAccounts');


class IndexerClient {
    constructor(token, baseServer = "http://127.0.0.1", port = 8080, headers={}) {
        // workaround to allow backwards compatibility for multiple headers
        let tokenHeader = token;
        if (typeof (tokenHeader) == 'string') {
            tokenHeader = {"X-Indexer-API-Token": tokenHeader};
        }

        let c = new client.HTTPClient(tokenHeader, baseServer, port, headers);

        this.makeHealthCheck = function() {
            return new mhc.MakeHealthCheck(c);
        };

        this.lookupAssetBalances = function(index) {
            return new lasb.LookupAssetBalances(c, index);
        };

        this.lookupAssetTransactions = function (index) {
            return new last.LookupAssetTransactions(c, index);
        };

        this.lookupAccountTransactions = function(account) {
            return new lact.LookupAccountTransactions(c, account);
        };

        this.lookupBlock = function(round) {
            return new lb.LookupBlock(c, round);
        };

        this.lookupAccountByID = function(account){
            return new lacbid.LookupAccountByID(c, account);
        };

        this.lookupAssetByID = function(index) {
            return new lasbid.LookupAssetByID(c, index);
        };

        this.lookupApplications = function(index) {
            return new lapp.LookupApplications(c, index);
        }

        this.searchAccounts = function() {
            return new sac.SearchAccounts(c);
        };

        this.searchForTransactions = function() {
            return new sft.SearchForTransactions(c);
        };

        this.searchForAssets = function() {
            return new sfas.SearchForAssets(c);
        };

        this.searchForApplications = function() {
            return new sfapp.SearchForApplications(c);
        }
    }
}
module.exports = {IndexerClient};
