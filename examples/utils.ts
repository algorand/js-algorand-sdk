import fs from 'fs';
import path from 'path';
import algosdk from '../src';

export async function compileProgram(
  client: algosdk.Algodv2,
  programSource: string
) {
  const compileResponse = await client.compile(programSource).do();
  const compiledBytes = algosdk.base64ToBytes(compileResponse.result);
  return compiledBytes;
}

export function getLocalKmdClient() {
  const kmdToken = 'a'.repeat(64);
  const kmdServer = 'http://localhost';
  const kmdPort = process.env.KMD_PORT || '4002';

  const kmdClient = new algosdk.Kmd(kmdToken, kmdServer, kmdPort);
  return kmdClient;
}

export function getLocalIndexerClient() {
  const indexerToken = 'a'.repeat(64);
  const indexerServer = 'http://localhost';
  const indexerPort = process.env.INDEXER_PORT || '8980';

  const indexerClient = new algosdk.Indexer(
    indexerToken,
    indexerServer,
    indexerPort
  );
  return indexerClient;
}

export function getLocalAlgodClient() {
  const algodToken = 'a'.repeat(64);
  const algodServer = 'http://localhost';
  const algodPort = process.env.ALGOD_PORT || '4001';

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  return algodClient;
}

function sleep(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function indexerWaitForRound(
  client: algosdk.Indexer,
  round: number | bigint,
  maxAttempts: number
) {
  let indexerRound = BigInt(0);
  let attempts = 0;

  for (;;) {
    // eslint-disable-next-line no-await-in-loop
    const status = await client.makeHealthCheck().do();
    indexerRound = status.round;

    if (indexerRound >= round) {
      // Success
      break;
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(1000); // Sleep 1 second and check again
    attempts += 1;

    if (attempts > maxAttempts) {
      // Failsafe to prevent infinite loop
      throw new Error(
        `Timeout waiting for indexer to catch up to round ${round}. It is currently on ${indexerRound}`
      );
    }
  }
}

export interface SandboxAccount {
  addr: algosdk.Address;
  privateKey: Uint8Array;
  signer: algosdk.TransactionSigner;
}

export async function getLocalAccounts(): Promise<SandboxAccount[]> {
  const kmdClient = getLocalKmdClient();

  const wallets = await kmdClient.listWallets();

  let walletId;
  // eslint-disable-next-line no-restricted-syntax
  for (const wallet of wallets.wallets) {
    if (wallet.name === 'unencrypted-default-wallet') walletId = wallet.id;
  }

  if (walletId === undefined)
    throw Error('No wallet named: unencrypted-default-wallet');

  const handleResp = await kmdClient.initWalletHandle(walletId, '');
  const handle = handleResp.wallet_handle_token;

  const addresses = await kmdClient.listKeys(handle);
  // eslint-disable-next-line camelcase
  const acctPromises: Promise<{ private_key: Uint8Array }>[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const addr of addresses.addresses) {
    acctPromises.push(kmdClient.exportKey(handle, '', addr));
  }
  const keys = await Promise.all(acctPromises);

  // Don't need to wait for it
  kmdClient.releaseWalletHandle(handle);

  return keys.map((k) => {
    const addr = new algosdk.Address(k.private_key.slice(32));
    const acct: algosdk.Account = { sk: k.private_key, addr };
    const signer = algosdk.makeBasicAccountTransactionSigner(acct);

    return {
      addr: acct.addr,
      privateKey: acct.sk,
      signer,
    };
  });
}

export async function deployCalculatorApp(
  algodClient: algosdk.Algodv2,
  creator: SandboxAccount
): Promise<bigint> {
  const approvalProgram = fs.readFileSync(
    path.join(__dirname, '/calculator/approval.teal'),
    'utf8'
  );
  const clearProgram = fs.readFileSync(
    path.join(__dirname, '/calculator/clear.teal'),
    'utf8'
  );

  const approvalBin = await compileProgram(algodClient, approvalProgram);
  const clearBin = await compileProgram(algodClient, clearProgram);
  const suggestedParams = await algodClient.getTransactionParams().do();
  const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
    sender: creator.addr,
    approvalProgram: approvalBin,
    clearProgram: clearBin,
    numGlobalByteSlices: 0,
    numGlobalInts: 0,
    numLocalByteSlices: 0,
    numLocalInts: 0,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });

  await algodClient
    .sendRawTransaction(appCreateTxn.signTxn(creator.privateKey))
    .do();

  const result = await algosdk.waitForConfirmation(
    algodClient,
    appCreateTxn.txID(),
    3
  );
  const appId = result.applicationIndex;
  if (!appId) {
    throw new Error('Application not created');
  }
  return appId;
}
