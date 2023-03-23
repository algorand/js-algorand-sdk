/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
import { getLocalAlgodClient, getLocalAccounts } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const suggestedParams = await client.getTransactionParams().do();

  // example: ACCOUNT_RECOVER_MNEMONIC
  // restore 25-word mnemonic from environment variable
  const mnemonicAccount = algosdk.mnemonicToSecretKey(
    process.env.SAMPLE_MNEMONIC!
  );
  console.log('Recovered mnemonic account: ', mnemonicAccount.addr);
  // example: ACCOUNT_RECOVER_MNEMONIC

  const funder = accounts[0];

  // example: MULTISIG_CREATE
  const signerAccounts: algosdk.Account[] = [];
  signerAccounts.push(algosdk.generateAccount());
  signerAccounts.push(algosdk.generateAccount());

  // multiSigParams is used when creating the address and when signing transactions
  const multiSigParams = {
    version: 1,
    threshold: 2,
    addrs: signerAccounts.map((a) => a.addr),
  };
  const multisigAddr = algosdk.multisigAddress(multiSigParams);

  console.log('Created MultiSig Address: ', multisigAddr);
  // example: MULTISIG_CREATE

  const fundMsigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: funder.addr,
    to: multisigAddr,
    amount: 1_000_000,
    suggestedParams,
  });

  await client.sendRawTransaction(fundMsigTxn.signTxn(funder.privateKey)).do();
  await algosdk.waitForConfirmation(client, fundMsigTxn.txID().toString(), 3);

  // example: MULTISIG_SIGN
  const msigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: multisigAddr,
    to: funder.addr,
    amount: 100,
    suggestedParams,
  });

  // First signature uses signMultisigTransaction
  const msigWithFirstSig = algosdk.signMultisigTransaction(
    msigTxn,
    multiSigParams,
    signerAccounts[0].sk
  ).blob;

  // Subsequent signatures use appendSignMultisigTransaction
  const msigWithSecondSig = algosdk.appendSignMultisigTransaction(
    msigWithFirstSig,
    multiSigParams,
    signerAccounts[1].sk
  ).blob;

  await client.sendRawTransaction(msigWithSecondSig).do();
  await algosdk.waitForConfirmation(client, msigTxn.txID().toString(), 3);
  // example: MULTISIG_SIGN

  // example: ACCOUNT_GENERATE
  const generatedAccount = algosdk.generateAccount();
  const passphrase = algosdk.secretKeyToMnemonic(generatedAccount.sk);
  console.log(`My address: ${generatedAccount.addr}`);
  console.log(`My passphrase: ${passphrase}`);
  // example: ACCOUNT_GENERATE

  // example: ACCOUNT_REKEY
  // create and fund a new account that we will eventually rekey
  const originalAccount = algosdk.generateAccount();
  const fundOriginalAccount = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
    {
      from: funder.addr,
      to: originalAccount.addr,
      amount: 1_000_000,
      suggestedParams,
    }
  );

  await client
    .sendRawTransaction(fundOriginalAccount.signTxn(funder.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    client,
    fundOriginalAccount.txID().toString(),
    3
  );

  // authAddr is undefined by default
  const originalAccountInfo = await client
    .accountInformation(originalAccount.addr)
    .do();
  console.log(
    'Account Info: ',
    originalAccountInfo,
    'Auth Addr: ',
    originalAccountInfo['auth-addr']
  );

  // create a new account that will be the new auth addr
  const newSigner = algosdk.generateAccount();
  console.log('New Signer Address: ', newSigner.addr);

  // rekey the original account to the new signer via a payment transaction
  const rekeyTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: originalAccount.addr,
    to: originalAccount.addr,
    amount: 0,
    suggestedParams,
    rekeyTo: newSigner.addr, // set the rekeyTo field to the new signer
  });

  await client.sendRawTransaction(rekeyTxn.signTxn(originalAccount.sk)).do();
  await algosdk.waitForConfirmation(client, rekeyTxn.txID().toString(), 3);

  const originalAccountInfoAfterRekey = await client
    .accountInformation(originalAccount.addr)
    .do();
  console.log(
    'Account Info: ',
    originalAccountInfoAfterRekey,
    'Auth Addr: ',
    originalAccountInfoAfterRekey['auth-addr']
  );

  // form new transaction from rekeyed account
  const txnWithNewSignerSig = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
    {
      from: originalAccount.addr,
      to: funder.addr,
      amount: 100,
      suggestedParams,
    }
  );

  // the transaction is from originalAccount, but signed with newSigner private key
  const signedTxn = txnWithNewSignerSig.signTxn(newSigner.sk);

  await client.sendRawTransaction(signedTxn).do();
  await algosdk.waitForConfirmation(
    client,
    txnWithNewSignerSig.txID().toString(),
    3
  );
  // example: ACCOUNT_REKEY
}

main();
