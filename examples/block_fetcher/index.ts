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

(async () => {
  // Retrieve current status
  let status = await client.status().do();

  while (true) {
    // Get latest round number
    let { lastRound } = status;
    console.log(`Round: ${lastRound}`);

    // Fetch block
    const round = await client.block(lastRound).do();
    const { block } = round;
    const txns = block.payset;

    // For all transactions in the block reconstruct them
    // into Transaction objects and calculate their TxID
    for (const stxnInBlock of txns) {
      const { txn } = stxnInBlock.signedTxn.signedTxn;

      // Skip StateProofs
      if (txn.type === algosdk.TransactionType.stpf) continue;

      // Use Genesis Hash and Genesis ID from the block
      let gh: Uint8Array | undefined = block.header.genesisHash;
      let gen: string | undefined = block.header.genesisID;

      // Unset gh if hasGenesisID isn't set
      if (!stxnInBlock.hasGenesisID) gh = undefined;
      // Unset gen if hasGenesisID isn't set
      if (!stxnInBlock.hasGenesisID) gen = undefined;

      // Construct Transaction
      const encodingData = txn.toEncodingData();
      encodingData.set('gh', gh);
      encodingData.set('gen', gen);
      const transaction = algosdk.Transaction.fromEncodingData(encodingData);
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
    status = await client.statusAfterBlock(lastRound).do();
    lastRound = status.lastRound;
  }
})();
