import assert from 'node:assert';
import { getLocalAlgodClient, getLocalAccounts, SandboxAccount } from './utils';
import algosdk, {
  AtomicTransactionComposer,
  getApplicationAddress,
  makeApplicationCallTxnFromObject,
  makePaymentTxnWithSuggestedParamsFromObject,
  OnApplicationComplete,
} from '../src';
import { concatArrays } from '../src/utils/utils';

async function setBoxes(
  algodClient: algosdk.Algodv2,
  appIndex: bigint,
  sender: SandboxAccount,
  name: string,
  favoriteColor: string
) {
  const suggestedParams = await algodClient.getTransactionParams().do();

  const nameBox = concatArrays(sender.addr.publicKey, Buffer.from('name'));
  const colorBox = concatArrays(
    sender.addr.publicKey,
    Buffer.from('favoriteColor')
  );

  const appCall = makeApplicationCallTxnFromObject({
    appIndex,
    suggestedParams,
    sender: sender.addr,
    onComplete: OnApplicationComplete.NoOpOC,
    appArgs: [
      new Uint8Array(Buffer.from(name)),
      new Uint8Array(Buffer.from(favoriteColor)),
    ],
    boxes: [
      { appIndex, name: nameBox },
      { appIndex, name: colorBox },
    ],
  });

  const atc = new AtomicTransactionComposer();
  atc.addTransaction({ txn: appCall, signer: sender.signer });

  await atc.submit(algodClient);

  console.info(
    `Set ${sender.addr} to ${JSON.stringify({ name, favoriteColor })}`
  );
}

async function main() {
  const algodClient = getLocalAlgodClient();

  const versions = await algodClient.versionsCheck().do();
  assert(versions.build.major >= 4);
  assert(versions.build.minor >= 7);

  const accounts = await getLocalAccounts();
  const [alice, bob] = accounts;
  const suggestedParams = await algodClient.getTransactionParams().do();

  const approvalProgram = `#pragma version 12

txn ApplicationID
bz return

txn Sender
byte "name"
concat
txna ApplicationArgs 0
box_put

txn Sender
byte "favoriteColor"
concat
txna ApplicationArgs 1
box_put


return:
  int 1
  return
`;
  const approvalCompileResp = await algodClient.compile(approvalProgram).do();

  const compiledApprovalProgram: Uint8Array = algosdk.base64ToBytes(
    approvalCompileResp.result
  );

  const appCreate = makeApplicationCallTxnFromObject({
    appIndex: 0,
    suggestedParams,
    sender: alice.addr,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledApprovalProgram,
    onComplete: OnApplicationComplete.NoOpOC,
  });

  const atc = new AtomicTransactionComposer();
  atc.addTransaction({ txn: appCreate, signer: alice.signer });

  await atc.submit(algodClient);

  const confirmation = await algodClient
    .pendingTransactionInformation(appCreate.txID())
    .do();

  const appIndex = confirmation.applicationIndex;
  assert(appIndex, 'app index should be defined');
  console.info(`Created app ${appIndex}`);

  const appAddr = getApplicationAddress(appIndex);

  const appFund = makePaymentTxnWithSuggestedParamsFromObject({
    sender: alice.addr,
    receiver: appAddr,
    amount: 1_000_000,
    suggestedParams,
  });

  const fundAtc = new AtomicTransactionComposer();
  fundAtc.addTransaction({ txn: appFund, signer: alice.signer });
  await fundAtc.submit(algodClient);

  await setBoxes(algodClient, appIndex, alice, 'Alice', 'red');
  await setBoxes(algodClient, appIndex, bob, 'Bob', 'blue');

  const boxKeys = await algodClient.getApplicationBoxes(appIndex).do();
  console.log('Box Keys:', boxKeys);
  assert(boxKeys.boxes[0].value === undefined);

  const boxValues = await algodClient
    .getApplicationBoxes(appIndex)
    .include('values')
    .do();

  console.log('Box Values:', boxValues);
  assert(boxValues.boxes.length === 4);
  assert(boxValues.boxes[0].value !== undefined);

  const aliceValues = await algodClient
    .getApplicationBoxes(appIndex)
    .include('values')
    .prefix(alice.addr.publicKey)
    .do();

  console.log("Alice's values:", aliceValues);
  assert(aliceValues.boxes.length === 2);

  const bobValues = await algodClient
    .getApplicationBoxes(appIndex)
    .include('values')
    .prefix(bob.addr.publicKey)
    .do();

  console.log("Bob's values:", bobValues);
  assert(bobValues.boxes.length === 2);

  let next: undefined | string;
  const pages = [];
  const { lastRound } = await algodClient.status().do();
  do {
    // eslint-disable-next-line no-await-in-loop
    const page = await algodClient
      .getApplicationBoxes(appIndex)
      .include('values')
      .round(lastRound)
      .limit(1)
      .next(next)
      .do();
    next = page.nextToken;
    pages.push(page);
  } while (next !== undefined);

  console.log('Pages:', pages);
  assert(pages.length === 4);
}

main();
