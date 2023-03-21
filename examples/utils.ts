import { Buffer } from 'buffer';
import algosdk from '../src';

export async function compileProgram(
  client: algosdk.Algodv2,
  programSource: string
) {
  const compileResponse = await client.compile(Buffer.from(programSource)).do();
  const compiledBytes = new Uint8Array(
    Buffer.from(compileResponse.result, 'base64')
  );
  return compiledBytes;
}

export function getLocalIndexerClient() {
  // example: CREATE_INDEXER_CLIENT
  const indexerToken = '';
  const indexerServer = 'http://localhost';
  const indexerPort = 8980;

  const indexerClient = new algosdk.Indexer(
    indexerToken,
    indexerServer,
    indexerPort
  );
  // example: CREATE_INDEXER_CLIENT
  return indexerClient;
}

export function getLocalAlgodClient() {
  const algodToken = 'a'.repeat(64);
  const algodServer = 'http://localhost';
  const algodPort = 4001;

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  return algodClient;
}

export async function getLocalAccounts(): Promise<
  {
    addr: string;
    privateKey: Uint8Array;
    signer: algosdk.TransactionSigner;
  }[]
> {
  const kmdClient = new algosdk.Kmd('a'.repeat(64), 'http://localhost', 4002);

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
  const acctPromises: Promise<{ private_key: Buffer }>[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const addr of addresses.addresses) {
    acctPromises.push(kmdClient.exportKey(handle, '', addr));
  }
  const keys = await Promise.all(acctPromises);

  // Don't need to wait for it
  kmdClient.releaseWalletHandle(handle);

  return keys.map((k) => {
    const addr = algosdk.encodeAddress(k.private_key.slice(32));
    const acct = { sk: k.private_key, addr } as algosdk.Account;
    const signer = algosdk.makeBasicAccountTransactionSigner(acct);

    return {
      addr: acct.addr,
      privateKey: acct.sk,
      signer,
    };
  });
}
