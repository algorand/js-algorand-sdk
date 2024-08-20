import { Transaction } from './transaction.js';
import * as nacl from './nacl/naclWrappers.js';
import { msgpackRawEncode } from './encoding/encoding.js';
import * as utils from './utils/utils.js';

const ALGORAND_MAX_TX_GROUP_SIZE = 16;
const TX_GROUP_TAG = new TextEncoder().encode('TG');

function txGroupPreimage(txnHashes: Uint8Array[]): Uint8Array {
  if (txnHashes.length > ALGORAND_MAX_TX_GROUP_SIZE) {
    throw new Error(
      `${txnHashes.length} transactions grouped together but max group size is ${ALGORAND_MAX_TX_GROUP_SIZE}`
    );
  }
  if (txnHashes.length === 0) {
    throw new Error('Cannot compute group ID of zero transactions');
  }
  const bytes = msgpackRawEncode({
    txlist: txnHashes,
  });
  return utils.concatArrays(TX_GROUP_TAG, bytes);
}

/**
 * computeGroupID returns group ID for a group of transactions
 * @param txns - array of transactions
 * @returns Uint8Array
 */
export function computeGroupID(txns: ReadonlyArray<Transaction>) {
  const hashes: Uint8Array[] = [];
  for (const txn of txns) {
    hashes.push(txn.rawTxID());
  }

  const toBeHashed = txGroupPreimage(hashes);
  const gid = nacl.genericHash(toBeHashed);
  return Uint8Array.from(gid);
}

/**
 * assignGroupID assigns group id to a given list of unsigned transactions
 * @param txns - array of transactions. The array elements will be modified with the group id
 */
export function assignGroupID(txns: Transaction[]) {
  const gid = computeGroupID(txns);
  for (const txn of txns) {
    txn.group = gid;
  }
  return txns;
}
