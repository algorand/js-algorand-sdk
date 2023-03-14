/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';

async function main() {
  // example: KMD_CREATE_CLIENT
  const kmdtoken = 'a'.repeat(64);
  const kmdserver = 'http://localhost';
  const kmdport = 4002;

  const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);
  // example: KMD_CREATE_CLIENT

  // example: KMD_CREATE_WALLET
  const walletName = 'testWallet1';
  const password = 'testpassword';
  // MDK is undefined since we are creating a completely new wallet
  const masterDerivationKey = undefined;
  const driver = 'sqlite';

  const wallet = await kmdclient.createWallet(
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
    await kmdclient.initWalletHandle(walletID, 'testpassword')
  ).wallet_handle_token;
  console.log('Got wallet handle:', wallethandle);

  const address1 = (await kmdclient.generateKey(wallethandle)).address;
  console.log('Created new account:', address1);
  // example: KMD_CREATE_ACCOUNT

  // example: KMD_RECOVER_WALLET
  const exportedMDK = (
    await kmdclient.exportMasterDerivationKey(wallethandle, 'testpassword')
  ).master_derivation_key;
  const recoveredWallet = await kmdclient.createWallet(
    'testWallet2',
    'testpassword',
    exportedMDK,
    'sqlite'
  );
  const recoeveredWalletID = recoveredWallet.wallet.id;

  console.log('Created wallet: ', recoeveredWalletID);

  const recoveredWalletHandle = (
    await kmdclient.initWalletHandle(recoeveredWalletID, 'testpassword')
  ).wallet_handle_token;
  console.log('Got wallet handle: ', recoveredWalletHandle);

  const recoveredAddr = (await kmdclient.generateKey(recoveredWalletHandle))
    .address;
  console.log('Recovered account: ', recoveredAddr);
  // example: KMD_RECOVER_WALLET
}

main();
