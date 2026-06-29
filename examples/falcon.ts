/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import assert from 'assert';
import algosdk, {
  LogicSigAccount,
  SignedTransaction,
  type Falcon1024SigningKey,
} from '../src';
import { getLocalAlgodClient, getLocalAccounts } from './utils';
import { genericHash } from '../src/nacl/naclWrappers';

// falcon-1024 ships a browser-oriented WASM build that locates its `.wasm` file
// via `fetch(new URL("falcon_wasm.wasm", import.meta.url))`. Node's fetch cannot
// read `file://` URLs, so when running under Node we shim fetch to serve the
// local `.wasm` from disk. (Mirrors the shim in tests/12.PQAddress.ts.)
async function installNodeWasmFetchShim(): Promise<void> {
  const isNode =
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;
  if (!isNode) return;

  const { readFile } = await import(
    /* webpackIgnore: true */ 'node:fs/promises'
  );
  const { fileURLToPath } = await import(/* webpackIgnore: true */ 'node:url');

  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (async (input: unknown, init?: unknown) => {
    const url = input instanceof URL ? input.href : String(input);
    if (url.startsWith('file://') && url.endsWith('.wasm')) {
      const bytes = await readFile(fileURLToPath(url));
      return new Response(bytes, {
        headers: { 'Content-Type': 'application/wasm' },
      });
    }
    return originalFetch(
      input as Parameters<typeof fetch>[0],
      init as Parameters<typeof fetch>[1]
    );
  }) as typeof fetch;
}

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const dispenser = accounts[0];

  // falcon-1024 is ESM-only and depends on WASM, so load it dynamically after
  // the fetch shim is in place.
  await installNodeWasmFetchShim();
  const { generateKey, signCompressed, verifyCompressed } = await import(
    'falcon-1024'
  );

  // example: FALCON_KEYGEN
  // Generate a Falcon-1024 post-quantum keypair. With no seed argument the
  // library generates a random 48-byte seed for us.
  const { publicKey, privateKey } = generateKey(new Uint8Array(48));

  // Wrap the private key in the "raw signer" abstraction the SDK expects: a
  // function that produces a detached Falcon signature over arbitrary bytes.
  const falconSigningKey: Falcon1024SigningKey = {
    falcon1024PublicKey: publicKey,
    falcon1024Signer: async (bytesToSign: Uint8Array) =>
      signCompressed(privateKey, bytesToSign),
  };

  // Derive the post-quantum address and a TransactionSigner from the keypair.
  const {
    address: falconAddr,
    txnSigner: falconTxnSigner,
    delegatedLsigSigner: falconLsigSigner,
  } = algosdk.addressWithSignersFromRawFalcon1024Signer(falconSigningKey);
  // example: FALCON_KEYGEN

  // From https://github.com/cusma/go-algorand//blob/4ec3185d16784b3e9b62ebb6473ab00bd578d6e5/data/basics/pq_address_test.go#L66-L66
  assert.deepEqual(
    '7ZQ6VZDWW5NECRV3XMW6L7YX743PFC55IEVS4X3GDHIW4NBMYLYTJT4VTA',
    falconAddr.toString()
  );

  // example: FALCON_FUND
  // Fund the new Falcon address so it can cover its min balance + fees.
  const suggestedParams = await client.getTransactionParams().do();
  const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: dispenser.addr,
    receiver: falconAddr,
    amount: 103_000,
    suggestedParams,
  });
  await client.sendRawTransaction(fundTxn.signTxn(dispenser.privateKey)).do();
  await algosdk.waitForConfirmation(client, fundTxn.txID(), 3);

  const funded = await client.accountInformation(falconAddr).do();
  console.log('Funded balance (microAlgos):', funded.amount);
  // example: FALCON_FUND

  // example: FALCON_SEND
  // Send a 0-amount payment FROM the Falcon address, signed with the Falcon
  // signer, using the AtomicTransactionComposer to gather and submit it.
  const zeroPayTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: falconAddr,
    receiver: falconAddr,
    amount: 0,
    suggestedParams: { ...suggestedParams, flatFee: true, fee: 3000 },
  });

  const atc = new algosdk.AtomicTransactionComposer();
  atc.addTransaction({ txn: zeroPayTxn, signer: falconTxnSigner });
  const [stxn] = await atc.gatherSignatures();
  const falconSig = algosdk.decodeMsgpack(stxn, SignedTransaction).pqsig!.sig!;
  const verifyResult = verifyCompressed(
    publicKey,
    falconSig,
    new Uint8Array(genericHash(zeroPayTxn.bytesToSign()))
  );

  console.debug(
    'signed txn',
    algosdk.decodeMsgpack(stxn, SignedTransaction).toEncodingData()
  );

  console.debug('sig', falconSig.byteLength);

  console.log('verify result', verifyResult);
  const result = await atc.execute(client, 4);
  // example: FALCON_SEND

  console.log(
    'Falcon-signed 0-payment confirmed in round',
    result.confirmedRound,
    'txid',
    result.txIDs[0]
  );
  assert.ok(result.confirmedRound > 0, 'expected the transaction to confirm');

  const lsigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: falconAddr,
    receiver: falconAddr,
    amount: 0,
    note: new Uint8Array([1]),
    suggestedParams: { ...suggestedParams, flatFee: true, fee: 3000 },
  });

  const teal = '#pragma version 12\nint 1';
  const compiled = new Uint8Array(
    Buffer.from((await client.compile(teal).do()).result, 'base64')
  );

  const lsig = new LogicSigAccount(compiled);
  await lsig.signWithSigner({
    address: falconAddr,
    delegatedLsigSigner: falconLsigSigner,
  });

  const delegatedSigner = algosdk.makeLogicSigAccountTransactionSigner(lsig);
  const lsigAtc = new algosdk.AtomicTransactionComposer();
  lsigAtc.addTransaction({ txn: lsigTxn, signer: delegatedSigner });
  const lsigResult = await lsigAtc.execute(client, 3);

  console.log(
    'Falcon-signed delegated lsig 0-payment confirmed in round',
    lsigResult.confirmedRound,
    'txid',
    lsigResult.txIDs[0]
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e?.response?.text ?? e?.message);
    process.exit(1);
  });
