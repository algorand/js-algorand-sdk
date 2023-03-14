/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import { getLocalIndexerClient } from './utils';

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
}

main();
