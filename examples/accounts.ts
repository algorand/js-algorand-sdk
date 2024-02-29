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

  const acct1 = accounts[0];
  const acct2 = accounts[1];

  // example: ACCOUNT_RECOVER_MNEMONIC
  // restore 25-word mnemonic from a string
  // Note the mnemonic should _never_ appear in your source code
  const mnemonic =
    'creek phrase island true then hope employ veteran rapid hurdle above liberty tissue connect alcohol timber idle ten frog bulb embody crunch taxi abstract month';
  const recoveredAccount = algosdk.mnemonicToSecretKey(mnemonic);
  console.log('Recovered mnemonic account: ', recoveredAccount.addr.toString());
  // example: ACCOUNT_RECOVER_MNEMONIC

  const funder = accounts[0];

  // example: MULTISIG_CREATE
  const signerAccounts: algosdk.Account[] = [];
  signerAccounts.push(algosdk.generateAccount());
  signerAccounts.push(algosdk.generateAccount());
  signerAccounts.push(algosdk.generateAccount());

  // multiSigParams is used when creating the address and when signing transactions
  const multiSigParams: algosdk.MultisigMetadata = {
    version: 1,
    threshold: 2,
    addrs: signerAccounts.map((a) => a.addr),
  };
  const multisigAddr = algosdk.multisigAddress(multiSigParams);

  console.log('Created MultiSig Address: ', multisigAddr.toString());
  // example: MULTISIG_CREATE

  const fundMsigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: funder.addr,
    receiver: multisigAddr,
    amount: 1_000_000,
    suggestedParams,
  });

  await client.sendRawTransaction(fundMsigTxn.signTxn(funder.privateKey)).do();
  await algosdk.waitForConfirmation(client, fundMsigTxn.txID(), 3);

  // example: MULTISIG_SIGN
  const msigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: multisigAddr,
    receiver: funder.addr,
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
  await algosdk.waitForConfirmation(client, msigTxn.txID(), 3);
  // example: MULTISIG_SIGN

  // example: ACCOUNT_GENERATE
  const generatedAccount = algosdk.generateAccount();
  const passphrase = algosdk.secretKeyToMnemonic(generatedAccount.sk);
  console.log(`My address: ${generatedAccount.addr.toString()}`);
  console.log(`My passphrase: ${passphrase}`);
  // example: ACCOUNT_GENERATE

  // example: ACCOUNT_REKEY
  // rekey the original account to the new signer via a payment transaction
  // Note any transaction type can be used to rekey an account
  const rekeyTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: acct1.addr,
    receiver: acct1.addr,
    amount: 0,
    suggestedParams,
    rekeyTo: acct2.addr, // set the rekeyTo field to the new signer
  });

  await client.sendRawTransaction(rekeyTxn.signTxn(acct1.privateKey)).do();
  await algosdk.waitForConfirmation(client, rekeyTxn.txID(), 3);

  const acctInfo = await client.accountInformation(acct1.addr).do();

  console.log(
    `Account Info: ${algosdk.stringifyJSON(acctInfo)} Auth Addr: ${
      acctInfo['auth-addr']
    }`
  );
  // example: ACCOUNT_REKEY

  // the transaction is from originalAccount, but signed with newSigner private key

  const rekeyBack = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: acct1.addr,
    receiver: acct1.addr,
    amount: 0,
    suggestedParams,
    rekeyTo: acct1.addr,
  });
  await client.sendRawTransaction(rekeyBack.signTxn(acct2.privateKey)).do();
  await algosdk.waitForConfirmation(client, rekeyBack.txID(), 3);
}

main();
