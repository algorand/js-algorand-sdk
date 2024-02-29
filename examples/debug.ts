import fs from 'fs';
import path from 'path';
import algosdk from '../src';
import {
  deployCalculatorApp,
  getLocalAccounts,
  getLocalAlgodClient,
} from './utils';

async function main() {
  const algodClient = getLocalAlgodClient();
  const accts = await getLocalAccounts();

  const sender = accts[0];

  const appId = await deployCalculatorApp(algodClient, sender);

  const contract = new algosdk.ABIContract(
    JSON.parse(
      fs.readFileSync(path.join(__dirname, '/calculator/contract.json'), 'utf8')
    )
  );

  // example: DEBUG_DRYRUN_DUMP
  const suggestedParams = await algodClient.getTransactionParams().do();

  const atc = new algosdk.AtomicTransactionComposer();
  atc.addMethodCall({
    appID: appId,
    method: contract.getMethodByName('sub'),
    methodArgs: [1, 2],
    sender: sender.addr,
    signer: sender.signer,
    suggestedParams,
  });

  const signedTxns = (await atc.gatherSignatures()).map((stxn) =>
    algosdk.decodeSignedTransaction(stxn)
  );

  const dryrunRequest = await algosdk.createDryrun({
    client: algodClient,
    txns: signedTxns,
  });

  console.log('Dryrun:', dryrunRequest.get_obj_for_encoding());
  // example: DEBUG_DRYRUN_DUMP

  // example: DEBUG_DRYRUN_SUBMIT
  const dryrunResponse = await algodClient.dryrun(dryrunRequest).do();
  dryrunResponse.txns.forEach((txn) => {
    console.log('Txn:', txn);
  });
  // example: DEBUG_DRYRUN_SUBMIT
}

main();
