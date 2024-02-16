/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import {
  getLocalIndexerClient,
  getLocalAccounts,
  getLocalAlgodClient,
} from './utils';
import algosdk from '../src';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getIndexerClient(): void {
  // example: INDEXER_CREATE_CLIENT
  const indexerToken = 'a'.repeat(64);
  const indexerServer = 'http://localhost';
  const indexerPort = 8980;

  const indexerClient = new algosdk.Indexer(
    indexerToken,
    indexerServer,
    indexerPort
  );
  // example: INDEXER_CREATE_CLIENT

  console.log(indexerClient);
}

async function main() {
  const indexerClient = getLocalIndexerClient();

  // example: INDEXER_SEARCH_MIN_AMOUNT
  const transactionInfo = await indexerClient
    .searchForTransactions()
    .currencyGreaterThan(100)
    .do();
  console.log(transactionInfo.transactions.map((t) => t.id));
  // example: INDEXER_SEARCH_MIN_AMOUNT

  // example: INDEXER_PAGINATE_RESULTS
  let nextToken = '';

  // nextToken will be undefined if we reached the last page
  while (nextToken !== undefined) {
    // eslint-disable-next-line no-await-in-loop
    const response = await indexerClient
      .searchForTransactions()
      .limit(5)
      .currencyGreaterThan(10)
      .nextToken(nextToken)
      .do();

    nextToken = response['next-token'];
    const txns = response.transactions;
    if (txns.length > 0)
      console.log(`Transaction IDs: ${response.transactions.map((t) => t.id)}`);
  }
  // example: INDEXER_PAGINATE_RESULTS

  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const suggestedParams = await client.getTransactionParams().do();

  const sender = accounts[0];

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: sender.addr,
    receiver: sender.addr,
    amount: 1e6,
    note: new TextEncoder().encode('Hello World!'),
    suggestedParams,
  });

  await client.sendRawTransaction(txn.signTxn(sender.privateKey)).do();
  await algosdk.waitForConfirmation(client, txn.txID(), 3);

  await new Promise((f) => setTimeout(f, 1000)); // sleep to ensure indexer is caught up

  // example: INDEXER_PREFIX_SEARCH
  const txnsWithNotePrefix = await indexerClient
    .searchForTransactions()
    .notePrefix(new TextEncoder().encode('Hello'))
    .do();
  console.log(
    `Transactions with note prefix "Hello" ${algosdk.stringifyJSON(
      txnsWithNotePrefix,
      undefined,
      2
    )}`
  );
  // example: INDEXER_PREFIX_SEARCH
}

main();
