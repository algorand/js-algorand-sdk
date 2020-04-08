const client = require('../client');

function Indexer(token, baseServer = "http://127.0.0.1", port = 8080) {
    // Get client
    let c = new client.HTTPClient({'X-KMD-API-Token':token}, baseServer, port);

    /**
     * lookupAssetBalances returns holder balances for the given asset
     * @param index of the asset
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.lookupAssetBalances = async function (index, query={}, headers={}) {
        let res = await c.get("/v2/assets/" + index + "/balances", query, headers);
        return res.body;
    };

    /**
     * lookupAssetTransactions return transactions relating to the given asset
     * @param index of the asset
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.lookupAssetTransactions = async function (index, query={}, headers={}) {
        let res = await c.get("/v2/assets/" + index + "/transactions", query, headers);
        return res.body;
    };

    /**
     * lookupAccountTransactions returns transactions relating to the given account
     * @param address of the account string
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.lookupAccountTransactions = async function (address, query={}, headers={}) {
        let res = await c.get("/v2/accounts/" + address + "/transactions", query, headers);
        return res.body;
    };

    /**
     * lookupBlock returns the block for the passed round
     * @param round to lookup
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.lookupBlock = async function (round, query={}, headers={}) {
        let res = await c.get("/v2/blocks/" + round, query, headers);
        return res.body;
    };

    /**
     * lookupAccountByID returns information about the identified account
     * @param address of the account string
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.lookupAccountByID = async function (address, query={}, headers={}) {
        let res = await c.get("/v2/accounts/" + address, query, headers);
        return res.body;
    };

    /**
     * lookupAssetByID returns information about the passed asset
     * @param index of the asset
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.lookupAccountByID = async function (index, query={}, headers={}) {
        let res = await c.get("/v2/assets/" + index, query, headers);
        return res.body;
    };

    /**
     * searchAccounts returns information about indexed accounts
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.searchAccounts = async function (query={}, headers={}) {
        let res = await c.get("/v2/accounts/", query, headers);
        return res.body;
    };

    /**
     * searchForTransactions returns information about indexed transactions
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.searchForTransactions = async function (query={}, headers={}) {
        let res = await c.get("/v2/transactions/", query, headers);
        return res.body;
    };

    /**
     * searchForAssets returns information about indexed assets
     * @param query, optional
     * @param headers, optional
     * @returns Promise<*>
     */
    this.searchForAssets = async function (query={}, headers={}) {
        let res = await c.get("/v2/assets/", query, headers);
        return res.body;
    };
}
module.exports = {Indexer};
