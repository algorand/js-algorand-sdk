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

        /**
         * Returns the health object for the service.
         */
        this.makeHealthCheck = function() {
            return new mhc.MakeHealthCheck(c);
        };

        /**
         * Returns holder balances for the given asset.
         * @param {number} index The asset ID to look up.
         */
        this.lookupAssetBalances = function(index) {
            return new lasb.LookupAssetBalances(c, index);
        };

        /**
         * Returns transactions relating to the given asset.
         * @param {number} index The asset ID to look up.
         */
        this.lookupAssetTransactions = function (index) {
            return new last.LookupAssetTransactions(c, index);
        };

        /**
         * Returns transactions relating to the given account.
         * @param {string} account The address of the account.
         */
        this.lookupAccountTransactions = function(account) {
            return new lact.LookupAccountTransactions(c, account);
        };

        /**
         * Returns the block for the passed round.
         * @param {number} round The number of the round to look up.
         */
        this.lookupBlock = function(round) {
            return new lb.LookupBlock(c, round);
        };

        /**
         * Returns information about the given account.
         * @param {string} account The address of the account to look up.
         */
        this.lookupAccountByID = function(account){
            return new lacbid.LookupAccountByID(c, account);
        };

        /**
         * Returns information about the passed asset.
         * @param {number} index The ID of the asset ot look up.
         */
        this.lookupAssetByID = function(index) {
            return new lasbid.LookupAssetByID(c, index);
        };

        /**
         * Returns information about the passed application.
         * @param {number} index The ID of the application to look up. 
         */
        this.lookupApplications = function(index) {
            return new lapp.LookupApplications(c, index);
        }

        /**
         * Returns information about indexed accounts.
         */
        this.searchAccounts = function() {
            return new sac.SearchAccounts(c);
        };

        /**
         * Returns information about indexed transactions.
         */
        this.searchForTransactions = function() {
            return new sft.SearchForTransactions(c);
        };

        /**
         * Returns information about indexed assets.
         */
        this.searchForAssets = function() {
            return new sfas.SearchForAssets(c);
        };

        /**
         * Returns information about indexed applications.
         */
        this.searchForApplications = function() {
            return new sfapp.SearchForApplications(c);
        }
    }
}
module.exports = {IndexerClient};
