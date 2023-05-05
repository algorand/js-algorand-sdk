/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
import algosdk from '../../src';

// Validate all TxID
const validate = false;

// Algod Node
const token = 'a'.repeat(64);
const address = 'http://127.0.0.1';
const port = 8080;
const client = new algosdk.Algodv2(token, address, port);

// Recursively remove all null values from object
function removeNulls(obj) {
  for (const key in obj) {
    if (obj[key] === null) {
      // eslint-disable-next-line no-param-reassign
      delete obj[key];
    } else if (typeof obj[key] === 'object') {
      removeNulls(obj[key]);
    }
  }
}

(async () => {
  // Retrieve current status
  let status = await client.status().do();

  while (true) {
    // Get latest round number
    let { lastRound } = status;
    console.log(`Round: ${lastRound}`);

    // Fetch block
    const round = await client.block(lastRound as number).do();
    const { block } = round;
    const { txns } = block;

    // For all transactions in the block reconstruct them
    // into Transaction objects and calculate their TxID
    for (const t in txns) {
      const tx = txns[t];
      const { txn } = txns[t];

      // Skip StateProofs
      if (txn.type === 'stpf') continue;

      // Remove nulls (mainly where an appl txn contains a null app arg)
      removeNulls(txn);

      // Use Genesis Hash and Genesis ID from the block
      const { gh } = block;
      let { gen } = block;

      // Unset gen if `hgi` isn't set
      if (!tx.hgi) gen = null;

      // Construct Transaction
      const transaction = algosdk.Transaction.from_obj_for_encoding({
        ...txn,
        gh,
        gen,
      });
      const txid = transaction.txID();

      // If set to true, validate the TxID exists against the node
      // !! Don't run on a public endpoint, you'll probably get rate limited !!
      if (validate) {
        try {
          await client.pendingTransactionInformation(txid).do();
          console.log(`${txid}\t Exists`);
        } catch (e) {
          console.log(`${txid}\t Doesn't Exist`);
        }
      } else {
        console.log(txid);
      }
    }

    // Wait for next round
    status = await client.statusAfterBlock(lastRound as number).do();
    lastRound = status['last-round'];
  }
})();
