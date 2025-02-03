import ServiceClient from '../serviceClient.js';
import MakeHealthCheck from './makeHealthCheck.js';
import LookupAssetBalances from './lookupAssetBalances.js';
import LookupAssetTransactions from './lookupAssetTransactions.js';
import LookupAccountTransactions from './lookupAccountTransactions.js';
import LookupBlock from './lookupBlock.js';
import LookupTransactionByID from './lookupTransactionByID.js';
import LookupAccountByID from './lookupAccountByID.js';
import LookupAccountAssets from './lookupAccountAssets.js';
import LookupAccountCreatedAssets from './lookupAccountCreatedAssets.js';
import LookupAccountAppLocalStates from './lookupAccountAppLocalStates.js';
import LookupAccountCreatedApplications from './lookupAccountCreatedApplications.js';
import LookupAssetByID from './lookupAssetByID.js';
import LookupApplications from './lookupApplications.js';
import LookupApplicationLogs from './lookupApplicationLogs.js';
import LookupApplicationBoxByIDandName from './lookupApplicationBoxByIDandName.js';
import SearchAccounts from './searchAccounts.js';
import SearchForBlockHeaders from './searchForBlockHeaders.js';
import SearchForTransactions from './searchForTransactions.js';
import SearchForAssets from './searchForAssets.js';
import SearchForApplications from './searchForApplications.js';
import SearchForApplicationBoxes from './searchForApplicationBoxes.js';
import { BaseHTTPClient } from '../../baseHTTPClient.js';
import {
  CustomTokenHeader,
  IndexerTokenHeader,
} from '../../urlTokenBaseHTTPClient.js';
import { Address } from '../../../encoding/address.js';

/**
 * The Indexer provides a REST API interface of API calls to support searching the Algorand Blockchain.
 *
 * The Indexer REST APIs retrieve the blockchain data from a PostgreSQL compatible database that must be populated.
 *
 * This database is populated using the same indexer instance or a separate instance of the indexer which must connect to the algod process of a running Algorand node to read block data.
 *
 * This node must also be an Archival node to make searching the entire blockchain possible.
 *
 * #### Relevant Information
 * [Learn more about Indexer](https://developer.algorand.org/docs/get-details/indexer/)
 *
 * [Run Indexer in Postman OAS3](https://developer.algorand.org/docs/rest-apis/restendpoints/#algod-indexer-and-kmd-rest-endpoints)
 */
export class IndexerClient extends ServiceClient {
  /**
   * Create an IndexerClient from
   * * either a token, baseServer, port, and optional headers
   * * or a base client server for interoperability with external dApp wallets
   *
   * #### Example
   * ```typescript
   * const token  = "";
   * const server = "http://localhost";
   * const port   = 8980;
   * const indexerClient = new algosdk.Indexer(token, server, port);
   * ```
   * @remarks
   * The above configuration is for a sandbox private network.
   * For applications on production, you are encouraged to run your own node with indexer, or use an Algorand REST API provider with a dedicated API key.
   *
   * @param tokenOrBaseClient - The API token for the Indexer API
   * @param baseServer - REST endpoint
   * @param port - Port number if specifically configured by the server
   * @param headers - Optional headers
   */
  constructor(
    tokenOrBaseClient:
      | string
      | IndexerTokenHeader
      | CustomTokenHeader
      | BaseHTTPClient,
    baseServer = 'http://127.0.0.1',
    port: string | number = 8080,
    headers: Record<string, string> = {}
  ) {
    super('X-Indexer-API-Token', tokenOrBaseClient, baseServer, port, headers);
  }

  /**
   * Returns the health object for the service.
   * Returns 200 if healthy.
   *
   * #### Example
   * ```typescript
   * const health = await indexerClient.makeHealthCheck().do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-health)
   * @category GET
   */
  makeHealthCheck() {
    return new MakeHealthCheck(this.c);
  }

  /**
   * Returns the list of accounts who hold the given asset and their balance.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetBalances = await indexerClient.lookupAssetBalances(assetId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2assetsasset-idbalances)
   * @param index - The asset ID to look up.
   * @category GET
   */
  lookupAssetBalances(index: number | bigint) {
    return new LookupAssetBalances(this.c, index);
  }

  /**
   * Returns transactions relating to the given asset.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetTxns = await indexerClient.lookupAssetTransactions(assetId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2assetsasset-idtransactions)
   * @param index - The asset ID to look up.
   * @category GET
   */
  lookupAssetTransactions(index: number | bigint) {
    return new LookupAssetTransactions(this.c, index);
  }

  /**
   * Returns transactions relating to the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountTxns = await indexerClient.lookupAccountTransactions(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-idtransactions)
   * @param account - The address of the account.
   * @category GET
   */
  lookupAccountTransactions(account: string | Address) {
    return new LookupAccountTransactions(this.c, account);
  }

  /**
   * Returns the block for the passed round.
   *
   * #### Example
   * ```typescript
   * const targetBlock = 18309917;
   * const blockInfo = await indexerClient.lookupBlock(targetBlock).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2blocksround-number)
   * @param round - The number of the round to look up.
   * @category GET
   */
  lookupBlock(round: number | bigint) {
    return new LookupBlock(this.c, round);
  }

  /**
   * Returns information about the given transaction.
   *
   * #### Example
   * ```typescript
   * const txnId = "MEUOC4RQJB23CQZRFRKYEI6WBO73VTTPST5A7B3S5OKBUY6LFUDA";
   * const txnInfo = await indexerClient.lookupTransactionByID(txnId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2transactionstxid)
   * @param txID - The ID of the transaction to look up.
   * @category GET
   */
  lookupTransactionByID(txID: string) {
    return new LookupTransactionByID(this.c, txID);
  }

  /**
   * Returns information about the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountInfo = await indexerClient.lookupAccountByID(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-id)
   * @param account - The address of the account to look up.
   * @category GET
   */
  lookupAccountByID(account: string | Address) {
    return new LookupAccountByID(this.c, account);
  }

  /**
   * Returns asset about the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountAssets = await indexerClient.lookupAccountAssets(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-idassets)
   * @param account - The address of the account to look up.
   * @category GET
   */
  lookupAccountAssets(account: string | Address) {
    return new LookupAccountAssets(this.c, account);
  }

  /**
   * Returns asset information created by the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountCreatedAssets = await indexerClient.lookupAccountCreatedAssets(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-idcreated-assets)
   * @param account - The address of the account to look up.
   * @category GET
   */
  lookupAccountCreatedAssets(account: string | Address) {
    return new LookupAccountCreatedAssets(this.c, account);
  }

  /**
   * Returns application local state about the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountAppLocalStates = await indexerClient.lookupAccountAppLocalStates(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-idapps-local-state)
   * @param account - The address of the account to look up.
   * @category GET
   */
  lookupAccountAppLocalStates(account: string | Address) {
    return new LookupAccountAppLocalStates(this.c, account);
  }

  /**
   * Returns application information created by the given account.
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountCreatedApps = await indexerClient.lookupAccountCreatedApplications(address).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accountsaccount-idcreated-applications)
   * @param account - The address of the account to look up.
   * @category GET
   */
  lookupAccountCreatedApplications(account: string | Address) {
    return new LookupAccountCreatedApplications(this.c, account);
  }

  /**
   * Returns information about the passed asset.
   *
   * #### Example
   * ```typescript
   * const assetId = 163650;
   * const assetInfo = await indexerClient.lookupAssetByID(assetId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2assetsasset-id)
   * @param index - The ID of the asset ot look up.
   * @category GET
   */
  lookupAssetByID(index: number | bigint) {
    return new LookupAssetByID(this.c, index);
  }

  /**
   * Returns information about the passed application.
   *
   * #### Example
   * ```typescript
   * const appId = 60553466;
   * const appInfo = await indexerClient.lookupApplications(appId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-id)
   * @param index - The ID of the application to look up.
   * @category GET
   */
  lookupApplications(index: number | bigint) {
    return new LookupApplications(this.c, index);
  }

  /**
   * Returns log messages generated by the passed in application.
   *
   * #### Example
   * ```typescript
   * const appId = 60553466;
   * const appLogs = await indexerClient.lookupApplicationLogs(appId).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-idlogs)
   * @param appID - The ID of the application which generated the logs.
   * @category GET
   */
  lookupApplicationLogs(appID: number | bigint) {
    return new LookupApplicationLogs(this.c, appID);
  }

  /**
   * Returns information about indexed accounts.
   *
   * #### Example
   * ```typescript
   * const accounts = await indexerClient.searchAccounts().do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2accounts)
   * @category GET
   */
  searchAccounts() {
    return new SearchAccounts(this.c);
  }

  /**
   * Returns information about indexed block headers.
   *
   * #### Example
   * ```typescript
   * const bhs = await indexerClient.searchForBlockHeaders().do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2block-headers)
   * @category GET
   */
  searchForBlockHeaders() {
    return new SearchForBlockHeaders(this.c);
  }

  /**
   * Returns information about indexed transactions.
   *
   * #### Example
   * ```typescript
   * const txns = await indexerClient.searchForTransactions().do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2transactions)
   * @category GET
   */
  searchForTransactions() {
    return new SearchForTransactions(this.c);
  }

  /**
   * Returns information about indexed assets.
   *
   * #### Example
   * ```typescript
   * const assets = await indexerClient.searchForAssets().do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2assets)
   * @category GET
   */
  searchForAssets() {
    return new SearchForAssets(this.c);
  }

  /**
   * Returns information about indexed applications.
   *
   * #### Example
   * ```typescript
   * const apps = await indexerClient.searchForApplications().do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applications)
   * @category GET
   */
  searchForApplications() {
    return new SearchForApplications(this.c);
  }

  /**
   * Returns information about indexed application boxes.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const appID = 1234;
   *
   * const responsePage1 = await indexerClient
   *        .searchForApplicationBoxes(appID)
   *        .limit(maxResults)
   *        .do();
   * const boxNamesPage1 = responsePage1.boxes.map(box => box.name);
   *
   * const responsePage2 = await indexerClient
   *        .searchForApplicationBoxes(appID)
   *        .limit(maxResults)
   *        .nextToken(responsePage1.nextToken)
   *        .do();
   * const boxNamesPage2 = responsePage2.boxes.map(box => box.name);
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-idboxes)
   * @param appID - The ID of the application with boxes.
   * @category GET
   */
  searchForApplicationBoxes(appID: number | bigint) {
    return new SearchForApplicationBoxes(this.c, appID);
  }

  /**
   * Returns information about the application box given its name.
   *
   * #### Example
   * ```typescript
   * const boxName = Buffer.from("foo");
   * const boxResponse = await indexerClient
   *        .LookupApplicationBoxByIDandName(1234, boxName)
   *        .do();
   * const boxValue = boxResponse.value;
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-idbox)
   * @param appID - The ID of the application with boxes.
   * @category GET
   */
  lookupApplicationBoxByIDandName(appID: number | bigint, boxName: Uint8Array) {
    return new LookupApplicationBoxByIDandName(this.c, appID, boxName);
  }
}
