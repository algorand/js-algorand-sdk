/* eslint-disable */
(function () {
  const atoken = 'YOUR-ALGOD-API-TOKEN';
  const aserver = 'http://ALGOD-ADDRESS';
  const aport = 'ALGOD-PORT';
  const kmdtoken = 'YOUR-KMD-API-TOKEN';
  const kmdserver = 'http://KMD-ADDRESS';
  const kmdport = 'KMD-PORT';
  const from = document.getElementById('from');
  const to = document.getElementById('to');
  const algos = document.getElementById('algos');
  algos.value = 10000;
  const tb = document.getElementById('block');
  const ta = document.getElementById('ta');
  const ga = document.getElementById('account');
  const st = document.getElementById('transaction');
  const bu = document.getElementById('backup');
  const re = document.getElementById('recover');
  const wr = document.getElementById('wrecover');
  const wall = document.getElementById('wallet');
  const fround = document.getElementById('fround');
  const lround = document.getElementById('lround');
  const adetails = document.getElementById('adetails');
  const trans = document.getElementById('trans');
  const txid = document.getElementById('txid');
  let signKey = null;
  let account = null;

  function createWalletName() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
  // acount information
  if (adetails) {
    adetails.onclick = function () {
      ta.innerHTML = '';
      const algodclient = new algosdk.Algodv2(atoken, aserver, aport);

      (async () => {
        const tx = await algodclient.accountInformation(account);
        const textedJson = JSON.stringify(tx, undefined, 4);
        console.log(textedJson);
        ta.innerHTML = textedJson;
      })().catch((e) => {
        console.log(e);
      });
    };
  }
  // block status
  if (tb) {
    tb.onclick = function () {
      ta.innerHTML = '';
      const algodclient = new algosdk.Algodv2(atoken, aserver, aport);

      (async () => {
        const lastround = (await algodclient.status().do())['last-round'];
        const block = await algodclient.block(lastround).do();
        fround.value = lastround;
        lround.value = lastround + 1000;
        const textedJson = JSON.stringify(block, undefined, 4);
        console.log(textedJson);
        ta.innerHTML = textedJson;

        console.log(block);
      })().catch((e) => {
        console.log(e);
      });
    };
  }
  // Create account
  if (ga) {
    ga.onclick = function () {
      ta.innerHTML = '';

      const acct = algosdk.generateAccount();
      account = acct.addr;
      console.log(account);
      from.value = account;
      const mnemonic = algosdk.secretKeyToMnemonic(acct.sk);
      bu.value = mnemonic;
      console.log(mnemonic);
      const recovered_account = algosdk.mnemonicToSecretKey(mnemonic);
      console.log(recovered_account.addr);
      const isValid = algosdk.isValidAddress(recovered_account.addr);
      console.log(`Is this a valid address: ${isValid}`);
      ta.innerHTML = 'Account created. Save Mnemonic';
      signKey = acct.sk;
    };
  }
  // recover account
  if (re) {
    re.onclick = function () {
      ta.innerHTML = '';

      const recovered_account = algosdk.mnemonicToSecretKey(bu.value);
      console.log(recovered_account.addr);
      from.value = recovered_account.addr;
      const isValid = algosdk.isValidAddress(recovered_account.addr);
      console.log(`Is this a valid address: ${isValid}`);
      ta.innerHTML = 'Account created. Set value in the From Input box';
      account = recovered_account.addr;
      signKey = recovered_account.sk;
      const algodclient = new algosdk.Algodv2(atoken, aserver, aport);
      (async () => {
        const tx = await algodclient.accountInformation(recovered_account.addr);
        const textedJson = JSON.stringify(tx, undefined, 4);
        console.log(textedJson);
        ta.innerHTML = textedJson;
      })().catch((e) => {
        ta.innerHTML = e.text;
        console.log(e);
      });
    };
  }
  // submit transaction
  if (st) {
    st.onclick = function () {
      ta.innerHTML = '';
      const person = {
        firstName: 'John',
        lastName: 'Doe',
        age: 50,
        eyeColor: 'blue',
      };
      const note = algosdk.encodeObj(person);
      const suggestedParams = {
        flatFee: false,
        fee: 1000,
        firstRound: parseInt(fround.value),
        lastRound: parseInt(lround.value),
        genesisID: 'testnet-v1.0',
        genesisHash: 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
      };
      const transactionOptions = {
        from: from.value,
        to: to.value,
        note,
        suggestedParams,
      };
      const { sk } = algosdk.mnemonicToSecretKey(bu.value);
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
        transactionOptions
      );
      const signedTxn = txn.signTxn(sk);
      const algodclient = new algosdk.Algodv2(atoken, aserver, aport);
      (async () => {
        const tx = await algodclient.sendRawTransaction(signedTxn).do();
        const textedJson = JSON.stringify(tx, undefined, 4);
        console.log(textedJson);
        ta.innerHTML = textedJson;
        console.log(tx);
        console.log(tx.txId);
        txid.value = tx.txId;
      })().catch((e) => {
        ta.innerHTML = e.text;
        console.log(e);
      });
    };
  }
  // Get transaction note
  if (trans) {
    trans.onclick = function () {
      ta.innerHTML = '';

      const algodclient = new algosdk.Algodv2(atoken, aserver, aport);
      (async () => {
        const tx = await algodclient
          .pendingTransactionInformation(txid.value)
          .do();
        const textedJson = JSON.stringify(tx, undefined, 4);
        console.log(textedJson);

        const encodednote = algosdk.decodeObj(tx.txn.txn.note);
        ta.innerHTML = JSON.stringify(encodednote, undefined, 4);
      })().catch((e) => {
        ta.innerHTML = e.text;
        if (e.text === undefined) {
        }
        console.log(e);
      });
    };
  }
})();
