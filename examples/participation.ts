import algosdk from '../src';
import { getLocalAlgodClient } from './utils';

async function main() {
  const algodClient = getLocalAlgodClient();

  // example: TRANSACTION_KEYREG_ONLINE_CREATE
  // get suggested parameters
  const params = await algodClient.getTransactionParams().do();

  const voteKey = 'eXq34wzh2UIxCZaI1leALKyAvSz/+XOe0wqdHagM+bw=';
  const selectionKey = 'X84ReKTmp+yfgmMCbbokVqeFFFrKQeFZKEXG89SXwm4=';

  const numRounds = 1e5; // sets up keys for 100000 rounds
  const keyDilution = numRounds ** 0.5; // dilution default is sqrt num rounds

  // create transaction
  const onlineKeyreg = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject(
    {
      from: 'EW64GC6F24M7NDSC5R3ES4YUVE3ZXXNMARJHDCCCLIHZU6TBEOC7XRSBG4',
      voteKey,
      selectionKey,
      voteFirst: params.firstRound,
      voteLast: params.firstRound + numRounds,
      voteKeyDilution: keyDilution,
      stateProofKey: voteKey,
      suggestedParams: params,
    }
  );

  console.log(onlineKeyreg.get_obj_for_encoding());
  // example: TRANSACTION_KEYREG_ONLINE_CREATE

  // example: TRANSACTION_KEYREG_OFFLINE_CREATE
  // get suggested parameters
  const suggestedParams = await algodClient.getTransactionParams().do();
  // create keyreg transaction to take this account offline
  const offlineKeyReg = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject(
    {
      from: 'EW64GC6F24M7NDSC5R3ES4YUVE3ZXXNMARJHDCCCLIHZU6TBEOC7XRSBG4',
      suggestedParams,
      nonParticipation: true,
    }
  );
  console.log(offlineKeyReg.get_obj_for_encoding());
  // example: TRANSACTION_KEYREG_OFFLINE_CREATE
}

main();
