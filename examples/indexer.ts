/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import { Buffer } from 'buffer';
import {
  getLocalIndexerClient,
  getLocalAccounts,
  getLocalAlgodClient,
} from './utils';
import algosdk from '../src';

async function main() {
  // example: INDEXER_SEARCH_MIN_AMOUNT
  const indexerClient = getLocalIndexerClient();
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
    from: sender.addr,
    to: sender.addr,
    amount: 1e6,
    note: new Uint8Array(Buffer.from('Hello World!')),
    suggestedParams,
  });

  await client.sendRawTransaction(txn.signTxn(sender.privateKey)).do();
  await algosdk.waitForConfirmation(client, txn.txID().toString(), 3);

  await new Promise((f) => setTimeout(f, 1000)); // sleep to ensure indexer is caught up

  // example: INDEXER_PREFIX_SEARCH
  const txnsWithNotePrefix = await indexerClient
    .searchForTransactions()
    .notePrefix(Buffer.from('Hello'))
    .do();
  console.log(
    `Transactions with note prefix "Hello" ${ 
      JSON.stringify(txnsWithNotePrefix, undefined, 2)}`
  );
  // example: INDEXER_PREFIX_SEARCH
}

main();
