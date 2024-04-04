import algosdk from '../src';
import { getLocalAlgodClient } from './utils';

async function main() {
  const algodClient = getLocalAlgodClient();

  // example: TRANSACTION_KEYREG_ONLINE_CREATE
  // get suggested parameters
  const params = await algodClient.getTransactionParams().do();

  // Parent addr
  const addr = 'MWAPNXBDFFD2V5KWXAHWKBO7FO4JN36VR4CIBDKDDE7WAUAGZIXM3QPJW4';
  // VRF public key
  const selectionKey = algosdk.base64ToBytes(
    'LrpLhvzr+QpN/bivh6IPpOaKGbGzTTB5lJtVfixmmgk='
  );
  // Voting pub key
  const voteKey = algosdk.base64ToBytes(
    'G/lqTV6MKspW6J8wH2d8ZliZ5XZVZsruqSBJMwLwlmo='
  );
  // State proof key
  const stateProofKey = algosdk.base64ToBytes(
    'RpUpNWfZMjZ1zOOjv3MF2tjO714jsBt0GKnNsw0ihJ4HSZwci+d9zvUi3i67LwFUJgjQ5Dz4zZgHgGduElnmSA=='
  );

  // sets up keys for 100,000 rounds
  const numRounds = 100_000;

  // dilution default is sqrt num rounds
  const keyDilution = Math.floor(Math.sqrt(numRounds));

  // create transaction
  const onlineKeyreg =
    algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
      sender: addr,
      voteKey,
      selectionKey,
      stateProofKey,
      voteFirst: params.firstValid,
      voteLast: params.firstValid + BigInt(numRounds),
      voteKeyDilution: keyDilution,
      suggestedParams: params,
    });

  console.log(onlineKeyreg.msgpackPrepare());
  // example: TRANSACTION_KEYREG_ONLINE_CREATE

  // example: TRANSACTION_KEYREG_OFFLINE_CREATE
  // get suggested parameters
  const suggestedParams = await algodClient.getTransactionParams().do();
  // create keyreg transaction to take this account offline
  const offlineKeyReg =
    algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
      sender: addr,
      suggestedParams,
      nonParticipation: true,
    });
  console.log(offlineKeyReg.msgpackPrepare());
  // example: TRANSACTION_KEYREG_OFFLINE_CREATE
}

main();
