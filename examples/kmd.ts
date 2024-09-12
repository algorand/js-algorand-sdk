/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
import { getLocalKmdClient } from './utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getKmdClient() {
  // example: KMD_CREATE_CLIENT
  const kmdToken = 'a'.repeat(64);
  const kmdServer = 'http://localhost';
  const kmdPort = 4002;

  const kmdClient = new algosdk.Kmd(kmdToken, kmdServer, kmdPort);
  // example: KMD_CREATE_CLIENT
  console.log(kmdClient);
}

async function main() {
  const kmdClient = getLocalKmdClient();

  // example: KMD_CREATE_WALLET
  const walletName = 'testWallet1';
  const password = 'testpassword';
  // MDK is undefined since we are creating a completely new wallet
  const masterDerivationKey = undefined;
  const driver = 'sqlite';

  const wallet = await kmdClient.createWallet(
    walletName,
    password,
    masterDerivationKey,
    driver
  );
  const walletID = wallet.wallet.id;
  console.log('Created wallet:', walletID);
  // example: KMD_CREATE_WALLET

  // example: KMD_CREATE_ACCOUNT
  // wallet handle is used to establish a session with the wallet
  const wallethandle = (
    await kmdClient.initWalletHandle(walletID, 'testpassword')
  ).wallet_handle_token;
  console.log('Got wallet handle:', wallethandle);

  const { address } = await kmdClient.generateKey(wallethandle);
  console.log('Created new account:', address);
  // example: KMD_CREATE_ACCOUNT

  // example: KMD_EXPORT_ACCOUNT
  const accountKey = await kmdClient.exportKey(wallethandle, password, address);
  const accountMnemonic = algosdk.secretKeyToMnemonic(accountKey.private_key);
  console.log('Account Mnemonic: ', accountMnemonic);
  // example: KMD_EXPORT_ACCOUNT

  // example: KMD_IMPORT_ACCOUNT
  const newAccount = algosdk.generateAccount();
  console.log('Account: ', newAccount.addr.toString());
  const importedAccount = await kmdClient.importKey(
    wallethandle,
    newAccount.sk
  );
  console.log('Account successfully imported: ', importedAccount);
  // example: KMD_IMPORT_ACCOUNT

  // example: KMD_RECOVER_WALLET
  const exportedMDK = (
    await kmdClient.exportMasterDerivationKey(wallethandle, 'testpassword')
  ).master_derivation_key;
  const recoveredWallet = await kmdClient.createWallet(
    'testWallet2',
    'testpassword',
    exportedMDK,
    'sqlite'
  );
  const recoeveredWalletID = recoveredWallet.wallet.id;

  console.log('Created wallet: ', recoeveredWalletID);

  const recoveredWalletHandle = (
    await kmdClient.initWalletHandle(recoeveredWalletID, 'testpassword')
  ).wallet_handle_token;
  console.log('Got wallet handle: ', recoveredWalletHandle);

  const recoveredAddr = (await kmdClient.generateKey(recoveredWalletHandle))
    .address;
  console.log('Recovered account: ', recoveredAddr);
  // example: KMD_RECOVER_WALLET
}

main();
