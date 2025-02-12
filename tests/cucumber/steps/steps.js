/* eslint-disable func-names,radix */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const algosdk = require('../../../src/index');
const nacl = require('../../../src/nacl/naclWrappers');

const maindir = path.dirname(path.dirname(path.dirname(__dirname)));

function keyPairFromSecretKey(sk) {
  return nacl.keyPairFromSecretKey(sk);
}

function keyPairFromSeed(seed) {
  return nacl.keyPairFromSeed(seed);
}

function genericHash(toHash) {
  return nacl.genericHash(toHash);
}

async function loadResource(res) {
  const p = path.join(
    maindir,
    'tests',
    'cucumber',
    'features',
    'resources',
    res
  );
  return new Promise((resolve, reject) => {
    fs.readFile(p, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

async function loadResourceAsJson(res) {
  return JSON.parse((await loadResource(res)).toString());
}

// START OBJECT CREATION FUNCTIONS

/**
 * If you wish to compare complex objects from different steps, these functions must be used instead
 * of creating the objects directly. This is because of this firefox issue: https://github.com/mozilla/geckodriver/issues/1798
 *
 * If you get an assertion error on firefox that says 'Values identical but not reference-equal',
 * you should probably use these functions or make new ones as needed.
 */

function makeUint8Array(arg) {
  return new Uint8Array(arg);
}

function makeABIMethod(arg) {
  return new algosdk.ABIMethod(arg);
}

function makeABIContract(arg) {
  return new algosdk.ABIContract(arg);
}

function makeArray(...args) {
  return args;
}

function makeObject(obj) {
  return { ...obj };
}

function makeMap(m) {
  return new Map(m);
}

function parseJSON(json) {
  return JSON.parse(json);
}

// END OBJECT CREATION FUNCTIONS

const steps = {
  given: {},
  when: {},
  then: {},
};

/**
 * The getSteps function defines the cucumber steps and returns them.
 *
 * IMPORTANT: This function is made to run in the context of this script in Node and by itself in
 * browsers. In order to keep it working in both contexts, make sure each context provides all the
 * necessary external functions and variables. That means every time you add import a module or add
 * a new helper function or variable above, you should also add an equivalent function or variable
 * to tests/cucumber/browser/test.js.
 *
 * You should also avoid using any Node-specific features in this function. Instead, create a helper
 * function like loadResource. In Node it uses fs to load a file, and in the browser it sends an
 * HTTP GET request to load a file.
 */
module.exports = function getSteps(options) {
  function Given(name, fn) {
    if (Object.prototype.hasOwnProperty.call(steps.given, name)) {
      throw new Error(`Duplicate step: given ${name}`);
    }
    steps.given[name] = fn;
  }

  function When(name, fn) {
    if (Object.prototype.hasOwnProperty.call(steps.when, name)) {
      throw new Error(`Duplicate step: when ${name}`);
    }
    steps.when[name] = fn;
  }

  function Then(name, fn) {
    if (Object.prototype.hasOwnProperty.call(steps.then, name)) {
      throw new Error(`Duplicate step: then ${name}`);
    }
    steps.then[name] = fn;
  }

  // Dev Mode State
  const DEV_MODE_INITIAL_MICROALGOS = 100_000_000;

  const { algod_token: algodToken, kmd_token: kmdToken } = options;

  function bytesEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // String parsing helper methods
  function processAppArgs(subArg) {
    switch (subArg[0]) {
      case 'str':
        return makeUint8Array(new TextEncoder().encode(subArg[1]));
      case 'int':
        return makeUint8Array(algosdk.encodeUint64(parseInt(subArg[1], 10)));
      case 'addr':
        return algosdk.decodeAddress(subArg[1]).publicKey;
      case 'b64':
        return makeUint8Array(algosdk.base64ToBytes(subArg[1]));
      default:
        throw Error(`did not recognize app arg of type ${subArg[0]}`);
    }
  }

  function splitAndProcessAppArgs(inArgs) {
    if (inArgs == null || inArgs === '') {
      return [];
    }
    const splitArgs = inArgs.split(',');
    const subArgs = [];
    splitArgs.forEach((subArg) => {
      subArgs.push(subArg.split(':'));
    });
    const appArgs = makeArray();
    subArgs.forEach((subArg) => {
      appArgs.push(processAppArgs(subArg));
    });
    return appArgs;
  }

  function splitAndProcessBoxReferences(boxRefs) {
    if (boxRefs == null || boxRefs === '') {
      return makeArray();
    }
    const splitRefs = boxRefs.split(',');
    const boxRefArray = makeArray();
    let appIndex = 0;

    for (let i = 0; i < splitRefs.length; i++) {
      if (i % 2 === 0) {
        appIndex = parseInt(splitRefs[i]);
      } else {
        const refArg = splitRefs[i].split(':');
        boxRefArray.push({
          appIndex,
          name: processAppArgs(refArg),
        });
      }
    }
    return boxRefArray;
  }

  /*
  doRaw and the associated functions are used to allow test servers to return unexpected response data in cases where
  we're not testing the functionality of the response. It is the responsibility of the mocking step to set the doRaw
  variable to true if it intends to send bad responses.
  By default, we you `do` which will throw an exception if malformed response data is returned.
   */
  let doRaw = false;

  async function doOrDoRaw(req) {
    if (doRaw === true) {
      doRaw = false;
      return req.doRaw();
    }
    return req.do();
  }

  function concatArrays(...arrs) {
    const size = arrs.reduce((sum, arr) => sum + arr.length, 0);
    const c = new Uint8Array(size);

    let offset = 0;
    for (let i = 0; i < arrs.length; i++) {
      c.set(arrs[i], offset);
      offset += arrs[i].length;
    }

    return c;
  }

  Given('a kmd client', function () {
    this.kcl = new algosdk.Kmd(kmdToken, 'http://localhost', 60001);
    return this.kcl;
  });

  Given('an algod v2 client', function () {
    this.v2Client = new algosdk.Algodv2(algodToken, 'http://localhost', 60000);
  });

  Given('an indexer v2 client', function () {
    this.indexerV2client = new algosdk.Indexer('', 'http://localhost', 59999);
  });

  Given('wallet information', async function () {
    this.wallet_name = 'unencrypted-default-wallet';
    this.wallet_pswd = '';

    const result = await this.kcl.listWallets();
    for (let i = 0; i < result.wallets.length; i++) {
      const w = result.wallets[i];
      if (w.name === this.wallet_name) {
        this.wallet_id = w.id;
        break;
      }
    }
    this.handle = await this.kcl.initWalletHandle(
      this.wallet_id,
      this.wallet_pswd
    );
    this.handle = this.handle.wallet_handle_token;
    this.accounts = await this.kcl.listKeys(this.handle);
    this.accounts = this.accounts.addresses;
    return this.accounts;
  });

  When('I get versions with algod', async function () {
    this.versions = await this.v2Client.versionsCheck().do();
    this.versions = this.versions.versions;
    return this.versions;
  });

  Then('v1 should be in the versions', function () {
    assert.deepStrictEqual(true, this.versions.indexOf('v1') >= 0);
  });

  Then('v2 should be in the versions', function () {
    assert.deepStrictEqual(true, this.versions.indexOf('v2') >= 0);
  });

  When('I get versions with kmd', async function () {
    this.versions = await this.kcl.versions();
    this.versions = this.versions.versions;
    return this.versions;
  });

  Given(
    'payment transaction parameters {int} {int} {int} {string} {string} {string} {int} {string} {string}',
    function (fee, fv, lv, gh, receiver, close, amt, gen, note) {
      this.fee = parseInt(fee);
      this.fv = parseInt(fv);
      this.lv = parseInt(lv);
      this.gh = algosdk.base64ToBytes(gh);
      this.receiver = receiver;
      if (close !== 'none') {
        this.close = close;
      }
      this.amt = parseInt(amt);
      if (gen !== 'none') {
        this.gen = gen;
      }
      if (note !== 'none') {
        this.note = makeUint8Array(algosdk.base64ToBytes(note));
      }
    }
  );

  Given('mnemonic for private key {string}', function (mn) {
    const result = algosdk.mnemonicToSecretKey(mn);
    this.pk = result.addr;

    this.sk = result.sk;
  });

  Given('multisig addresses {string}', function (addresses) {
    const addrlist = addresses.split(' ');
    this.msig = {
      version: 1,
      threshold: 2,
      addrs: addrlist,
    };
    this.pk = algosdk.multisigAddress(this.msig);
  });

  When('I sign the transaction with the private key', function () {
    const obj = algosdk.signTransaction(this.txn, this.sk);
    this.stx = obj.blob;
  });

  When('I sign the multisig transaction with the private key', function () {
    const obj = algosdk.signMultisigTransaction(this.txn, this.msig, this.sk);
    this.stx = obj.blob;
  });

  When('I sign the transaction with kmd', async function () {
    this.stxKmd = await this.kcl.signTransaction(
      this.handle,
      this.wallet_pswd,
      this.txn
    );
    return this.stxKmd;
  });

  When('I sign the multisig transaction with kmd', async function () {
    const addrs = [];
    for (let i = 0; i < this.msig.addrs.length; i++) {
      addrs.push(
        algosdk.bytesToBase64(
          algosdk.decodeAddress(this.msig.addrs[i]).publicKey
        )
      );
    }
    await this.kcl.importMultisig(
      this.handle,
      this.msig.version,
      this.msig.threshold,
      addrs
    );

    const key = algosdk.decodeAddress(this.pk).publicKey;
    this.stxKmd = await this.kcl.signMultisigTransaction(
      this.handle,
      this.wallet_pswd,
      this.txn,
      key,
      null
    );
    this.stxKmd = this.stxKmd.multisig;
    return this.stxKmd;
  });

  Then(
    'the signed transaction should equal the golden {string}',
    function (golden) {
      assert.deepStrictEqual(algosdk.base64ToBytes(golden), this.stx);
    }
  );

  Then(
    'the signed transaction should equal the kmd signed transaction',
    function () {
      assert.deepStrictEqual(this.stx, this.stxKmd);
    }
  );

  Then(
    'the multisig address should equal the golden {string}',
    function (golden) {
      const goldenAddr = algosdk.Address.fromString(golden);
      assert.deepStrictEqual(algosdk.multisigAddress(this.msig), goldenAddr);
    }
  );

  Then(
    'the multisig transaction should equal the golden {string}',
    function (golden) {
      assert.deepStrictEqual(algosdk.base64ToBytes(golden), this.stx);
    }
  );

  Then(
    'the multisig transaction should equal the kmd signed multisig transaction',
    async function () {
      await this.kcl.deleteMultisig(
        this.handle,
        this.wallet_pswd,
        algosdk.multisigAddress(this.msig).toString()
      );
      const s = algosdk.decodeObj(this.stx);
      const m = algosdk.encodeObj(s.msig);
      assert.deepStrictEqual(m, algosdk.base64ToBytes(this.stxKmd));
    }
  );

  When('I generate a key using kmd', async function () {
    this.pk = await this.kcl.generateKey(this.handle);
    this.pk = this.pk.address;
    return this.pk;
  });

  When(
    'I generate a key using kmd for rekeying and fund it',
    async function () {
      this.rekey = await this.kcl.generateKey(this.handle);
      this.rekey = this.rekey.address;
      // Fund the rekey address with some Algos
      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstValid === 0) sp.firstValid = 1;
      const fundingTxnArgs =
        algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: this.accounts[0],
          receiver: this.rekey,
          amount: DEV_MODE_INITIAL_MICROALGOS,
          suggestedParams: sp,
        });

      const stxKmd = await this.kcl.signTransaction(
        this.handle,
        this.wallet_pswd,
        fundingTxnArgs
      );
      await this.v2Client.sendRawTransaction(stxKmd).do();
      return this.rekey;
    }
  );

  Then('the key should be in the wallet', async function () {
    let keys = await this.kcl.listKeys(this.handle);
    keys = keys.addresses;
    assert.ok(keys.indexOf(this.pk) >= 0);
    return keys;
  });

  When('I delete the key', async function () {
    return this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk);
  });

  Then('the key should not be in the wallet', async function () {
    let keys = await this.kcl.listKeys(this.handle);
    keys = keys.addresses;
    assert.ok(keys.indexOf(this.pk) < 0);
    return keys;
  });

  When('I generate a key', function () {
    const result = algosdk.generateAccount();
    this.pk = result.addr.toString();
    this.sk = result.sk;
  });

  When('I import the key', async function () {
    return this.kcl.importKey(this.handle, this.sk);
  });

  Then(
    'the private key should be equal to the exported private key',
    async function () {
      let exp = await this.kcl.exportKey(
        this.handle,
        this.wallet_pswd,
        this.pk
      );
      exp = exp.private_key;
      assert.deepStrictEqual(
        algosdk.bytesToBase64(exp),
        algosdk.bytesToBase64(this.sk)
      );
      return this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk);
    }
  );

  When('I get the private key', async function () {
    const sk = await this.kcl.exportKey(this.handle, this.wallet_pswd, this.pk);
    this.sk = sk.private_key;
    return this.sk;
  });

  Given(
    'default transaction with parameters {int} {string}',
    async function (amt, note) {
      [this.pk] = this.accounts;
      const result = await this.v2Client.getTransactionParams().do();
      this.txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: this.accounts[0],
        receiver: this.accounts[1],
        amount: parseInt(amt),
        suggestedParams: result,
        note: makeUint8Array(algosdk.base64ToBytes(note)),
      });
      return this.txn;
    }
  );

  Given(
    'default transaction with parameters {int} {string} and rekeying key',
    async function (amt, note) {
      this.pk = this.rekey;
      const result = await this.v2Client.getTransactionParams().do();
      this.lastValid = result.lastValid;
      this.txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: this.rekey,
        receiver: this.accounts[1],
        note: makeUint8Array(algosdk.base64ToBytes(note)),
        amount: parseInt(amt),
        suggestedParams: result,
      });
      return this.txn;
    }
  );

  Given(
    'default multisig transaction with parameters {int} {string}',
    async function (amt, note) {
      [this.pk] = this.accounts;
      const result = await this.v2Client.getTransactionParams().do();
      this.msig = {
        version: 1,
        threshold: 1,
        addrs: this.accounts,
      };

      this.txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: algosdk.multisigAddress(this.msig),
        receiver: this.accounts[1],
        note: makeUint8Array(algosdk.base64ToBytes(note)),
        amount: parseInt(amt),
        suggestedParams: result,
      });
      return this.txn;
    }
  );

  When('I import the multisig', async function () {
    const addrs = [];
    for (let i = 0; i < this.msig.addrs.length; i++) {
      addrs.push(
        algosdk.bytesToBase64(
          algosdk.decodeAddress(this.msig.addrs[i]).publicKey
        )
      );
    }
    return this.kcl.importMultisig(
      this.handle,
      this.msig.version,
      this.msig.threshold,
      addrs
    );
  });

  Then('the multisig should be in the wallet', async function () {
    const resp = await this.kcl.listMultisig(this.handle);
    const keys = resp.addresses;
    const addr = algosdk.multisigAddress(this.msig).toString();
    assert.ok(keys.indexOf(addr) >= 0, `Can't find address ${addr} in ${keys}`);
    return keys;
  });

  Then('the multisig should not be in the wallet', async function () {
    let keys = await this.kcl.listMultisig(this.handle);
    if (typeof keys.addresses === 'undefined') {
      return true;
    }

    keys = keys.addresses;
    assert.ok(keys.indexOf(algosdk.multisigAddress(this.msig).toString()) < 0);
    return keys;
  });

  When('I export the multisig', async function () {
    this.msigExp = await this.kcl.exportMultisig(
      this.handle,
      algosdk.multisigAddress(this.msig).toString()
    );
    return this.msigExp;
  });

  When('I delete the multisig', async function () {
    return this.kcl.deleteMultisig(
      this.handle,
      this.wallet_pswd,
      algosdk.multisigAddress(this.msig).toString()
    );
  });

  Then('the multisig should equal the exported multisig', function () {
    for (let i = 0; i < this.msigExp.length; i++) {
      assert.deepStrictEqual(
        algosdk.encodeAddress(algosdk.base64ToBytes(this.msigExp[i])),
        this.msig.addrs[i]
      );
    }
  });

  Then('the node should be healthy', async function () {
    await this.v2Client.healthCheck().do();
  });

  Then('I get the ledger supply', async function () {
    return this.v2Client.supply().do();
  });

  When('I create a bid', function () {
    let addr = algosdk.generateAccount();
    this.sk = addr.sk;
    addr = addr.addr;
    this.bid = {
      bidderKey: addr,
      bidAmount: 1,
      maxPrice: 2,
      bidID: 3,
      auctionKey: addr,
      auctionID: 4,
    };
    return this.bid;
  });

  When('I encode and decode the bid', function () {
    this.sbid = algosdk.decodeObj(algosdk.encodeObj(this.sbid));
    return this.sbid;
  });

  When('I sign the bid', function () {
    this.sbid = algosdk.decodeObj(algosdk.signBid(this.bid, this.sk));
    this.oldBid = algosdk.decodeObj(algosdk.signBid(this.bid, this.sk));
  });

  Then('the bid should still be the same', function () {
    assert.deepStrictEqual(
      algosdk.encodeObj(this.sbid),
      algosdk.encodeObj(this.oldBid)
    );
  });

  When('I decode the address', function () {
    this.old = this.pk;
    this.addrBytes = algosdk.decodeAddress(this.pk).publicKey;
  });

  When('I encode the address', function () {
    this.pk = algosdk.encodeAddress(this.addrBytes);
  });

  Then('the address should still be the same', function () {
    assert.deepStrictEqual(this.pk, this.old);
  });

  When('I convert the private key back to a mnemonic', function () {
    this.mn = algosdk.secretKeyToMnemonic(this.sk);
  });

  Then('the mnemonic should still be the same as {string}', function (mn) {
    assert.deepStrictEqual(this.mn, mn);
  });

  Given('mnemonic for master derivation key {string}', function (mn) {
    this.mdk = algosdk.mnemonicToMasterDerivationKey(mn);
  });

  When('I convert the master derivation key back to a mnemonic', function () {
    this.mn = algosdk.masterDerivationKeyToMnemonic(this.mdk);
  });

  When('I create the flat fee payment transaction', function () {
    this.txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: this.pk,
      receiver: this.receiver,
      amount: this.amt ?? 0,
      closeRemainderTo: this.close,
      note: this.note,
      suggestedParams: {
        minFee: 1000, // Shouldn't matter because flatFee=true
        flatFee: true,
        fee: this.fee,
        firstValid: this.fv,
        lastValid: this.lv,
        genesisHash: this.gh,
        genesisID: this.gen,
      },
    });
  });

  Given('encoded multisig transaction {string}', function (encTxn) {
    this.mtx = algosdk.base64ToBytes(encTxn);
    this.stx = algosdk.decodeObj(this.mtx);
  });

  When('I append a signature to the multisig transaction', function () {
    const addresses = this.stx.msig.subsig.slice();
    for (let i = 0; i < addresses.length; i++) {
      addresses[i] = algosdk.encodeAddress(addresses[i].pk);
    }
    const msig = {
      version: this.stx.msig.v,
      threshold: this.stx.msig.thr,
      addrs: addresses,
    };
    this.stx = algosdk.appendSignMultisigTransaction(
      this.mtx,
      msig,
      this.sk
    ).blob;
  });

  When('I merge the multisig transactions', function () {
    this.stx = algosdk.mergeMultisigTransactions(this.mtxs);
  });

  When('I convert {int} microalgos to algos and back', function (microalgos) {
    this.microalgos = algosdk
      .algosToMicroalgos(algosdk.microalgosToAlgos(microalgos))
      .toString();
  });

  Then(
    'it should still be the same amount of microalgos {int}',
    function (microalgos) {
      assert.deepStrictEqual(this.microalgos, microalgos.toString());
    }
  );

  Given('encoded multisig transactions {string}', function (encTxns) {
    this.mtxs = [];
    const mtxs = encTxns.split(' ');
    for (let i = 0; i < mtxs.length; i++) {
      this.mtxs.push(algosdk.base64ToBytes(mtxs[i]));
    }
  });

  When('I create the multisig payment transaction', function () {
    this.txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: algosdk.multisigAddress(this.msig),
      receiver: this.receiver,
      amount: this.amt ?? 0,
      closeRemainderTo: this.close,
      note: this.note,
      suggestedParams: {
        minFee: 1000, // Hardcoding, but it would be nice to take this as an argument
        fee: this.fee,
        firstValid: this.fv,
        lastValid: this.lv,
        genesisHash: this.gh,
        genesisID: this.gen,
      },
    });
    return this.txn;
  });

  When('I create the multisig payment transaction with zero fee', function () {
    this.txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: algosdk.multisigAddress(this.msig),
      receiver: this.receiver,
      amount: this.amt ?? 0,
      closeRemainderTo: this.close,
      note: this.note,
      suggestedParams: {
        minFee: 1000, // Shouldn't matter because flatFee=true
        fee: this.fee,
        flatFee: true,
        firstValid: this.fv,
        lastValid: this.lv,
        genesisHash: this.gh,
        genesisID: this.gen,
      },
    });
    return this.txn;
  });

  When('I send the transaction', async function () {
    const txid = await this.v2Client.sendRawTransaction(this.stx).do();
    this.txid = txid.txid;
    this.appTxid = txid; // Alias to use in waitForTransaction.
    return this.txid;
  });

  When('I send the kmd-signed transaction', async function () {
    const txid = await this.v2Client.sendRawTransaction(this.stxKmd).do();
    this.txid = txid.txid;
    this.appTxid = txid; // Alias to use in waitForTransaction.
    return this.txid;
  });

  // eslint-disable-next-line consistent-return
  When('I send the multisig transaction', async function () {
    try {
      this.txid = await this.v2Client.sendRawTransaction(this.stx).do();
      this.err = false;
      return this.txid;
    } catch (e) {
      this.err = true;
    }
  });

  Then('the transaction should not go through', function () {
    assert.deepStrictEqual(true, this.err);
  });

  When('I create a wallet', async function () {
    this.wallet_name = 'Walletjs';
    this.wallet_pswd = '';
    this.wallet_id = await this.kcl.createWallet(
      this.wallet_name,
      this.wallet_pswd
    );
    this.wallet_id = this.wallet_id.wallet.id;
    return this.wallet_id;
  });

  Then('the wallet should exist', async function () {
    const result = await this.kcl.listWallets();
    let exists = false;
    for (let i = 0; i < result.wallets.length; i++) {
      const w = result.wallets[i];
      if (w.name === this.wallet_name) {
        exists = true;
      }
    }
    assert.deepStrictEqual(true, exists);
  });

  When('I get the wallet handle', async function () {
    this.handle = await this.kcl.initWalletHandle(
      this.wallet_id,
      this.wallet_pswd
    );
    this.handle = this.handle.wallet_handle_token;
    return this.handle;
  });

  Then('I can get the master derivation key', async function () {
    const mdk = await this.kcl.exportMasterDerivationKey(
      this.handle,
      this.wallet_pswd
    );
    return mdk;
  });

  When('I rename the wallet', async function () {
    this.wallet_name = 'Walletjs_new';
    return this.kcl.renameWallet(
      this.wallet_id,
      this.wallet_pswd,
      this.wallet_name
    );
  });

  Then(
    'I can still get the wallet information with the same handle',
    async function () {
      return this.kcl.getWallet(this.handle);
    }
  );

  When('I renew the wallet handle', async function () {
    return this.kcl.renewWalletHandle(this.handle);
  });

  When('I release the wallet handle', async function () {
    return this.kcl.releaseWalletHandle(this.handle);
  });

  Then('the wallet handle should not work', async function () {
    try {
      await this.kcl.renewWalletHandle(this.handle);
      this.err = false;
    } catch (e) {
      this.err = true;
    }
    assert.deepStrictEqual(true, this.err);
  });

  // When("I read a transaction {string} from file {string}", function(string, num){
  //   this.num = num
  //   this.txn = algosdk.decodeObj(
  //     makeUint8Array(fs.readFileSync(maindir + '/temp/raw' + num + '.tx'))
  //   );
  //   return this.txn
  // });

  // When("I write the transaction to file", function(){
  //   fs.writeFileSync(
  //     maindir + '/temp/raw' + this.num + '.tx',
  //     Buffer.from(algosdk.encodeObj(this.txn))
  //   );
  // });

  // Then("the transaction should still be the same", function(){
  //   stxnew = makeUint8Array(fs.readFileSync(maindir + '/temp/raw' + this.num + '.tx'));
  //   stxold = makeUint8Array(fs.readFileSync(maindir + '/temp/old' + this.num + '.tx'));
  //   assert.deepStrictEqual(stxnew, stxold);
  // });

  // Then("I do my part", async function(){
  //     stx = makeUint8Array(fs.readFileSync(maindir + '/temp/txn.tx'));
  //     this.txid = await this.acl.sendRawTransaction(stx)
  //     this.txid = this.txid.txId
  //     return this.txid
  // })

  Then('I can get account information', async function () {
    await this.v2Client.accountInformation(this.pk).do();
    return this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk);
  });

  Given(
    'default V2 key registration transaction {string}',
    async function (type) {
      const voteKey = makeUint8Array(
        algosdk.base64ToBytes('9mr13Ri8rFepxN3ghIUrZNui6LqqM5hEzB45Rri5lkU=')
      );
      const selectionKey = makeUint8Array(
        algosdk.base64ToBytes('dx717L3uOIIb/jr9OIyls1l5Ei00NFgRa380w7TnPr4=')
      );
      const stateProofKey = makeUint8Array(
        algosdk.base64ToBytes(
          'mYR0GVEObMTSNdsKM6RwYywHYPqVDqg3E4JFzxZOreH9NU8B+tKzUanyY8AQ144hETgSMX7fXWwjBdHz6AWk9w=='
        )
      );

      const from = this.accounts[0];
      this.pk = from;

      const result = await this.v2Client.getTransactionParams().do();
      this.lastValid = result.lastValid;

      if (type === 'online') {
        this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          sender: from,
          voteKey,
          selectionKey,
          stateProofKey,
          voteFirst: 1,
          voteLast: 2000,
          voteKeyDilution: 10,
          suggestedParams: result,
        });
      } else if (type === 'offline') {
        this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          sender: from,
          suggestedParams: result,
        });
      } else if (type === 'nonparticipation') {
        this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          sender: from,
          nonParticipation: true,
          suggestedParams: result,
        });
      } else {
        throw new Error(`Unrecognized keyreg type: ${type}`);
      }
    }
  );

  /// /////////////////////////////////
  // begin asset tests
  /// /////////////////////////////////

  Given('asset test fixture', function () {
    this.assetTestFixture = {
      creator: '',
      index: 0,
      name: 'testcoin',
      unitname: 'coins',
      url: 'http://test',
      metadataHash: new TextEncoder().encode(
        'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh'
      ),
      expectedParams: undefined,
      queriedParams: undefined,
      lastTxn: undefined,
    };
  });

  Given(
    'default asset creation transaction with total issuance {int}',
    async function (issuance) {
      [this.assetTestFixture.creator] = this.accounts;
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;
      const parsedIssuance = BigInt(issuance);
      const decimals = 0;
      const defaultFrozen = false;
      const assetName = this.assetTestFixture.name;
      const unitName = this.assetTestFixture.unitname;
      const assetURL = this.assetTestFixture.url;
      const { metadataHash } = this.assetTestFixture;
      const manager = this.assetTestFixture.creator;
      const reserve = this.assetTestFixture.creator;
      const freeze = this.assetTestFixture.creator;
      const clawback = this.assetTestFixture.creator;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          sender: this.assetTestFixture.creator,
          note: this.note,
          total: parsedIssuance,
          decimals,
          defaultFrozen,
          unitName,
          assetName,
          assetURL,
          assetMetadataHash: metadataHash,
          manager,
          reserve,
          freeze,
          clawback,
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.assetTestFixture.expectedParams = {
        creator: this.assetTestFixture.creator,
        total: parsedIssuance,
        defaultFrozen,
        unitName,
        name: assetName,
        url: assetURL,
        metadataHash,
        manager,
        reserve,
        freeze,
        clawback,
        decimals,
      };
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      [this.pk] = this.accounts;
    }
  );

  Given(
    'default-frozen asset creation transaction with total issuance {int}',
    async function (issuance) {
      [this.assetTestFixture.creator] = this.accounts;
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;
      const parsedIssuance = BigInt(issuance);
      const decimals = 0;
      const defaultFrozen = true;
      const assetName = this.assetTestFixture.name;
      const unitName = this.assetTestFixture.unitname;
      const assetURL = this.assetTestFixture.url;
      const { metadataHash } = this.assetTestFixture;
      const manager = this.assetTestFixture.creator;
      const reserve = this.assetTestFixture.creator;
      const freeze = this.assetTestFixture.creator;
      const clawback = this.assetTestFixture.creator;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          sender: this.assetTestFixture.creator,
          note: this.note,
          total: parsedIssuance,
          decimals,
          defaultFrozen,
          unitName,
          assetName,
          assetURL,
          assetMetadataHash: metadataHash,
          manager,
          reserve,
          freeze,
          clawback,
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.assetTestFixture.expectedParams = {
        creator: this.assetTestFixture.creator,
        total: parsedIssuance,
        defaultFrozen,
        unitName,
        name: assetName,
        url: assetURL,
        metadataHash,
        manager,
        reserve,
        freeze,
        clawback,
        decimals,
      };
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      [this.pk] = this.accounts;
    }
  );

  // a lambda "return a-b" would suffice for keys.sort, below,
  // but define it separately for readability
  function sortKeysAscending(a, b) {
    if (a > b) {
      return 1;
    }
    if (b > a) {
      return -1;
    }
    return 0;
  }

  When('I update the asset index', async function () {
    const accountResponse = await this.v2Client
      .accountInformation(this.assetTestFixture.creator)
      .do();
    const heldAssets = accountResponse.createdAssets;
    let assetIds = heldAssets.map((asset) => asset.index);
    assetIds = assetIds.sort(sortKeysAscending);
    const assetIndex = assetIds[assetIds.length - 1];

    // this is stored as a string so it can be used as a key later.
    this.assetTestFixture.index = assetIndex.toString();
  });

  When('I get the asset info', async function () {
    this.assetTestFixture.queriedParams = await this.v2Client
      .getAssetByID(this.assetTestFixture.index)
      .do();
  });

  Then('the asset info should match the expected asset info', function () {
    for (const [key, expectedValue] of Object.entries(
      this.assetTestFixture.expectedParams
    )) {
      const actualValue = this.assetTestFixture.queriedParams.params[key];
      assert.deepStrictEqual(
        actualValue,
        expectedValue,
        `Asset params do not match for ${key}. Actual: ${actualValue}, Expected: ${expectedValue}`
      );
    }
  });

  When(
    'I create a no-managers asset reconfigure transaction',
    async function () {
      [this.assetTestFixture.creator] = this.accounts;
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;
      // if we truly supplied no managers at all, it would be an asset destroy txn
      // so leave one key written
      const manager = this.assetTestFixture.creator;
      let reserve;
      let freeze;
      let clawback;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
          sender: this.assetTestFixture.creator,
          note: this.note,
          manager,
          reserve,
          freeze,
          clawback,
          assetIndex: parseInt(this.assetTestFixture.index),
          suggestedParams: this.params,
          strictEmptyAddressChecking: false,
        });
      // update vars used by other helpers
      this.assetTestFixture.expectedParams.reserve = undefined;
      this.assetTestFixture.expectedParams.freeze = undefined;
      this.assetTestFixture.expectedParams.clawback = undefined;
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      [this.pk] = this.accounts;
    }
  );

  When('I create an asset destroy transaction', async function () {
    [this.assetTestFixture.creator] = this.accounts;
    this.params = await this.v2Client.getTransactionParams().do();
    this.fee = this.params.fee;
    this.fv = this.params.firstValid;
    this.lv = this.params.lastValid;
    this.note = undefined;
    this.gh = this.params.genesisHash;

    this.assetTestFixture.lastTxn =
      algosdk.makeAssetDestroyTxnWithSuggestedParamsFromObject({
        sender: this.assetTestFixture.creator,
        note: this.note,
        assetIndex: parseInt(this.assetTestFixture.index),
        suggestedParams: this.params,
      });
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastValid = this.params.lastValid;
    [this.pk] = this.accounts;
  });

  Then('I should be unable to get the asset info', async function () {
    let failed = false;
    try {
      await this.v2Client.getAssetByID(this.assetTestFixture.index).do();
    } catch (e) {
      failed = true;
    }
    assert.deepStrictEqual(failed, true);
  });

  When(
    'I create a transaction for a second account, signalling asset acceptance',
    async function () {
      const accountToUse = this.accounts[1];
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: accountToUse,
          receiver: accountToUse,
          amount: 0,
          note: this.note,
          assetIndex: parseInt(this.assetTestFixture.index),
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      this.pk = accountToUse;
    }
  );

  When(
    'I create a transaction transferring {int} assets from creator to a second account',
    async function (amount) {
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: this.assetTestFixture.creator,
          receiver: this.accounts[1],
          amount: parseInt(amount),
          note: this.note,
          assetIndex: parseInt(this.assetTestFixture.index),
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      this.pk = this.assetTestFixture.creator;
    }
  );

  When(
    'I create a transaction transferring {int} assets from a second account to creator',
    async function (amount) {
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          receiver: this.assetTestFixture.creator,
          sender: this.accounts[1],
          amount: parseInt(amount),
          note: this.note,
          assetIndex: parseInt(this.assetTestFixture.index),
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      [this.pk] = this.accounts;
    }
  );

  Then(
    'the creator should have {int} assets remaining',
    async function (expectedTotal) {
      const accountInformation = await this.v2Client
        .accountInformation(this.assetTestFixture.creator)
        .do();
      for (const asset of accountInformation.assets) {
        if (asset.assetId === this.assetTestFixture.index) {
          assert.deepStrictEqual(asset.amount, parseInt(expectedTotal));
        }
      }
    }
  );

  When('I send the bogus kmd-signed transaction', async function () {
    this.err = false;
    try {
      await this.v2Client.sendRawTransaction(this.stxKmd).do();
    } catch (e) {
      this.err = true;
    }
  });

  When(
    'I create an un-freeze transaction targeting the second account',
    async function () {
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;
      const freezer = this.assetTestFixture.creator;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
          sender: freezer,
          freezeTarget: this.accounts[1],
          assetIndex: parseInt(this.assetTestFixture.index),
          frozen: false,
          note: this.note,
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      this.pk = this.assetTestFixture.creator;
    }
  );

  When(
    'I create a freeze transaction targeting the second account',
    async function () {
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;
      const freezer = this.assetTestFixture.creator;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
          sender: freezer,
          freezeTarget: this.accounts[1],
          assetIndex: parseInt(this.assetTestFixture.index),
          frozen: true,
          note: this.note,
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      this.pk = this.assetTestFixture.creator;
    }
  );

  When(
    'I create a transaction revoking {int} assets from a second account to creator',
    async function (amount) {
      this.params = await this.v2Client.getTransactionParams().do();
      this.fee = this.params.fee;
      this.fv = this.params.firstValid;
      this.lv = this.params.lastValid;
      this.note = undefined;
      this.gh = this.params.genesisHash;

      this.assetTestFixture.lastTxn =
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: this.assetTestFixture.creator,
          receiver: this.assetTestFixture.creator,
          assetSender: this.accounts[1],
          amount: parseInt(amount),
          note: this.note,
          genesisHash: this.gh,
          assetIndex: parseInt(this.assetTestFixture.index),
          suggestedParams: this.params,
        });
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastValid = this.params.lastValid;
      this.pk = this.assetTestFixture.creator;
    }
  );

  /// /////////////////////////////////
  // begin indexer and algodv2 unit tests
  /// /////////////////////////////////

  const globalErrForExamination = '';
  const {
    mockAlgodResponderPort,
    mockAlgodResponderHost,
    mockAlgodPathRecorderPort,
    mockAlgodPathRecorderHost,
    mockIndexerPathRecorderPort,
    mockIndexerPathRecorderHost,
  } = options;

  let expectedMockResponse;
  let responseFormat;

  Given(
    'mock http responses in {string} loaded from {string}',
    function (expectedBody, format) {
      doRaw = false;
      if (expectedBody !== null) {
        expectedMockResponse = expectedBody;
        if (format === 'msgp') {
          expectedMockResponse = new Uint8Array(
            algosdk.base64ToBytes(expectedMockResponse)
          );
        }
      }
      responseFormat = format;
      this.v2Client = new algosdk.Algodv2(
        '',
        `http://${mockAlgodResponderHost}`,
        mockAlgodResponderPort,
        {}
      );
      this.indexerClient = new algosdk.Indexer(
        '',
        `http://${mockAlgodResponderHost}`,
        mockAlgodResponderPort,
        {}
      );
    }
  );

  Given(
    'mock http responses in {string} loaded from {string} with status {int}.',
    function (expectedBody, status, format) {
      doRaw = false;
      if (expectedBody !== null) {
        expectedMockResponse = expectedBody;
        if (format === 'msgp') {
          expectedMockResponse = new Uint8Array(
            algosdk.base64ToBytes(expectedMockResponse)
          );
        }
      }
      responseFormat = format;
      this.v2Client = new algosdk.Algodv2(
        '',
        `http://${mockAlgodResponderHost}`,
        mockAlgodResponderPort,
        {}
      );
      this.indexerClient = new algosdk.Indexer(
        '',
        `http://${mockAlgodResponderHost}`,
        mockAlgodResponderPort,
        {}
      );
      this.expectedMockResponseCode = status;
    }
  );

  When(
    'we make any {string} call to {string}.',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function (client, endpoint) {
      if (client === 'algod') {
        switch (endpoint) {
          case 'GetStatus':
            this.actualMockResponse = await this.v2Client.status().do();
            break;
          case 'GetBlock':
            this.actualMockResponse = await this.v2Client.block(10).do();
            break;
          case 'WaitForBlock':
            this.actualMockResponse = await this.v2Client
              .statusAfterBlock(10)
              .do();
            break;
          case 'TealCompile':
            this.actualMockResponse = await this.v2Client
              .compile(makeUint8Array())
              .do();
            break;
          case 'RawTransaction':
            this.actualMockResponse = await this.v2Client
              .sendRawTransaction(makeUint8Array())
              .do();
            break;
          case 'GetSupply':
            this.actualMockResponse = await this.v2Client.supply().do();
            break;
          case 'TransactionParams': {
            const response = await this.v2Client.getTransactionParams().do();
            this.actualMockResponse =
              new algosdk.modelsv2.TransactionParametersResponse({
                consensusVersion: response.consensusVersion,
                fee: response.fee,
                genesisHash: response.genesisHash,
                genesisId: response.genesisID,
                lastRound: response.firstValid,
                minFee: response.minFee,
              });
            break;
          }
          case 'AccountInformation':
            this.actualMockResponse = await this.v2Client
              .accountInformation(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'GetApplicationByID':
            this.actualMockResponse = await this.v2Client
              .getApplicationByID(10)
              .do();
            break;
          case 'GetAssetByID':
            this.actualMockResponse = await this.v2Client.getAssetByID(10).do();
            break;
          case 'PendingTransactionInformation':
            this.actualMockResponse = await this.v2Client
              .pendingTransactionInformation('transaction')
              .do();
            break;
          case 'GetPendingTransactions':
            this.actualMockResponse = await this.v2Client
              .pendingTransactionsInformation()
              .do();
            break;
          case 'GetPendingTransactionsByAddress':
            this.actualMockResponse = await this.v2Client
              .pendingTransactionByAddress(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'DryRun':
            this.actualMockResponse = await this.v2Client
              .dryrun(
                new algosdk.modelsv2.DryrunRequest({
                  accounts: [],
                  apps: [],
                  latestTimestamp: 0,
                  protocolVersion: '',
                  round: 0,
                  sources: [],
                  txns: [],
                })
              )
              .do();
            break;
          case 'GetTransactionProof':
          // fallthrough
          case 'Proof':
            this.actualMockResponse = await this.v2Client
              .getTransactionProof(10, 'asdf')
              .do();
            break;
          case 'GetGenesis':
            this.actualMockResponse = await this.v2Client.genesis().do();
            break;
          case 'AccountApplicationInformation':
            this.actualMockResponse = await this.v2Client
              .accountApplicationInformation(algosdk.Address.zeroAddress(), 10)
              .do();
            break;
          case 'AccountAssetInformation':
            this.actualMockResponse = await this.v2Client
              .accountAssetInformation(algosdk.Address.zeroAddress(), 10)
              .do();
            break;
          case 'GetLightBlockHeaderProof':
            this.actualMockResponse = await this.v2Client
              .getLightBlockHeaderProof(123)
              .do();
            break;
          case 'GetStateProof':
            this.actualMockResponse = await this.v2Client
              .getStateProof(123)
              .do();
            break;
          case 'GetBlockHash':
            this.actualMockResponse = await this.v2Client
              .getBlockHash(123)
              .do();
            break;
          case 'GetSyncRound':
            this.actualMockResponse = await this.v2Client.getSyncRound().do();
            break;
          case 'GetBlockTimeStampOffset':
            this.actualMockResponse = await this.v2Client
              .getBlockOffsetTimestamp()
              .do();
            break;
          case 'GetLedgerStateDelta':
            this.actualMockResponse = await this.v2Client
              .getLedgerStateDelta(123)
              .do();
            break;
          case 'GetTransactionGroupLedgerStateDeltaForRound':
            this.actualMockResponse = await this.v2Client
              .getTransactionGroupLedgerStateDeltasForRound(123)
              .do();
            break;
          case 'GetLedgerStateDeltaForTransactionGroup':
            this.actualMockResponse = await this.v2Client
              .getLedgerStateDeltaForTransactionGroup('someID')
              .do();
            break;
          case 'GetBlockTxids':
            this.actualMockResponse = await this.v2Client
              .getBlockTxids(123)
              .do();
            break;
          case 'any': {
            // This is an error case
            let caughtError = false;
            try {
              await this.v2Client.status().do();
            } catch (err) {
              assert.strictEqual(this.expectedMockResponseCode, 500);
              assert.ok(
                err.toString().includes('Received status 500'),
                `expected response code 500 implies error Internal Server Error but instead had error: ${err}`
              );

              assert.ok(err.response.body);
              this.actualMockResponse = err.response.parseBodyAsJSON({
                intDecoding: algosdk.IntDecoding.MIXED,
              });
              caughtError = true;
            }
            if (!caughtError) {
              throw new Error('Expected error response, got none.');
            }
            break;
          }
          default:
            throw new Error(`Unrecognized algod endpoint: ${endpoint}`);
        }
      } else if (client === 'indexer') {
        switch (endpoint) {
          case 'lookupAccountByID':
            this.actualMockResponse = await this.indexerClient
              .lookupAccountByID(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'searchForAccounts':
            this.actualMockResponse = await this.indexerClient
              .searchAccounts()
              .do();
            break;
          case 'lookupApplicationByID':
            this.actualMockResponse = await this.indexerClient
              .lookupApplications(10)
              .do();
            break;
          case 'searchForApplications':
            this.actualMockResponse = await this.indexerClient
              .searchForApplications()
              .do();
            break;
          case 'lookupAssetBalances':
            this.actualMockResponse = await this.indexerClient
              .lookupAssetBalances(10)
              .do();
            break;
          case 'lookupAssetByID':
            this.actualMockResponse = await this.indexerClient
              .lookupAssetByID(10)
              .do();
            break;
          case 'searchForAssets':
            this.actualMockResponse = await this.indexerClient
              .searchForAssets()
              .do();
            break;
          case 'lookupAccountTransactions':
            this.actualMockResponse = await this.indexerClient
              .lookupAccountTransactions(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'lookupAssetTransactions':
            this.actualMockResponse = await this.indexerClient
              .lookupAssetTransactions(10)
              .do();
            break;
          case 'searchForTransactions':
            this.actualMockResponse = await this.indexerClient
              .searchForTransactions()
              .do();
            break;
          case 'lookupBlock':
            this.actualMockResponse = await this.indexerClient
              .lookupBlock(10)
              .do();
            break;
          case 'lookupTransaction':
            this.actualMockResponse = await this.indexerClient
              .lookupTransactionByID('')
              .do();
            break;
          case 'lookupAccountAppLocalStates':
            this.actualMockResponse = await this.indexerClient
              .lookupAccountAppLocalStates(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'lookupAccountCreatedApplications':
            this.actualMockResponse = await this.indexerClient
              .lookupAccountCreatedApplications(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'lookupAccountAssets':
            this.actualMockResponse = await this.indexerClient
              .lookupAccountAssets(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'lookupAccountCreatedAssets':
            this.actualMockResponse = await this.indexerClient
              .lookupAccountCreatedAssets(algosdk.Address.zeroAddress())
              .do();
            break;
          case 'lookupApplicationLogsByID':
            this.actualMockResponse = await this.indexerClient
              .lookupApplicationLogs(10)
              .do();
            break;
          case 'any': {
            // This is an error case
            let caughtError = false;
            try {
              await this.indexerClient.searchAccounts().do();
            } catch (err) {
              assert.strictEqual(this.expectedMockResponseCode, 500);
              assert.ok(
                err.toString().includes('Received status 500'),
                `expected response code 500 implies error Internal Server Error but instead had error: ${err}`
              );

              assert.ok(err.response.body);
              this.actualMockResponse = err.response.parseBodyAsJSON({
                intDecoding: algosdk.IntDecoding.MIXED,
              });
              caughtError = true;
            }
            if (!caughtError) {
              throw new Error('Expected error response, got none.');
            }
            break;
          }
          default:
            throw new Error(`Unrecognized indexer endpoint: ${endpoint}`);
        }
      } else {
        throw Error(`did not recognize desired client "${client}"`);
      }
    }
  );

  function pruneDefaultValuesFromObject(object) {
    if (
      typeof object !== 'object' ||
      object === null ||
      Array.isArray(object)
    ) {
      throw new Error('pruneDefaultValuesFromObject expects an object.');
    }
    const prunedObject = makeObject(object);
    for (const [key, value] of Object.entries(prunedObject)) {
      if (
        value === undefined ||
        value === null ||
        value === 0 ||
        value === BigInt(0) ||
        value === '' ||
        value === false ||
        (Array.isArray(value) && value.length === 0) ||
        (typeof value === 'object' && Object.keys(value).length === 0)
      ) {
        delete prunedObject[key];
        continue;
      }
      if (Array.isArray(value)) {
        prunedObject[key] = value.map((element) =>
          typeof element === 'object' &&
          !Array.isArray(element) &&
          element !== null
            ? pruneDefaultValuesFromObject(element)
            : element
        );
        continue;
      }
      if (typeof value === 'object') {
        prunedObject[key] = pruneDefaultValuesFromObject(value);
        if (Object.keys(prunedObject[key]).length === 0) {
          delete prunedObject[key];
        }
      }
    }
    return prunedObject;
  }

  function pruneDefaultValuesFromMap(m) {
    function isMap(x) {
      // workaround for firefox
      const other = makeMap([]);
      return x instanceof other.constructor;
    }

    function isUint8Array(x) {
      // workaround for firefox
      const other = makeUint8Array();
      return x instanceof other.constructor;
    }

    if (!isMap(m)) {
      throw new Error('pruneDefaultValuesFromMap expects a map.');
    }
    const prunedMap = makeMap(m);
    for (const [key, value] of Array.from(prunedMap.entries())) {
      if (
        value === undefined ||
        value === null ||
        value === 0 ||
        value === BigInt(0) ||
        value === '' ||
        value === false ||
        (Array.isArray(value) && value.length === 0) ||
        (isMap(value) && value.size === 0) ||
        (isUint8Array(value) &&
          (value.byteLength === 0 || value.every((byte) => byte === 0)))
      ) {
        prunedMap.delete(key);
        continue;
      }
      if (Array.isArray(value)) {
        prunedMap.set(
          key,
          value.map((element) =>
            isMap(element) ? pruneDefaultValuesFromMap(element) : element
          )
        );
        continue;
      }
      if (isMap(value)) {
        const prunedValue = pruneDefaultValuesFromMap(value);
        if (prunedValue.size === 0) {
          prunedMap.delete(key);
        } else {
          prunedMap.set(key, prunedValue);
        }
      }
    }
    return prunedMap;
  }

  Then('the parsed response should equal the mock response.', function () {
    let expectedJsonNeedsPruning = true;

    let encodedResponseObject;
    if (this.expectedMockResponseCode === 200) {
      if (responseFormat === 'json') {
        if (typeof this.actualMockResponse.toEncodingData === 'function') {
          encodedResponseObject = algosdk.encodeJSON(this.actualMockResponse);
        } else {
          // Handles responses which don't implement Encodable
          encodedResponseObject = algosdk.stringifyJSON(
            this.actualMockResponse
          );
          expectedJsonNeedsPruning = false;
        }
      } else {
        encodedResponseObject = algosdk.encodeMsgpack(this.actualMockResponse);
      }
    } else {
      encodedResponseObject = algosdk.stringifyJSON(this.actualMockResponse);
    }

    // We chain encoding/decoding below to normalize the objects for comparison. This helps deal
    // with type differences such as bigint vs number and Uint8Array vs Buffer.

    let actualResponseObject;
    let parsedExpectedMockResponse;
    if (responseFormat === 'json') {
      actualResponseObject = algosdk.parseJSON(encodedResponseObject, {
        intDecoding: algosdk.IntDecoding.MIXED,
      });
      parsedExpectedMockResponse = algosdk.parseJSON(expectedMockResponse, {
        intDecoding: algosdk.IntDecoding.MIXED,
      });
      if (expectedJsonNeedsPruning) {
        // Prune default values from the actual response object to match the expected response object.
        parsedExpectedMockResponse = pruneDefaultValuesFromObject(
          parsedExpectedMockResponse
        );
      }
    } else {
      actualResponseObject = algosdk.msgpackRawDecodeAsMap(
        encodedResponseObject
      );
      parsedExpectedMockResponse =
        algosdk.msgpackRawDecodeAsMap(expectedMockResponse);

      parsedExpectedMockResponse = pruneDefaultValuesFromMap(
        parsedExpectedMockResponse
      );
    }

    assert.deepStrictEqual(actualResponseObject, parsedExpectedMockResponse);
  });

  Then('expect error string to contain {string}', (expectedErrorString) => {
    if (expectedErrorString === 'nil') {
      assert.strictEqual('', globalErrForExamination);
      return;
    }
    assert.strictEqual(expectedErrorString, globalErrForExamination);
  });

  Given('mock server recording request paths', function () {
    doRaw = true;
    this.v2Client = new algosdk.Algodv2(
      '',
      `http://${mockAlgodPathRecorderHost}`,
      mockAlgodPathRecorderPort,
      {}
    );
    this.indexerClient = new algosdk.Indexer(
      '',
      `http://${mockIndexerPathRecorderHost}`,
      mockIndexerPathRecorderPort,
      {}
    );
  });

  Given('expected headers', (tableRows) => {
    this.expectedHeaders = tableRows;
  });

  Then(
    'expect the observed header keys to equal the expected header keys',
    (algodSeenRequests, indexerSeenRequests) => {
      let actualRequests;
      if (algodSeenRequests.length !== 0) {
        [actualRequests] = algodSeenRequests;
      } else if (indexerSeenRequests.length !== 0) {
        [actualRequests] = indexerSeenRequests;
      } else {
        throw new Error('no requests observed.');
      }
      const actualHeaders = Object.keys(actualRequests.headers).sort();
      const expectedHeaders = this.expectedHeaders.sort();
      assert.strictEqual(
        actualHeaders.length,
        expectedHeaders.length,
        `expected headers ${expectedHeaders}, got ${actualHeaders}`
      );
      for (let i = 0; i < actualHeaders.length; i++) {
        assert.deepStrictEqual(actualHeaders[i], expectedHeaders[i]);
      }
    }
  );

  Then(
    'expect the path used to be {string}',
    (algodSeenRequests, indexerSeenRequests, expectedRequestPath) => {
      let actualRequest;
      if (algodSeenRequests.length !== 0) {
        [actualRequest] = algodSeenRequests;
      } else if (indexerSeenRequests.length !== 0) {
        [actualRequest] = indexerSeenRequests;
      }
      assert.strictEqual(actualRequest.url, expectedRequestPath);
    }
  );

  Then(
    'expect the request to be {string} {string}',
    (
      algodSeenRequests,
      indexerSeenRequests,
      expectedRequestType,
      expectedRequestPath
    ) => {
      let actualRequest;
      if (algodSeenRequests.length !== 0) {
        [actualRequest] = algodSeenRequests;
      } else if (indexerSeenRequests.length !== 0) {
        [actualRequest] = indexerSeenRequests;
      }
      assert.strictEqual(
        actualRequest.method.toLowerCase(),
        expectedRequestType.toLowerCase()
      );
      assert.strictEqual(actualRequest.url, expectedRequestPath);
    }
  );

  Then(
    'we expect the path used to be {string}',
    (algodSeenRequests, indexerSeenRequests, expectedRequestPath) => {
      let actualRequestPath;
      if (algodSeenRequests.length !== 0) {
        actualRequestPath = algodSeenRequests[0].url;
      } else if (indexerSeenRequests.length !== 0) {
        actualRequestPath = indexerSeenRequests[0].url;
      }
      assert.strictEqual(expectedRequestPath, actualRequestPath);
    }
  );

  When(
    'we make a Pending Transaction Information against txid {string} with format {string}',
    async function (txid, format) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }
      await doOrDoRaw(this.v2Client.pendingTransactionInformation(txid));
    }
  );

  When(
    'we make a Pending Transaction Information with max {int} and format {string}',
    async function (max, format) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }
      await doOrDoRaw(this.v2Client.pendingTransactionsInformation().max(max));
    }
  );

  When(
    'we make a Pending Transactions By Address call against account {string} and max {int}',
    async function (account, max) {
      await doOrDoRaw(
        this.v2Client.pendingTransactionByAddress(account).max(max)
      );
    }
  );

  When(
    'we make a Pending Transactions By Address call against account {string} and max {int} and format {string}',
    async function (account, max, format) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }
      await doOrDoRaw(
        this.v2Client.pendingTransactionByAddress(account).max(max)
      );
    }
  );

  When(
    'we make a Status after Block call with round {int}',
    async function (round) {
      await doOrDoRaw(this.v2Client.statusAfterBlock(round));
    }
  );

  When(
    'we make an Account Information call against account {string} with exclude {string}',
    async function (account, exclude) {
      await doOrDoRaw(
        this.v2Client.accountInformation(account).exclude(exclude)
      );
    }
  );

  When(
    'we make an Account Information call against account {string}',
    async function (account) {
      await doOrDoRaw(this.v2Client.accountInformation(account));
    }
  );

  When(
    'we make an Account Asset Information call against account {string} assetID {int}',
    async function (account, assetID) {
      await doOrDoRaw(this.v2Client.accountAssetInformation(account, assetID));
    }
  );

  When(
    'we make an Account Application Information call against account {string} applicationID {int}',
    async function (account, applicationID) {
      await doOrDoRaw(
        this.v2Client.accountApplicationInformation(account, applicationID)
      );
    }
  );

  When(
    'we make a Get Block call against block number {int}',
    async function (blockNum) {
      await doOrDoRaw(this.v2Client.block(blockNum));
    }
  );

  When(
    'we make a Get Block call against block number {int} with format {string}',
    async function (blockNum, format) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }
      await doOrDoRaw(this.v2Client.block(blockNum));
    }
  );

  When(
    'we make a Get Block call for round {int} with format {string} and header-only {string}',
    async function (round, format, headerOnly) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }

      const builder = this.v2Client.block(round);
      const hob = headerOnly.toLowerCase() === 'true';

      if (hob) {
        builder.headerOnly(hob);
      }
      await doOrDoRaw(builder);
    }
  );

  When('we make a GetAssetByID call for assetID {int}', async function (index) {
    await doOrDoRaw(this.v2Client.getAssetByID(index));
  });

  When(
    'we make a GetApplicationByID call for applicationID {int}',
    async function (index) {
      await doOrDoRaw(this.v2Client.getApplicationByID(index));
    }
  );

  When(
    'we make a GetApplicationBoxByName call for applicationID {int} with encoded box name {string}',
    async function (index, boxName) {
      const box = splitAndProcessAppArgs(boxName)[0];
      await this.v2Client.getApplicationBoxByName(index, box).doRaw();
    }
  );

  When(
    'we make a GetApplicationBoxes call for applicationID {int} with max {int}',
    async function (index, limit) {
      await this.v2Client.getApplicationBoxes(index).max(limit).doRaw();
    }
  );

  let anyPendingTransactionInfoResponse;

  When('we make any Pending Transaction Information call', async function () {
    anyPendingTransactionInfoResponse = await doOrDoRaw(
      this.v2Client.pendingTransactionInformation()
    );
  });

  Then(
    'the parsed Pending Transaction Information response should have sender {string}',
    (sender) => {
      const actualSender =
        anyPendingTransactionInfoResponse.txn.txn.sender.toString();
      assert.strictEqual(actualSender, sender);
    }
  );

  let anyPendingTransactionsInfoResponse;

  When('we make any Pending Transactions Information call', async function () {
    anyPendingTransactionsInfoResponse = await doOrDoRaw(
      this.v2Client.pendingTransactionsInformation()
    );
  });

  Then(
    'the parsed Pending Transactions Information response should contain an array of len {int} and element number {int} should have sender {string}',
    (len, idx, sender) => {
      assert.strictEqual(
        len,
        anyPendingTransactionsInfoResponse.topTransactions.length
      );
      if (len !== 0) {
        assert.strictEqual(
          anyPendingTransactionsInfoResponse.topTransactions[
            idx
          ].txn.sender.toString(),
          sender
        );
      }
    }
  );

  let anySendRawTransactionResponse;

  When('we make any Send Raw Transaction call', async function () {
    anySendRawTransactionResponse = await doOrDoRaw(
      this.v2Client.sendRawTransaction(makeUint8Array(0))
    );
  });

  Then(
    'the parsed Send Raw Transaction response should have txid {string}',
    (txid) => {
      assert.strictEqual(txid, anySendRawTransactionResponse.txid);
    }
  );

  let anyPendingTransactionsByAddressResponse;

  When('we make any Pending Transactions By Address call', async function () {
    anyPendingTransactionsByAddressResponse = await doOrDoRaw(
      this.v2Client.pendingTransactionByAddress(
        'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
      )
    );
  });

  Then(
    'the parsed Pending Transactions By Address response should contain an array of len {int} and element number {int} should have sender {string}',
    (len, idx, sender) => {
      assert.strictEqual(
        len,
        anyPendingTransactionsByAddressResponse.totalTransactions
      );
      if (len === 0) {
        return;
      }
      const actualSender =
        anyPendingTransactionsByAddressResponse.topTransactions[
          idx
        ].txn.sender.toString();
      assert.strictEqual(sender, actualSender);
    }
  );

  let anyNodeStatusResponse;

  When('we make any Node Status call', async function () {
    anyNodeStatusResponse = await doOrDoRaw(this.v2Client.status());
  });

  Then(
    'the parsed Node Status response should have a last round of {int}',
    (lastRound) => {
      assert.strictEqual(BigInt(lastRound), anyNodeStatusResponse.lastRound);
    }
  );

  let anyLedgerSupplyResponse;

  When('we make any Ledger Supply call', async function () {
    anyLedgerSupplyResponse = await doOrDoRaw(this.v2Client.supply());
  });

  Then(
    'the parsed Ledger Supply response should have totalMoney {int} onlineMoney {int} on round {int}',
    (totalMoney, onlineMoney, round) => {
      assert.strictEqual(
        BigInt(totalMoney),
        anyLedgerSupplyResponse.totalMoney
      );
      assert.strictEqual(
        BigInt(onlineMoney),
        anyLedgerSupplyResponse.onlineMoney
      );
      assert.strictEqual(BigInt(round), anyLedgerSupplyResponse.currentRound);
    }
  );

  When('we make any Status After Block call', async function () {
    anyNodeStatusResponse = await doOrDoRaw(this.v2Client.statusAfterBlock(1));
  });

  Then(
    'the parsed Status After Block response should have a last round of {int}',
    (lastRound) => {
      assert.strictEqual(BigInt(lastRound), anyNodeStatusResponse.lastRound);
    }
  );

  let anyAccountInformationResponse;

  When('we make any Account Information call', async function () {
    anyAccountInformationResponse = await doOrDoRaw(
      this.v2Client.accountInformation(
        'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
      )
    );
  });

  Then(
    'the parsed Account Information response should have address {string}',
    (address) => {
      assert.strictEqual(address, anyAccountInformationResponse.address);
    }
  );

  let anyBlockResponse;

  When('we make any Get Block call', async function () {
    const req = this.v2Client.block(1);
    if (responseFormat === 'json') {
      // for json responses, we need to set the format query param and provide a custom decoder
      // because the default block request only supports msgpack
      req.query.format = responseFormat;
      req.prepare = (response) => {
        const body = new TextDecoder().decode(response.body);
        return algosdk.decodeJSON(body, algosdk.modelsv2.BlockResponse);
      };
    }
    anyBlockResponse = await doOrDoRaw(req);
  });

  Then(
    'the parsed Get Block response should have rewards pool {string}',
    (rewardsPoolAddress) => {
      assert.ok(
        anyBlockResponse.block.header.rewardState.rewardsPool instanceof
          algosdk.Address
      );
      const rewardsPoolB64String = algosdk.bytesToBase64(
        anyBlockResponse.block.header.rewardState.rewardsPool.publicKey
      );
      assert.strictEqual(rewardsPoolAddress, rewardsPoolB64String);
    }
  );

  Then(
    'the parsed Get Block response should have rewards pool {string} and no certificate or payset',
    (rewardsPoolAddress) => {
      assert.ok(
        anyBlockResponse.block.header.rewardState.rewardsPool instanceof
          algosdk.Address
      );
      const rewardsPoolB64String = algosdk.bytesToBase64(
        anyBlockResponse.block.header.rewardState.rewardsPool.publicKey
      );
      assert.strictEqual(rewardsPoolAddress, rewardsPoolB64String);

      assert.strictEqual(
        anyBlockResponse.cert,
        undefined,
        'Cert should be undefined'
      );
      assert.strictEqual(
        anyBlockResponse.block.payset.length,
        0,
        'Payset should be empty'
      );
    }
  );

  Then(
    'the parsed Get Block response should have heartbeat address {string}',
    (hbAddress) => {
      assert.ok(
        anyBlockResponse.block.payset[0].signedTxn.signedTxn.txn.heartbeat
          .address instanceof algosdk.Address
      );
      const hbAddressString =
        anyBlockResponse.block.payset[0].signedTxn.signedTxn.txn.heartbeat.address.toString();
      assert.strictEqual(hbAddress, hbAddressString);
    }
  );

  let anySuggestedTransactionsResponse;

  When('we make any Suggested Transaction Parameters call', async function () {
    anySuggestedTransactionsResponse = await doOrDoRaw(
      this.v2Client.getTransactionParams()
    );
  });

  Then(
    'the parsed Suggested Transaction Parameters response should have first round valid of {int}',
    (firstValid) => {
      assert.strictEqual(
        BigInt(firstValid),
        anySuggestedTransactionsResponse.firstValid
      );
    }
  );

  When(
    'we make a Lookup Asset Balances call against asset index {int} with limit {int} afterAddress {string} currencyGreaterThan {int} currencyLessThan {int}',
    async function (
      index,
      limit,
      afterAddress,
      currencyGreater,
      currencyLesser
    ) {
      await doOrDoRaw(
        this.indexerClient
          .lookupAssetBalances(index)
          .currencyGreaterThan(currencyGreater)
          .currencyLessThan(currencyLesser)
          .limit(limit)
      );
    }
  );

  When(
    'we make a Lookup Asset Transactions call against asset index {int} with NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {string} afterTime {string} currencyGreaterThan {int} currencyLessThan {int} address {string} addressRole {string} ExcluseCloseTo {string}',
    async function (
      assetIndex,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      limit,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      address,
      addressRole,
      excludeCloseToAsString
    ) {
      let excludeCloseTo = false;
      if (excludeCloseToAsString === 'true') {
        excludeCloseTo = true;
      }
      await doOrDoRaw(
        this.indexerClient
          .lookupAssetTransactions(assetIndex)
          .beforeTime(beforeTime)
          .afterTime(afterTime)
          .address(address)
          .addressRole(addressRole)
          .currencyGreaterThan(currencyGreater)
          .currencyLessThan(currencyLesser)
          .limit(limit)
          .minRound(minRound)
          .maxRound(maxRound)
          .notePrefix(notePrefix)
          .round(round)
          .sigType(sigType)
          .txid(txid)
          .txType(txType)
          .excludeCloseTo(excludeCloseTo)
      );
    }
  );

  When(
    'we make a Lookup Asset Transactions call against asset index {int} with NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {string} afterTime {string} currencyGreaterThan {int} currencyLessThan {int} address {string} addressRole {string} ExcluseCloseTo {string} RekeyTo {string}',
    async function (
      assetIndex,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      limit,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      address,
      addressRole,
      excludeCloseToAsString,
      rekeyToAsString
    ) {
      let excludeCloseTo = false;
      if (excludeCloseToAsString === 'true') {
        excludeCloseTo = true;
      }
      let rekeyTo = false;
      if (rekeyToAsString === 'true') {
        rekeyTo = true;
      }
      await this.indexerClient
        .lookupAssetTransactions(assetIndex)
        .minRound(minRound)
        .maxRound(maxRound)
        .limit(limit)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .address(address)
        .addressRole(addressRole)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .excludeCloseTo(excludeCloseTo)
        .notePrefix(notePrefix)
        .rekeyTo(rekeyTo)
        .round(round)
        .sigType(sigType)
        .txid(txid)
        .txType(txType)
        .do();
    }
  );

  When(
    'we make a Lookup Account Transactions call against account {string} with NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {string} afterTime {string} currencyGreaterThan {int} currencyLessThan {int} assetIndex {int}',
    async function (
      account,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      limit,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      assetIndex
    ) {
      await doOrDoRaw(
        this.indexerClient
          .lookupAccountTransactions(account)
          .beforeTime(beforeTime)
          .afterTime(afterTime)
          .assetID(assetIndex)
          .currencyGreaterThan(currencyGreater)
          .currencyLessThan(currencyLesser)
          .limit(limit)
          .maxRound(maxRound)
          .minRound(minRound)
          .notePrefix(notePrefix)
          .round(round)
          .sigType(sigType)
          .txid(txid)
          .txType(txType)
      );
    }
  );

  When(
    'we make a Lookup Account Transactions call against account {string} with NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {string} afterTime {string} currencyGreaterThan {int} currencyLessThan {int} assetIndex {int} rekeyTo {string}',
    async function (
      account,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      limit,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      assetIndex,
      rekeyToAsString
    ) {
      let rekeyTo = false;
      if (rekeyToAsString === 'true') {
        rekeyTo = true;
      }
      await this.indexerClient
        .lookupAccountTransactions(account)
        .notePrefix(notePrefix)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .minRound(minRound)
        .maxRound(maxRound)
        .assetID(assetIndex)
        .rekeyTo(rekeyTo)
        .round(round)
        .sigType(sigType)
        .txid(txid)
        .txType(txType)

        .do();
    }
  );

  When(
    'we make a Lookup Block call against round {int}',
    async function (round) {
      await doOrDoRaw(this.indexerClient.lookupBlock(round));
    }
  );

  When(
    'we make a Lookup Block call against round {int} and header {string}',
    async function (int, string) {
      await doOrDoRaw(this.indexerClient.lookupBlock(int).headerOnly(string));
    }
  );

  When(
    'we make a Lookup Account by ID call against account {string} with round {int}',
    async function (account, round) {
      await doOrDoRaw(
        this.indexerClient.lookupAccountByID(account).round(round)
      );
    }
  );

  When(
    'we make a Lookup Account by ID call against account {string} with exclude {string}',
    async function (account, exclude) {
      await doOrDoRaw(
        this.indexerClient.lookupAccountByID(account).exclude(exclude)
      );
    }
  );

  When(
    'we make a Lookup Asset by ID call against asset index {int}',
    async function (assetIndex) {
      await doOrDoRaw(this.indexerClient.lookupAssetByID(assetIndex));
    }
  );

  When(
    'we make a SearchForApplicationBoxes call with applicationID {int} with max {int} nextToken {string}',
    async function (index, limit, token) {
      await this.indexerClient
        .searchForApplicationBoxes(index)
        .limit(limit)
        .nextToken(token)
        .doRaw();
    }
  );

  When(
    'we make a LookupApplicationBoxByIDandName call with applicationID {int} with encoded box name {string}',
    async function (index, name) {
      const boxKey = splitAndProcessAppArgs(name)[0];
      await this.indexerClient
        .lookupApplicationBoxByIDandName(index, boxKey)
        .doRaw();
    }
  );

  When(
    'we make a LookupApplicationLogsByID call with applicationID {int} limit {int} minRound {int} maxRound {int} nextToken {string} sender {string} and txID {string}',
    async function (appID, limit, minRound, maxRound, nextToken, sender, txID) {
      await doOrDoRaw(
        this.indexerClient
          .lookupApplicationLogs(appID)
          .limit(limit)
          .maxRound(maxRound)
          .minRound(minRound)
          .nextToken(nextToken)
          .sender(sender)
          .txid(txID)
      );
    }
  );

  When(
    'we make a Search Accounts call with assetID {int} limit {int} currencyGreaterThan {int} currencyLessThan {int} and round {int}',
    async function (assetIndex, limit, currencyGreater, currencyLesser, round) {
      await doOrDoRaw(
        this.indexerClient
          .searchAccounts()
          .assetID(assetIndex)
          .currencyGreaterThan(currencyGreater)
          .currencyLessThan(currencyLesser)
          .limit(limit)
          .round(round)
      );
    }
  );

  When(
    'we make a Search Accounts call with assetID {int} limit {int} currencyGreaterThan {int} currencyLessThan {int} round {int} and authenticating address {string}',
    async function (
      assetIndex,
      limit,
      currencyGreater,
      currencyLesser,
      round,
      authAddress
    ) {
      await this.indexerClient
        .searchAccounts()
        .assetID(assetIndex)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .round(round)
        .authAddr(authAddress)
        .do();
    }
  );

  When(
    'we make a Search Accounts call with exclude {string}',
    async function (exclude) {
      await doOrDoRaw(this.indexerClient.searchAccounts().exclude(exclude));
    }
  );

  When(
    'we make a SearchForApplications call with creator {string}',
    async function (creator) {
      await doOrDoRaw(
        this.indexerClient.searchForApplications().creator(creator)
      );
    }
  );

  When(
    'we make a Search For Transactions call with account {string} NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {string} afterTime {string} currencyGreaterThan {int} currencyLessThan {int} assetIndex {int} addressRole {string} ExcluseCloseTo {string}',
    async function (
      account,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      limit,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      assetIndex,
      addressRole,
      excludeCloseToAsString
    ) {
      let excludeCloseTo = false;
      if (excludeCloseToAsString === 'true') {
        excludeCloseTo = true;
      }
      await doOrDoRaw(
        this.indexerClient
          .searchForTransactions()
          .address(account)
          .addressRole(addressRole)
          .assetID(assetIndex)
          .beforeTime(beforeTime)
          .afterTime(afterTime)
          .currencyGreaterThan(currencyGreater)
          .currencyLessThan(currencyLesser)
          .limit(limit)
          .maxRound(maxRound)
          .minRound(minRound)
          .notePrefix(notePrefix)
          .round(round)
          .sigType(sigType)
          .txid(txid)
          .txType(txType)
          .excludeCloseTo(excludeCloseTo)
      );
    }
  );

  When(
    'we make a Search For BlockHeaders call with minRound {int} maxRound {int} limit {int} nextToken {string} beforeTime {string} afterTime {string} proposers {string} expired {string} absent {string}',
    async function (
      minRound,
      maxRound,
      limit,
      nextToken,
      beforeTime,
      afterTime,
      proposers,
      expired,
      absent
    ) {
      const builder = this.indexerClient
        .searchForBlockHeaders()
        .afterTime(afterTime)
        .beforeTime(beforeTime)
        .limit(limit)
        .maxRound(maxRound)
        .minRound(minRound)
        .nextToken(nextToken);

      if (proposers !== null && proposers.trim().length > 0) {
        const proposersArray = proposers.split(',');
        builder.proposers(proposersArray);
      }

      if (expired !== null && expired.trim().length > 0) {
        const expiredArray = expired.split(',');
        builder.expired(expiredArray);
      }

      if (absent !== null && absent.trim().length > 0) {
        const absentArray = absent.split(',');
        builder.absent(absentArray);
      }

      await doOrDoRaw(builder);
    }
  );

  When(
    'we make a Search For Transactions call with account {string} NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {string} afterTime {string} currencyGreaterThan {int} currencyLessThan {int} assetIndex {int} addressRole {string} ExcluseCloseTo {string} rekeyTo {string}',
    async function (
      account,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      limit,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      assetIndex,
      addressRole,
      excludeCloseToAsString,
      rekeyToAsString
    ) {
      let excludeCloseTo = false;
      if (excludeCloseToAsString === 'true') {
        excludeCloseTo = true;
      }
      let rekeyTo = false;
      if (rekeyToAsString === 'true') {
        rekeyTo = true;
      }
      await this.indexerClient
        .searchForTransactions()
        .address(account)
        .assetID(assetIndex)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .addressRole(addressRole)
        .excludeCloseTo(excludeCloseTo)
        .limit(limit)
        .maxRound(maxRound)
        .minRound(minRound)
        .notePrefix(notePrefix)
        .rekeyTo(rekeyTo)
        .round(round)
        .sigType(sigType)
        .txid(txid)
        .txType(txType)
        .do();
    }
  );

  When(
    'we make a SearchForAssets call with limit {int} creator {string} name {string} unit {string} index {int}',
    async function (limit, creator, name, unit, index) {
      await doOrDoRaw(
        this.indexerClient
          .searchForAssets()
          .limit(limit)
          .creator(creator)
          .name(name)
          .unit(unit)
          .index(index)
      );
    }
  );

  When(
    'we make a SearchForApplications call with applicationID {int}',
    async function (index) {
      await doOrDoRaw(this.indexerClient.searchForApplications().index(index));
    }
  );

  When(
    'we make a LookupApplications call with applicationID {int}',
    async function (index) {
      await doOrDoRaw(this.indexerClient.lookupApplications(index));
    }
  );

  let anyLookupAssetBalancesResponse;

  When('we make any LookupAssetBalances call', async function () {
    anyLookupAssetBalancesResponse = await this.indexerClient
      .lookupAssetBalances(1)
      .do();
  });

  Then(
    'the parsed LookupAssetBalances response should be valid on round {int}, and contain an array of len {int} and element number {int} should have address {string} amount {int} and frozen state {string}',
    (round, length, idx, address, amount, frozenStateAsString) => {
      assert.strictEqual(
        anyLookupAssetBalancesResponse.currentRound,
        BigInt(round)
      );
      assert.strictEqual(
        anyLookupAssetBalancesResponse.balances.length,
        length
      );
      if (length === 0) {
        return;
      }
      let frozenState = false;
      if (frozenStateAsString === 'true') {
        frozenState = true;
      }
      assert.strictEqual(
        anyLookupAssetBalancesResponse.balances[idx].amount,
        BigInt(amount)
      );
      assert.strictEqual(
        anyLookupAssetBalancesResponse.balances[idx].isFrozen,
        frozenState
      );
    }
  );

  When(
    'we make a LookupAccountAssets call with accountID {string} assetID {int} includeAll {string} limit {int} next {string}',
    async function (account, assetID, includeAll, limit, next) {
      await doOrDoRaw(
        this.indexerClient
          .lookupAccountAssets(account)
          .assetId(assetID)
          .includeAll(includeAll === 'true')
          .limit(limit)
          .nextToken(next)
      );
    }
  );

  When(
    'we make a LookupAccountCreatedAssets call with accountID {string} assetID {int} includeAll {string} limit {int} next {string}',
    async function (account, assetID, includeAll, limit, next) {
      await doOrDoRaw(
        this.indexerClient
          .lookupAccountCreatedAssets(account)
          .assetID(assetID)
          .includeAll(includeAll === 'true')
          .limit(limit)
          .nextToken(next)
      );
    }
  );

  When(
    'we make a LookupAccountAppLocalStates call with accountID {string} applicationID {int} includeAll {string} limit {int} next {string}',
    async function (account, applicationID, includeAll, limit, next) {
      await doOrDoRaw(
        this.indexerClient
          .lookupAccountAppLocalStates(account)
          .applicationID(applicationID)
          .includeAll(includeAll === 'true')
          .limit(limit)
          .nextToken(next)
      );
    }
  );

  When(
    'we make a LookupAccountCreatedApplications call with accountID {string} applicationID {int} includeAll {string} limit {int} next {string}',
    async function (account, applicationID, includeAll, limit, next) {
      await doOrDoRaw(
        this.indexerClient
          .lookupAccountCreatedApplications(account)
          .applicationID(applicationID)
          .includeAll(includeAll === 'true')
          .limit(limit)
          .nextToken(next)
      );
    }
  );

  let anyLookupAssetTransactionsResponse;

  When('we make any LookupAssetTransactions call', async function () {
    anyLookupAssetTransactionsResponse = await this.indexerClient
      .lookupAssetTransactions(1)
      .do();
  });

  Then(
    'the parsed LookupAssetTransactions response should be valid on round {int}, and contain an array of len {int} and element number {int} should have sender {string}',
    (round, length, idx, sender) => {
      assert.strictEqual(
        anyLookupAssetTransactionsResponse.currentRound,
        BigInt(round)
      );
      assert.strictEqual(
        anyLookupAssetTransactionsResponse.transactions.length,
        length
      );
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        anyLookupAssetTransactionsResponse.transactions[idx].sender,
        sender
      );
    }
  );

  let anyLookupAccountTransactionsResponse;

  When('we make any LookupAccountTransactions call', async function () {
    anyLookupAccountTransactionsResponse = await this.indexerClient
      .lookupAccountTransactions(
        'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
      )
      .do();
  });

  Then(
    'the parsed LookupAccountTransactions response should be valid on round {int}, and contain an array of len {int} and element number {int} should have sender {string}',
    (round, length, idx, sender) => {
      assert.strictEqual(
        anyLookupAccountTransactionsResponse.currentRound,
        BigInt(round)
      );
      assert.strictEqual(
        anyLookupAccountTransactionsResponse.transactions.length,
        length
      );
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        sender,
        anyLookupAccountTransactionsResponse.transactions[idx].sender
      );
    }
  );

  let anyLookupBlockResponse;

  When('we make any LookupBlock call', async function () {
    anyLookupBlockResponse = await this.indexerClient.lookupBlock(1).do();
  });

  Then(
    'the parsed LookupBlock response should have previous block hash {string}',
    (prevHash) => {
      assert.strictEqual(
        algosdk.bytesToBase64(anyLookupBlockResponse.previousBlockHash),
        prevHash
      );
    }
  );

  let anyLookupAccountByIDResponse;

  When('we make any LookupAccountByID call', async function () {
    anyLookupAccountByIDResponse = await this.indexerClient
      .lookupAccountByID(
        'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
      )
      .do();
  });

  Then(
    'the parsed LookupAccountByID response should have address {string}',
    (address) => {
      assert.strictEqual(anyLookupAccountByIDResponse.account.address, address);
    }
  );

  let anyLookupAssetByIDResponse;

  When('we make any LookupAssetByID call', async function () {
    anyLookupAssetByIDResponse = await this.indexerClient
      .lookupAssetByID(1)
      .do();
  });

  Then('the parsed LookupAssetByID response should have index {int}', (idx) => {
    assert.strictEqual(anyLookupAssetByIDResponse.asset.index, BigInt(idx));
  });

  let anySearchAccountsResponse;

  When('we make any SearchAccounts call', async function () {
    anySearchAccountsResponse = await this.indexerClient.searchAccounts().do();
  });

  Then(
    'the parsed SearchAccounts response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have address {string}',
    (round, length, idx, address) => {
      assert.strictEqual(anySearchAccountsResponse.currentRound, BigInt(round));
      assert.strictEqual(anySearchAccountsResponse.accounts.length, length);
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        anySearchAccountsResponse.accounts[idx].address,
        address
      );
    }
  );

  Then(
    'the parsed SearchAccounts response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have authorizing address {string}',
    (round, length, idx, authAddress) => {
      assert.strictEqual(anySearchAccountsResponse.currentRound, BigInt(round));
      assert.strictEqual(anySearchAccountsResponse.accounts.length, length);
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        anySearchAccountsResponse.accounts[idx].authAddr,
        authAddress
      );
    }
  );

  let anySearchForTransactionsResponse;

  When('we make any SearchForTransactions call', async function () {
    anySearchForTransactionsResponse = await this.indexerClient
      .searchForTransactions()
      .do();
  });

  Then(
    'the parsed SearchForTransactions response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have sender {string}',
    (round, length, idx, sender) => {
      assert.strictEqual(
        anySearchForTransactionsResponse.currentRound,
        BigInt(round)
      );
      assert.strictEqual(
        anySearchForTransactionsResponse.transactions.length,
        length
      );
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        anySearchForTransactionsResponse.transactions[idx].sender,
        sender
      );
    }
  );

  Then(
    'the parsed SearchForTransactions response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have rekey-to {string}',
    (round, length, idx, rekeyTo) => {
      assert.strictEqual(
        anySearchForTransactionsResponse.currentRound,
        BigInt(round)
      );
      assert.strictEqual(
        anySearchForTransactionsResponse.transactions.length,
        length
      );
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        anySearchForTransactionsResponse.transactions[idx].rekeyTo,
        rekeyTo
      );
    }
  );

  Then(
    'the parsed SearchForTransactions response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have hbaddress {string}',
    (round, length, idx, hbAddress) => {
      assert.strictEqual(
        anySearchForTransactionsResponse.currentRound,
        BigInt(round)
      );
      assert.strictEqual(
        anySearchForTransactionsResponse.transactions.length,
        length
      );
      assert.strictEqual(
        anySearchForTransactionsResponse.transactions[idx].heartbeatTransaction
          .hbAddress,
        hbAddress
      );
    }
  );

  let anySearchForBlockHeadersResponse;

  When('we make any SearchForBlockHeaders call', async function () {
    anySearchForBlockHeadersResponse = await this.indexerClient
      .searchForBlockHeaders()
      .do();
  });

  Then(
    'the parsed SearchForBlockHeaders response should have a block array of len {int} and the element at index {int} should have round {string}',
    (length, idx, roundStr) => {
      assert.strictEqual(
        anySearchForBlockHeadersResponse.blocks.length,
        length
      );
      assert.strictEqual(
        anySearchForBlockHeadersResponse.blocks[idx].round,
        BigInt(roundStr)
      );
    }
  );

  let anySearchForAssetsResponse;

  When('we make any SearchForAssets call', async function () {
    anySearchForAssetsResponse = await this.indexerClient
      .searchForAssets()
      .do();
  });

  Then(
    'the parsed SearchForAssets response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have asset index {int}',
    (round, length, idx, assetIndex) => {
      assert.strictEqual(
        anySearchForAssetsResponse.currentRound,
        BigInt(round)
      );
      assert.strictEqual(anySearchForAssetsResponse.assets.length, length);
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        anySearchForAssetsResponse.assets[idx].index,
        BigInt(assetIndex)
      );
    }
  );

  /// /////////////////////////////////
  // begin rekey test helpers
  /// /////////////////////////////////

  When('I add a rekeyTo field with address {string}', function (address) {
    this.txn.rekeyTo = algosdk.decodeAddress(address);
  });

  When(
    'I add a rekeyTo field with the private key algorand address',
    function () {
      const keypair = keyPairFromSecretKey(this.sk);
      const pubKeyFromSk = keypair.publicKey;
      this.txn.rekeyTo = algosdk.decodeAddress(
        algosdk.encodeAddress(pubKeyFromSk)
      );
    }
  );

  When('I set the from address to {string}', function (sender) {
    this.txn.sender = algosdk.decodeAddress(sender);
  });

  let dryrunResponse;

  When('we make any Dryrun call', async function () {
    const dr = new algosdk.modelsv2.DryrunRequest({
      accounts: [],
      apps: [],
      latestTimestamp: 7,
      protocolVersion: 'future',
      round: 100,
      sources: [],
      txns: [],
    });
    dryrunResponse = await this.v2Client.dryrun(dr).do();
  });

  Then(
    'the parsed Dryrun Response should have global delta {string} with {int}',
    (key, action) => {
      assert.strictEqual(dryrunResponse.txns[0].globalDelta[0].key, key);
      assert.strictEqual(
        dryrunResponse.txns[0].globalDelta[0].value.action,
        action
      );
    }
  );

  When('I dryrun a {string} program {string}', async function (kind, program) {
    const data = await loadResource(program);
    const sp = await this.v2Client.getTransactionParams().do();
    const algoTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: 'UAPJE355K7BG7RQVMTZOW7QW4ICZJEIC3RZGYG5LSHZ65K6LCNFPJDSR7M',
      receiver: 'UAPJE355K7BG7RQVMTZOW7QW4ICZJEIC3RZGYG5LSHZ65K6LCNFPJDSR7M',
      amount: 1000,
      suggestedParams: sp,
    });
    let txns;
    let sources = [];

    switch (kind) {
      case 'compiled':
        txns = [
          new algosdk.SignedTransaction({
            lsig: new algosdk.LogicSig(data),
            txn: algoTxn,
          }),
        ];
        break;
      case 'source':
        txns = [
          new algosdk.SignedTransaction({
            txn: algoTxn,
          }),
        ];
        sources = [
          new algosdk.modelsv2.DryrunSource({
            fieldName: 'lsig',
            source: new TextDecoder().decode(data),
            txnIndex: 0,
            appIndex: 0,
          }),
        ];
        break;
      default:
        throw Error(`kind ${kind} not in (source, compiled)`);
    }

    const dr = new algosdk.modelsv2.DryrunRequest({
      accounts: [],
      apps: [],
      latestTimestamp: 0,
      protocolVersion: '',
      round: 0,
      txns,
      sources,
    });
    dryrunResponse = await this.v2Client.dryrun(dr).do();
  });

  Then('I get execution result {string}', (result) => {
    let msgs;
    const res = dryrunResponse.txns[0];
    if (res.logicSigMessages !== undefined && res.logicSigMessages.length > 0) {
      msgs = res.logicSigMessages;
    } else if (
      res.appCallMessages !== undefined &&
      res.appCallMessages.length > 0
    ) {
      msgs = res.appCallMessages;
    }
    assert.ok(msgs.length > 0);
    assert.strictEqual(msgs[0], result);
  });

  let compileStatusCode;
  let compileResponse;

  When('I compile a teal program {string}', async function (program) {
    const data = await loadResource(program);
    try {
      compileResponse = await this.v2Client.compile(data).do();
      compileStatusCode = 200;
    } catch (e) {
      compileStatusCode = e.response.status;
      compileResponse = {
        result: '',
        hash: '',
      };
    }
  });

  Then(
    'it is compiled with {int} and {string} and {string}',
    (status, result, hash) => {
      assert.strictEqual(status, compileStatusCode);
      assert.strictEqual(result, compileResponse.result);
      assert.strictEqual(hash, compileResponse.hash);
    }
  );

  Then(
    'base64 decoding the response is the same as the binary {string}',
    async (program) => {
      const data = await loadResource(program);
      const decodedResult = makeUint8Array(
        algosdk.base64ToBytes(compileResponse.result)
      );
      assert.deepStrictEqual(makeUint8Array(data), decodedResult);
    }
  );

  /// /////////////////////////////////
  // TealSign tests
  /// /////////////////////////////////

  Given('base64 encoded data to sign {string}', function (data) {
    this.data = algosdk.base64ToBytes(data);
  });

  Given('program hash {string}', function (contractAddress) {
    this.contractAddress = contractAddress;
  });

  Given('base64 encoded program {string}', function (programEncoded) {
    const program = algosdk.base64ToBytes(programEncoded);
    const lsig = new algosdk.LogicSig(program);
    this.contractAddress = lsig.address();
  });

  Given('base64 encoded private key {string}', function (keyEncoded) {
    const seed = algosdk.base64ToBytes(keyEncoded);
    const keys = keyPairFromSeed(seed);
    this.sk = keys.secretKey;
  });

  When('I perform tealsign', function () {
    this.sig = algosdk.tealSign(this.sk, this.data, this.contractAddress);
  });

  Then('the signature should be equal to {string}', function (expectedEncoded) {
    const expected = makeUint8Array(algosdk.base64ToBytes(expectedEncoded));
    assert.deepStrictEqual(this.sig, expected);
  });

  /// /////////////////////////////////
  // begin application test helpers
  /// /////////////////////////////////

  Given(
    'a signing account with address {string} and mnemonic {string}',
    function (address, mnemonic) {
      this.signingAccount = algosdk.mnemonicToSecretKey(mnemonic);
      if (this.signingAccount.addr.toString() !== address) {
        throw new Error(
          `Address does not match mnemonic: ${this.signingAccount.addr} !== ${address}`
        );
      }
    }
  );

  Given(
    'suggested transaction parameters from the algod v2 client',
    async function () {
      this.suggestedParams = await this.v2Client.getTransactionParams().do();
    }
  );

  When(
    'I build a payment transaction with sender {string}, receiver {string}, amount {int}, close remainder to {string}',
    function (sender, receiver, amount, closeTo) {
      const from = sender === 'transient' ? this.transientAccount.addr : sender;
      const to =
        receiver === 'transient' ? this.transientAccount.addr : receiver;

      this.txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: from,
        receiver: to,
        amount: parseInt(amount, 10),
        closeRemainderTo: closeTo.length === 0 ? undefined : closeTo,
        suggestedParams: this.suggestedParams,
      });
    }
  );

  Then(
    "I get the account address for the current application and see that it matches the app id's hash",
    async function () {
      const appID = this.currentApplicationIndex;
      const toSign = concatArrays(
        new TextEncoder().encode('appID'),
        algosdk.encodeUint64(appID)
      );
      const expected = new algosdk.Address(makeUint8Array(genericHash(toSign)));
      const actual = algosdk.getApplicationAddress(appID);
      assert.deepStrictEqual(expected, actual);
    }
  );

  Given(
    "I fund the current application's address with {int} microalgos.",
    async function (amount) {
      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstValid === 0) sp.firstValid = 1;
      const fundingTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: this.accounts[0],
        receiver: algosdk.getApplicationAddress(this.currentApplicationIndex),
        amount,
        suggestedParams: sp,
      });
      const stxn = await this.kcl.signTransaction(
        this.handle,
        this.wallet_pswd,
        fundingTxn
      );

      const fundingResponse = await this.v2Client.sendRawTransaction(stxn).do();
      const info = await algosdk.waitForConfirmation(
        this.v2Client,
        fundingResponse.txid,
        1
      );
      assert.ok(info.confirmedRound > 0);
    }
  );

  Given(
    'suggested transaction parameters fee {int}, flat-fee {string}, first-valid {int}, last-valid {int}, genesis-hash {string}, genesis-id {string}',
    function (fee, flatFee, firstValid, lastValid, genesisHashB64, genesisID) {
      assert.ok(['true', 'false'].includes(flatFee));

      this.suggestedParams = {
        minFee: 1000, // Would be nice to  take this as an argument in the future
        flatFee: flatFee === 'true',
        fee,
        firstValid,
        lastValid,
        genesisID,
        genesisHash: algosdk.base64ToBytes(genesisHashB64),
      };
    }
  );

  When(
    'I build a keyreg transaction with sender {string}, nonparticipation {string}, vote first {int}, vote last {int}, key dilution {int}, vote public key {string}, selection public key {string}, and state proof public key {string}',
    function (
      sender,
      nonpart,
      voteFirst,
      voteLast,
      keyDilution,
      votePk,
      selectionPk,
      stateProofPk
    ) {
      assert.ok(['true', 'false'].includes(nonpart));

      this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
        sender,
        voteKey: votePk.length ? algosdk.base64ToBytes(votePk) : undefined,
        selectionKey: selectionPk.length
          ? algosdk.base64ToBytes(selectionPk)
          : undefined,
        stateProofKey: stateProofPk.length
          ? algosdk.base64ToBytes(stateProofPk)
          : undefined,
        voteFirst: voteFirst || undefined,
        voteLast: voteLast || undefined,
        voteKeyDilution: keyDilution || undefined,
        nonParticipation: nonpart === 'true',
        suggestedParams: this.suggestedParams,
      });
    }
  );

  function operationStringToEnum(inString) {
    switch (inString) {
      case 'noop':
        return algosdk.OnApplicationComplete.NoOpOC;
      case 'call':
        return algosdk.OnApplicationComplete.NoOpOC;
      case 'create':
        return algosdk.OnApplicationComplete.NoOpOC;
      case 'update':
        return algosdk.OnApplicationComplete.UpdateApplicationOC;
      case 'create-and-optin':
        return algosdk.OnApplicationComplete.OptInOC;
      case 'optin':
        return algosdk.OnApplicationComplete.OptInOC;
      case 'delete':
        return algosdk.OnApplicationComplete.DeleteApplicationOC;
      case 'clear':
        return algosdk.OnApplicationComplete.ClearStateOC;
      case 'closeout':
        return algosdk.OnApplicationComplete.CloseOutOC;
      default:
        throw Error(
          `did not recognize application operation string ${inString}`
        );
    }
  }

  async function compileProgram(client, program) {
    const data = await loadResource(program);
    if (program.endsWith('.teal')) {
      try {
        const compiledResponse = await client.compile(data).do();
        const compiledProgram = makeUint8Array(
          algosdk.base64ToBytes(compiledResponse.result)
        );
        return compiledProgram;
      } catch (err) {
        throw new Error(`could not compile teal program: ${err}`);
      }
    }
    return makeUint8Array(data);
  }

  When(
    'I build an application transaction with operation {string}, application-id {int}, sender {string}, approval-program {string}, clear-program {string}, global-bytes {int}, global-ints {int}, local-bytes {int}, local-ints {int}, app-args {string}, foreign-apps {string}, foreign-assets {string}, app-accounts {string}, fee {int}, first-valid {int}, last-valid {int}, genesis-hash {string}, extra-pages {int}, boxes {string}',
    async function (
      operationString,
      appIndex,
      sender,
      approvalProgramFile,
      clearProgramFile,
      numGlobalByteSlices,
      numGlobalInts,
      numLocalByteSlices,
      numLocalInts,
      appArgsCommaSeparatedString,
      foreignAppsCommaSeparatedString,
      foreignAssetsCommaSeparatedString,
      appAccountsCommaSeparatedString,
      fee,
      firstValid,
      lastValid,
      genesisHashBase64,
      extraPages,
      boxesCommaSeparatedString
    ) {
      // operation string to enum
      const operation = operationStringToEnum(operationString);
      // open and load in approval program
      let approvalProgramBytes;
      if (approvalProgramFile !== '') {
        approvalProgramBytes = await compileProgram(
          this.v2Client,
          approvalProgramFile
        );
      }
      // open and load in clear program
      let clearProgramBytes;
      if (clearProgramFile !== '') {
        clearProgramBytes = await compileProgram(
          this.v2Client,
          clearProgramFile
        );
      }
      // split and process app args
      let appArgs;
      if (appArgsCommaSeparatedString !== '') {
        appArgs = splitAndProcessAppArgs(appArgsCommaSeparatedString);
      }
      // split and process foreign apps
      let foreignApps;
      if (foreignAppsCommaSeparatedString !== '') {
        foreignApps = makeArray();
        foreignAppsCommaSeparatedString
          .split(',')
          .forEach((foreignAppAsString) => {
            foreignApps.push(parseInt(foreignAppAsString));
          });
      }
      // split and process foreign assets
      let foreignAssets;
      if (foreignAssetsCommaSeparatedString !== '') {
        foreignAssets = makeArray();
        foreignAssetsCommaSeparatedString
          .split(',')
          .forEach((foreignAssetAsString) => {
            foreignAssets.push(parseInt(foreignAssetAsString));
          });
      }
      // split and process app accounts
      let appAccounts;
      if (appAccountsCommaSeparatedString !== '') {
        appAccounts = makeArray(...appAccountsCommaSeparatedString.split(','));
      }
      // split and process box references
      let boxes;
      if (boxesCommaSeparatedString !== '') {
        boxes = splitAndProcessBoxReferences(boxesCommaSeparatedString);
      }
      // build suggested params object
      const sp = {
        genesisHash: algosdk.base64ToBytes(genesisHashBase64),
        firstValid,
        lastValid,
        fee,
        flatFee: true,
        minFee: 1000, // Shouldn't matter because flatFee=true
      };

      switch (operationString) {
        case 'call':
          this.txn = algosdk.makeApplicationNoOpTxnFromObject({
            sender,
            appIndex,
            appArgs,
            accounts: appAccounts,
            foreignApps,
            foreignAssets,
            boxes,
            suggestedParams: sp,
          });
          return;
        case 'create':
          this.txn = algosdk.makeApplicationCreateTxnFromObject({
            sender,
            onComplete: operation,
            approvalProgram: approvalProgramBytes,
            clearProgram: clearProgramBytes,
            numLocalInts,
            numLocalByteSlices,
            numGlobalInts,
            numGlobalByteSlices,
            extraPages,
            appArgs,
            accounts: appAccounts,
            foreignApps,
            foreignAssets,
            boxes,
            suggestedParams: sp,
          });
          return;
        case 'update':
          this.txn = algosdk.makeApplicationUpdateTxnFromObject({
            sender,
            appIndex,
            approvalProgram: approvalProgramBytes,
            clearProgram: clearProgramBytes,
            appArgs,
            accounts: appAccounts,
            foreignApps,
            foreignAssets,
            boxes,
            suggestedParams: sp,
          });
          return;
        case 'optin':
          this.txn = algosdk.makeApplicationOptInTxnFromObject({
            sender,
            appIndex,
            appArgs,
            accounts: appAccounts,
            foreignApps,
            foreignAssets,
            boxes,
            suggestedParams: sp,
          });
          return;
        case 'delete':
          this.txn = algosdk.makeApplicationDeleteTxnFromObject({
            sender,
            appIndex,
            appArgs,
            accounts: appAccounts,
            foreignApps,
            foreignAssets,
            boxes,
            suggestedParams: sp,
          });
          return;
        case 'clear':
          this.txn = algosdk.makeApplicationClearStateTxnFromObject({
            sender,
            appIndex,
            appArgs,
            accounts: appAccounts,
            foreignApps,
            foreignAssets,
            boxes,
            suggestedParams: sp,
          });
          return;
        case 'closeout':
          this.txn = algosdk.makeApplicationCloseOutTxnFromObject({
            sender,
            appIndex,
            appArgs,
            accounts: appAccounts,
            foreignApps,
            foreignAssets,
            boxes,
            suggestedParams: sp,
          });
          return;
        default:
          throw Error(
            `did not recognize application operation string ${operationString}`
          );
      }
    }
  );

  When('sign the transaction', function () {
    this.stx = this.txn.signTxn(this.signingAccount.sk);
  });

  Then(
    'the base64 encoded signed transaction should equal {string}',
    function (base64golden) {
      const actualBase64 = algosdk.bytesToBase64(this.stx);
      assert.strictEqual(actualBase64, base64golden);
    }
  );

  Then('the decoded transaction should equal the original', function () {
    const decoded = algosdk.decodeSignedTransaction(this.stx);
    // comparing the output of toEncodingData instead because the Transaction class instance
    // may have some nonconsequential differences in internal representation
    assert.deepStrictEqual(
      decoded.txn.toEncodingData(),
      this.txn.toEncodingData()
    );
  });

  Given(
    'an algod v2 client connected to {string} port {int} with token {string}',
    function (host, port, token) {
      let mutableHost = host;

      if (!mutableHost.startsWith('http')) {
        mutableHost = `http://${mutableHost}`;
      }
      this.v2Client = new algosdk.Algodv2(token, mutableHost, port, {});
    }
  );

  Given(
    'an algod v2 client connected to mock server with token {string}',
    function (token) {
      this.v2Client = new algosdk.Algodv2(
        token,
        `http://${mockAlgodPathRecorderHost}`,
        mockAlgodPathRecorderPort,
        {}
      );
    }
  );

  Given(
    'an indexer v2 client connected to mock server with token {string}',
    function (token) {
      this.indexerV2client = new algosdk.Indexer(
        token,
        `http://${mockIndexerPathRecorderHost}`,
        mockIndexerPathRecorderPort,
        {}
      );
    }
  );

  Given(
    'I create a new transient account and fund it with {int} microalgos.',
    async function (fundingAmount) {
      this.transientAccount = algosdk.generateAccount();

      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstValid === 0) sp.firstValid = 1;
      const fundingTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: this.accounts[0],
        receiver: this.transientAccount.addr,
        amount: fundingAmount,
        suggestedParams: sp,
      });
      const stxKmd = await this.kcl.signTransaction(
        this.handle,
        this.wallet_pswd,
        fundingTxn
      );
      const fundingResponse = await this.v2Client
        .sendRawTransaction(stxKmd)
        .do();
      const info = await algosdk.waitForConfirmation(
        this.v2Client,
        fundingResponse.txid,
        1
      );
      assert.ok(info.confirmedRound > 0);
    }
  );

  Given(
    'I build an application transaction with the transient account, the current application, suggested params, operation {string}, approval-program {string}, clear-program {string}, global-bytes {int}, global-ints {int}, local-bytes {int}, local-ints {int}, app-args {string}, foreign-apps {string}, foreign-assets {string}, app-accounts {string}, extra-pages {int}, boxes {string}',
    async function (
      operationString,
      approvalProgramFile,
      clearProgramFile,
      numGlobalByteSlices,
      numGlobalInts,
      numLocalByteSlices,
      numLocalInts,
      appArgsCommaSeparatedString,
      foreignAppsCommaSeparatedString,
      foreignAssetsCommaSeparatedString,
      appAccountsCommaSeparatedString,
      extraPages,
      boxesCommaSeparatedString
    ) {
      if (
        operationString === 'create' ||
        operationString === 'create-and-optin'
      ) {
        this.currentApplicationIndex = 0;
      }

      // operation string to enum
      const operation = operationStringToEnum(operationString);
      // open and load in approval program
      let approvalProgramBytes;
      if (approvalProgramFile !== '') {
        approvalProgramBytes = await compileProgram(
          this.v2Client,
          approvalProgramFile
        );
      }
      // open and load in clear program
      let clearProgramBytes;
      if (clearProgramFile !== '') {
        clearProgramBytes = await compileProgram(
          this.v2Client,
          clearProgramFile
        );
      }
      // split and process app args
      let appArgs;
      if (appArgsCommaSeparatedString !== '') {
        appArgs = splitAndProcessAppArgs(appArgsCommaSeparatedString);
      }
      // split and process foreign apps
      let foreignApps;
      if (foreignAppsCommaSeparatedString !== '') {
        foreignApps = [];
        foreignAppsCommaSeparatedString
          .split(',')
          .forEach((foreignAppAsString) => {
            foreignApps.push(parseInt(foreignAppAsString));
          });
      }
      // split and process foreign assets
      let foreignAssets;
      if (foreignAssetsCommaSeparatedString !== '') {
        foreignAssets = [];
        foreignAssetsCommaSeparatedString
          .split(',')
          .forEach((foreignAssetAsString) => {
            foreignAssets.push(parseInt(foreignAssetAsString));
          });
      }
      // split and process app accounts
      let appAccounts;
      if (appAccountsCommaSeparatedString !== '') {
        appAccounts = appAccountsCommaSeparatedString.split(',');
      }
      // split and process box references
      let boxes;
      if (boxesCommaSeparatedString !== '') {
        boxes = splitAndProcessBoxReferences(boxesCommaSeparatedString);
      }
      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstValid === 0) sp.firstValid = 1;
      this.txn = algosdk.makeApplicationCallTxnFromObject({
        sender: this.transientAccount.addr,
        appIndex: this.currentApplicationIndex,
        onComplete: operation,
        numLocalInts,
        numLocalByteSlices,
        numGlobalInts,
        numGlobalByteSlices,
        extraPages,
        approvalProgram: approvalProgramBytes,
        clearProgram: clearProgramBytes,
        appArgs,
        accounts: appAccounts,
        foreignApps,
        foreignAssets,
        boxes,
        suggestedParams: sp,
      });
    }
  );

  Given(
    'I sign and submit the transaction, saving the txid. If there is an error it is {string}.',
    async function (errorString) {
      try {
        const appStx = this.txn.signTxn(this.transientAccount.sk);
        this.appTxid = await this.v2Client.sendRawTransaction(appStx).do();
      } catch (err) {
        if (errorString !== '') {
          // error was expected. check that err.message includes expected string.
          assert.ok(err.message.includes(errorString), err);
        } else {
          // unexpected error, rethrow.
          throw err;
        }
      }
    }
  );

  Given('I wait for the transaction to be confirmed.', async function () {
    const info = await algosdk.waitForConfirmation(
      this.v2Client,
      this.appTxid.txid,
      1
    );
    assert.ok(info.confirmedRound > 0);
    this.lastTxnConfirmedRound = info.confirmedRound;
  });

  Given('I reset the array of application IDs to remember.', async function () {
    this.appIDs = [];
  });

  Given('I remember the new application ID.', async function () {
    const info = await this.v2Client
      .pendingTransactionInformation(this.appTxid.txid)
      .do();
    this.currentApplicationIndex = info.applicationIndex;

    if (!Object.prototype.hasOwnProperty.call(this, 'appIDs')) {
      this.appIDs = [];
    }
    this.appIDs.push(this.currentApplicationIndex);
  });

  Then(
    'The transient account should have the created app {string} and total schema byte-slices {int} and uints {int},' +
      ' the application {string} state contains key {string} with value {string}',
    async function (
      appCreatedBoolAsString,
      numByteSlices,
      numUints,
      applicationState,
      stateKeyB64,
      stateValue
    ) {
      const accountInfo = await this.v2Client
        .accountInformation(this.transientAccount.addr)
        .do();
      const appTotalSchema = accountInfo.appsTotalSchema;
      assert.strictEqual(
        appTotalSchema.numByteSlice.toString(),
        numByteSlices.toString()
      );
      assert.strictEqual(
        appTotalSchema.numUint.toString(),
        numUints.toString()
      );

      const appCreated = appCreatedBoolAsString === 'true';
      const { createdApps } = accountInfo;
      //  If we don't expect the app to exist, verify that it isn't there and exit.
      if (!appCreated) {
        for (let i = 0; i < createdApps.length; i++) {
          assert.notStrictEqual(
            createdApps[i].id,
            this.currentApplicationIndex
          );
        }
        return;
      }

      let foundApp = false;
      for (let i = 0; i < createdApps.length; i++) {
        foundApp =
          foundApp ||
          createdApps[i].id.toString() ===
            this.currentApplicationIndex.toString();
      }
      assert.ok(foundApp);

      // If there is no key to check, we're done.
      if (stateKeyB64 === '') {
        return;
      }

      let foundValueForKey = false;
      let keyValues = [];
      if (applicationState === 'local') {
        let counter = 0;
        for (let i = 0; i < accountInfo.appsLocalState.length; i++) {
          const localState = accountInfo.appsLocalState[i];
          if (
            localState.id.toString() === this.currentApplicationIndex.toString()
          ) {
            keyValues = localState.keyValue;
            counter += 1;
          }
        }
        assert.strictEqual(counter, 1);
      } else if (applicationState === 'global') {
        let counter = 0;
        for (let i = 0; i < accountInfo.createdApps.length; i++) {
          const createdApp = accountInfo.createdApps[i];
          if (
            createdApp.id.toString() === this.currentApplicationIndex.toString()
          ) {
            keyValues = createdApp.params.globalState;
            counter += 1;
          }
        }
        assert.strictEqual(counter, 1);
      } else {
        assert.fail(
          `test does not understand given application state: ${applicationState}`
        );
      }

      assert.ok(keyValues.length > 0);

      for (let i = 0; i < keyValues.length; i++) {
        const keyValue = keyValues[i];
        const foundKey = keyValue.key;
        if (algosdk.bytesToBase64(foundKey) === stateKeyB64) {
          foundValueForKey = true;
          const foundValue = keyValue.value;
          if (foundValue.type === 1) {
            assert.deepStrictEqual(
              foundValue.bytes,
              algosdk.base64ToBytes(stateValue)
            );
          } else if (foundValue.type === 0) {
            assert.strictEqual(foundValue.uint, stateValue);
          }
        }
      }
      assert.ok(foundValueForKey);
    }
  );

  Then('fee field is in txn', async function () {
    const s = algosdk.decodeObj(this.stx);
    const { txn } = s;
    assert.strictEqual('fee' in txn, true);
  });

  Then('fee field not in txn', async function () {
    const s = algosdk.decodeObj(this.stx);
    const { txn } = s;
    assert.strictEqual(!('fee' in txn), true);
  });

  When(
    'I create the Method object from method signature {string}',
    function (signature) {
      this.method = algosdk.ABIMethod.fromSignature(signature);
    }
  );

  When(
    'I create the Method object with name {string} first argument type {string} second argument type {string} and return type {string}',
    function (name, firstArgType, secondArgType, returnType) {
      this.method = makeABIMethod(
        makeObject({
          name,
          args: makeArray(
            makeObject({
              type: firstArgType,
            }),
            makeObject({
              type: secondArgType,
            })
          ),
          returns: makeObject({ type: returnType }),
        })
      );
    }
  );

  When(
    'I create the Method object with name {string} first argument name {string} first argument type {string} second argument name {string} second argument type {string} and return type {string}',
    function (
      name,
      firstArgName,
      firstArgType,
      secondArgName,
      secondArgType,
      returnType
    ) {
      this.method = makeABIMethod(
        makeObject({
          name,
          args: makeArray(
            makeObject({ name: firstArgName, type: firstArgType }),
            makeObject({ name: secondArgName, type: secondArgType })
          ),
          returns: makeObject({ type: returnType }),
        })
      );
    }
  );

  When(
    'I create the Method object with name {string} method description {string} first argument type {string} first argument description {string} second argument type {string} second argument description {string} and return type {string}',
    function (
      name,
      methodDesc,
      firstArgType,
      firstArgDesc,
      secondArgType,
      secondArgDesc,
      returnType
    ) {
      this.method = makeABIMethod(
        makeObject({
          name,
          desc: methodDesc,
          args: makeArray(
            makeObject({ type: firstArgType, desc: firstArgDesc }),
            makeObject({ type: secondArgType, desc: secondArgDesc })
          ),
          returns: makeObject({ type: returnType }),
        })
      );
    }
  );

  When('I serialize the Method object into json', function () {
    this.json = JSON.stringify(this.method);
  });

  Then(
    'the method selector should be {string}',
    function (expectedSelectorHex) {
      const actualSelector = this.method.getSelector();
      const expectedSelector = makeUint8Array(
        algosdk.hexToBytes(expectedSelectorHex)
      );
      assert.deepStrictEqual(actualSelector, expectedSelector);
    }
  );

  Then('the txn count should be {int}', function (expectedCount) {
    const actualCount = this.method.txnCount();
    assert.strictEqual(actualCount, parseInt(expectedCount));
  });

  Then(
    'the deserialized json should equal the original Method object',
    function () {
      const deserializedMethod = makeABIMethod(parseJSON(this.json));
      assert.deepStrictEqual(deserializedMethod, this.method);
    }
  );

  When(
    'I create an Interface object from the Method object with name {string} and description {string}',
    function (name, desc) {
      this.interface = new algosdk.ABIInterface(
        makeObject({
          name,
          desc,
          methods: makeArray(this.method.toJSON()),
        })
      );
    }
  );

  When('I serialize the Interface object into json', function () {
    this.json = JSON.stringify(this.interface);
  });

  Then(
    'the deserialized json should equal the original Interface object',
    function () {
      const deserializedInterface = new algosdk.ABIInterface(
        parseJSON(this.json)
      );
      assert.deepStrictEqual(deserializedInterface, this.interface);
    }
  );

  When(
    'I create a Contract object from the Method object with name {string} and description {string}',
    function (name, desc) {
      this.contract = makeABIContract(
        makeObject({
          name,
          desc,
          methods: makeArray(this.method.toJSON()),
        })
      );
    }
  );

  When(
    "I set the Contract's appID to {int} for the network {string}",
    function (appID, network) {
      this.contract.networks[network] = makeObject({
        appID: parseInt(appID, 10),
      });
    }
  );

  When('I serialize the Contract object into json', function () {
    this.json = JSON.stringify(this.contract);
  });

  Then(
    'the deserialized json should equal the original Contract object',
    function () {
      const deserializedContract = makeABIContract(parseJSON(this.json));
      assert.deepStrictEqual(deserializedContract, this.contract);
    }
  );

  Then(
    'the produced json should equal {string} loaded from {string}',
    function (expectedJson) {
      // compare parsed JSON to avoid differences between encoded field order
      assert.deepStrictEqual(JSON.parse(this.json), JSON.parse(expectedJson));
    }
  );

  Given('a new AtomicTransactionComposer', function () {
    this.composer = new algosdk.AtomicTransactionComposer();
  });

  Given('an application id {int}', function (appId) {
    this.currentApplicationIndex = parseInt(appId, 10);
  });

  When('I make a transaction signer for the signing account.', function () {
    this.transactionSigner = algosdk.makeBasicAccountTransactionSigner(
      this.signingAccount
    );
  });

  When('I make a transaction signer for the transient account.', function () {
    this.transactionSigner = algosdk.makeBasicAccountTransactionSigner(
      this.transientAccount
    );
  });

  When(
    'I create a transaction with signer with the current transaction.',
    function () {
      this.transactionWithSigner = {
        txn: this.txn,
        signer: this.transactionSigner,
      };
    }
  );

  When(
    'I create a transaction with an empty signer with the current transaction.',
    function () {
      this.transactionWithSigner = {
        txn: this.txn,
        signer: algosdk.makeEmptyTransactionSigner(),
      };
    }
  );

  When('I create a new method arguments array.', function () {
    this.encodedMethodArguments = [];
  });

  When(
    'I append the encoded arguments {string} to the method arguments array.',
    function (commaSeparatedB64Args) {
      if (commaSeparatedB64Args.length === 0) {
        return;
      }
      const rawArgs = commaSeparatedB64Args.split(',');

      // Optionally parse ctxAppIds
      const args = [];
      for (let i = 0; i < rawArgs.length; i++) {
        let b64Arg = rawArgs[i];
        if (b64Arg.includes('ctxAppIdx')) {
          // Retrieve the n'th app id in the saved array of app ids
          b64Arg = b64Arg.split(':');
          const appID = this.appIDs[parseInt(b64Arg[1], 10)];
          args.push(algosdk.encodeUint64(appID));
        } else {
          args.push(makeUint8Array(algosdk.base64ToBytes(b64Arg)));
        }
      }
      this.encodedMethodArguments.push(...args);
    }
  );

  When(
    'I append the current transaction with signer to the method arguments array.',
    function () {
      this.encodedMethodArguments.push(this.transactionWithSigner);
    }
  );

  async function addMethodCallToComposer(
    sender,
    onComplete,
    approvalProgramFile,
    clearProgramFile,
    globalBytes,
    globalInts,
    localBytes,
    localInts,
    extraPages,
    note,
    boxesCommaSeparatedString
  ) {
    // open and load in approval program
    let approvalProgramBytes;
    if (approvalProgramFile !== '') {
      approvalProgramBytes = await compileProgram(
        this.v2Client,
        approvalProgramFile
      );
    }
    // open and load in clear program
    let clearProgramBytes;
    if (clearProgramFile !== '') {
      clearProgramBytes = await compileProgram(this.v2Client, clearProgramFile);
    }

    const methodArgs = [];

    assert.strictEqual(
      this.encodedMethodArguments.length,
      this.method.args.length
    );

    for (let i = 0; i < this.method.args.length; i++) {
      const argSpec = this.method.args[i];
      const encodedArg = this.encodedMethodArguments[i];

      if (algosdk.abiTypeIsTransaction(argSpec.type)) {
        methodArgs.push(encodedArg);
        continue;
      }

      let typeToDecode = argSpec.type;

      if (algosdk.abiTypeIsReference(argSpec.type)) {
        switch (argSpec.type) {
          case algosdk.ABIReferenceType.account:
            typeToDecode = algosdk.ABIType.from('address');
            break;
          case algosdk.ABIReferenceType.application:
          case algosdk.ABIReferenceType.asset:
            typeToDecode = algosdk.ABIType.from('uint64');
            break;
          default:
            throw new Error(`Unknown reference type: ${argSpec.type}`);
        }
      }

      if (typeof typeToDecode === 'string') {
        throw new Error(`Cannot decode with type: ${typeToDecode}`);
      }

      methodArgs.push(typeToDecode.decode(encodedArg));
    }

    let boxes;
    if (boxesCommaSeparatedString !== '') {
      boxes = splitAndProcessBoxReferences(boxesCommaSeparatedString);
    }

    this.composer.addMethodCall({
      appID: this.currentApplicationIndex,
      method: this.method,
      methodArgs,
      sender,
      suggestedParams: this.suggestedParams,
      onComplete: operationStringToEnum(onComplete),
      approvalProgram: approvalProgramBytes,
      clearProgram: clearProgramBytes,
      numGlobalInts: globalInts,
      numGlobalByteSlices: globalBytes,
      numLocalInts: localInts,
      numLocalByteSlices: localBytes,
      extraPages,
      note,
      boxes,
      signer: this.transactionSigner,
    });
  }

  When(
    'I add a method call with the transient account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments.',
    async function (onComplete) {
      await addMethodCallToComposer.call(
        this,
        this.transientAccount.addr,
        onComplete,
        '',
        '',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    }
  );

  When(
    'I add a method call with the signing account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments.',
    async function (onComplete) {
      await addMethodCallToComposer.call(
        this,
        this.signingAccount.addr,
        onComplete,
        '',
        '',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    }
  );

  When(
    'I add a method call with the transient account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments, boxes {string}.',
    async function (onComplete, boxesCommaSeparatedString) {
      await addMethodCallToComposer.call(
        this,
        this.transientAccount.addr,
        onComplete,
        '',
        '',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        boxesCommaSeparatedString
      );
    }
  );

  When(
    'I add a method call with the transient account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments, approval-program {string}, clear-program {string}, global-bytes {int}, global-ints {int}, local-bytes {int}, local-ints {int}, extra-pages {int}.',
    async function (
      onComplete,
      approvalProg,
      clearProg,
      globalBytes,
      globalInts,
      localBytes,
      localInts,
      extraPages
    ) {
      await addMethodCallToComposer.call(
        this,
        this.transientAccount.addr,
        onComplete,
        approvalProg,
        clearProg,
        parseInt(globalBytes, 10),
        parseInt(globalInts, 10),
        parseInt(localBytes, 10),
        parseInt(localInts, 10),
        parseInt(extraPages, 10),
        undefined,
        undefined
      );
    }
  );

  When(
    'I add a method call with the signing account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments, approval-program {string}, clear-program {string}, global-bytes {int}, global-ints {int}, local-bytes {int}, local-ints {int}, extra-pages {int}.',
    async function (
      onComplete,
      approvalProg,
      clearProg,
      globalBytes,
      globalInts,
      localBytes,
      localInts,
      extraPages
    ) {
      await addMethodCallToComposer.call(
        this,
        this.signingAccount.addr,
        onComplete,
        approvalProg,
        clearProg,
        parseInt(globalBytes, 10),
        parseInt(globalInts, 10),
        parseInt(localBytes, 10),
        parseInt(localInts, 10),
        parseInt(extraPages, 10),
        undefined,
        undefined
      );
    }
  );

  When(
    'I add a method call with the transient account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments, approval-program {string}, clear-program {string}.',
    async function (onCompletion, approvalProg, clearProg) {
      assert.strictEqual(onCompletion, 'update');
      await addMethodCallToComposer.call(
        this,
        this.transientAccount.addr,
        onCompletion,
        approvalProg,
        clearProg,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    }
  );

  When(
    'I add a method call with the signing account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments, approval-program {string}, clear-program {string}.',
    async function (onCompletion, approvalProg, clearProg) {
      assert.strictEqual(onCompletion, 'update');
      await addMethodCallToComposer.call(
        this,
        this.signingAccount.addr,
        onCompletion,
        approvalProg,
        clearProg,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );
    }
  );

  Given('I add the nonce {string}', function (nonce) {
    this.nonce = nonce;
  });

  Given(
    'I add a nonced method call with the transient account, the current application, suggested params, on complete {string}, current transaction signer, current method arguments.',
    async function (onComplete) {
      const nonce = makeUint8Array(new TextEncoder().encode(this.nonce));
      await addMethodCallToComposer.call(
        this,
        this.transientAccount.addr,
        onComplete,
        '',
        '',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        nonce,
        undefined
      );
    }
  );

  When(
    'I add the current transaction with signer to the composer.',
    function () {
      this.composer.addTransaction(this.transactionWithSigner);
    }
  );

  When(
    'I build the transaction group with the composer. If there is an error it is {string}.',
    function (errorType) {
      if (errorType === '') {
        // no error expected
        this.composerBuiltGroup = this.composer.buildGroup();
        return;
      }

      let expectedMessage;
      switch (errorType) {
        case 'zero group size error':
          expectedMessage = 'Cannot build a group with 0 transactions';
          break;
        default:
          throw new Error(`Unknown error type: "${errorType}"`);
      }

      assert.throws(
        () => this.composer.buildGroup(),
        (err) => err.message === expectedMessage
      );
    }
  );

  Then('I clone the composer.', function () {
    this.composer = this.composer.clone();
  });

  Then(
    'The composer should have a status of {string}.',
    function (expectedStatus) {
      function statusStringToEnum(inString) {
        switch (inString) {
          case 'BUILDING':
            return algosdk.AtomicTransactionComposerStatus.BUILDING;
          case 'BUILT':
            return algosdk.AtomicTransactionComposerStatus.BUILT;
          case 'SIGNED':
            return algosdk.AtomicTransactionComposerStatus.SIGNED;
          case 'SUBMITTED':
            return algosdk.AtomicTransactionComposerStatus.SUBMITTED;
          case 'COMMITTED':
            return algosdk.AtomicTransactionComposerStatus.COMMITTED;
          default:
            throw Error(
              `did not recognize AtomicTransactionComposer status string ${inString}`
            );
        }
      }

      assert.strictEqual(
        this.composer.getStatus(),
        statusStringToEnum(expectedStatus)
      );
    }
  );

  Then('I gather signatures with the composer.', async function () {
    this.composerSignedTransactions = await this.composer.gatherSignatures();
  });

  Then(
    'the base64 encoded signed transactions should equal {string}',
    function (commaSeparatedB64SignedTxns) {
      const expectedSignedTxns = commaSeparatedB64SignedTxns
        .split(',')
        .map((b64SignedTxn) => algosdk.base64ToBytes(b64SignedTxn));

      const actualSignedTxns = this.composerSignedTransactions.map(
        (signedTxn) => signedTxn
      );
      assert.deepStrictEqual(
        [...actualSignedTxns],
        [...expectedSignedTxns],
        `Got ${actualSignedTxns
          .map((stxn) => algosdk.bytesToBase64(stxn))
          .join(',')}`
      );
    }
  );

  Then(
    'I execute the current transaction group with the composer.',
    async function () {
      this.composerExecuteResponse = await this.composer.execute(
        this.v2Client,
        4
      );
      assert.ok(this.composerExecuteResponse.confirmedRound > 0);
    }
  );

  Then(
    'The app should have returned {string}.',
    function (expectedReturnValues) {
      const b64ExpectedReturnValues = expectedReturnValues.split(',');

      const { methodResults } = this.composerExecuteResponse;
      assert.strictEqual(methodResults.length, b64ExpectedReturnValues.length);

      for (let i = 0; i < methodResults.length; i++) {
        const actualResult = methodResults[i];
        const { method } = actualResult;
        const expectedReturnValue = algosdk.base64ToBytes(
          b64ExpectedReturnValues[i]
        );

        if (actualResult.decodeError) {
          throw actualResult.decodeError;
        }
        assert.deepStrictEqual(
          actualResult.rawReturnValue,
          expectedReturnValue,
          `Actual return value for method at index ${i} does not match expected. Actual: ${algosdk.bytesToBase64(
            actualResult.rawReturnValue
          )}`
        );

        const returnType = method.returns.type;
        if (returnType === 'void') {
          assert.strictEqual(expectedReturnValue.byteLength, 0);
          continue;
        }

        assert.deepStrictEqual(
          actualResult.returnValue,
          returnType.decode(expectedReturnValue)
        );
      }
    }
  );

  Then(
    'The app should have returned ABI types {string}.',
    function (expectedAbiTypesString) {
      // Each return from a unique ABI method call is separated by a colon
      const expectedAbiTypes = expectedAbiTypesString.split(':');

      const { methodResults } = this.composerExecuteResponse;
      assert.strictEqual(methodResults.length, expectedAbiTypes.length);

      for (let i = 0; i < methodResults.length; i++) {
        const expectedAbiType = expectedAbiTypes[i];
        const actualResult = methodResults[i];
        const { method } = actualResult;

        if (actualResult.decodeError) {
          throw actualResult.decodeError;
        }

        const returnType = method.returns.type;
        if (returnType === 'void') {
          assert.strictEqual(expectedAbiType, returnType);
          continue;
        }

        const expectedType = algosdk.ABIType.from(expectedAbiType);
        const decodedResult = expectedType.decode(actualResult.rawReturnValue);
        const roundTripResult = expectedType.encode(decodedResult);

        assert.deepStrictEqual(roundTripResult, actualResult.rawReturnValue);
      }
    }
  );

  Then(
    'The {int}th atomic result for randomInt\\({int}) proves correct',
    function (resultIndex, methodArg) {
      // Return format for randomInt method
      const methodReturnType = algosdk.ABIType.from('(uint64,byte[17])');
      const actualResult =
        this.composerExecuteResponse.methodResults[resultIndex];
      const resultArray = methodReturnType.decode(actualResult.rawReturnValue);
      assert.strictEqual(resultArray.length, 2);
      const [randomIntResult, witnessResult] = resultArray;

      // Check the random int against the witness
      const witnessHash = genericHash(witnessResult).slice(0, 8);
      const witness = algosdk.bytesToBigInt(Uint8Array.from(witnessHash));
      const quotient = witness % BigInt(methodArg);
      assert.strictEqual(quotient, randomIntResult);
    }
  );

  Then(
    'The {int}th atomic result for randElement\\({string}) proves correct',
    function (resultIndex, methodArg) {
      // Return format for randElement method
      const methodReturnType = algosdk.ABIType.from('(byte,byte[17])');
      const actualResult =
        this.composerExecuteResponse.methodResults[resultIndex];
      const resultArray = methodReturnType.decode(actualResult.rawReturnValue);
      assert.strictEqual(resultArray.length, 2);
      const [randomResult, witnessResult] = resultArray;

      // Check the random character against the witness
      const witnessHash = genericHash(witnessResult).slice(0, 8);
      const witness = algosdk.bytesToBigInt(Uint8Array.from(witnessHash));
      const quotient = witness % BigInt(methodArg.length);
      assert.strictEqual(
        methodArg[quotient],
        new TextDecoder().decode(makeUint8Array([randomResult]))
      );
    }
  );

  // Helper function to parse paths with '.' delimiters
  function glom(result, pathString) {
    const keys = pathString.split('.');
    let item = result;
    for (let i = 0; i < keys.length; i++) {
      let index = parseInt(keys[i], 10);
      if (Number.isNaN(index)) {
        index = keys[i];
      }
      item = item[index];
    }
    return item;
  }

  Then(
    'I can dig the {int}th atomic result with path {string} and see the value {string}',
    function (index, pathString, expectedResult) {
      let actualResult =
        this.composerExecuteResponse.methodResults[index].txInfo;
      actualResult = glom(
        actualResult
          .getEncodingSchema()
          .prepareJSON(actualResult.toEncodingData()),
        pathString
      );

      assert.strictEqual(expectedResult, actualResult.toString());
    }
  );

  Then(
    'I dig into the paths {string} of the resulting atomic transaction tree I see group ids and they are all the same',
    function (pathString) {
      const paths = pathString.split(':').map((p) => p.split(','));
      let groupID;

      for (let i = 0; i < paths.length; i++) {
        const pathItem = paths[i];
        let actualResults = this.composerExecuteResponse.methodResults;
        for (let j = 0; j < pathItem.length; j++) {
          const itxnIndex = pathItem[j];
          if (j === 0) {
            actualResults = actualResults[itxnIndex].txInfo;
          } else {
            actualResults = actualResults.innerTxns[itxnIndex];
          }
        }
        const thisGroupID = actualResults.txn.txn.group;
        if (i === 0) {
          groupID = thisGroupID;
        } else {
          assert.deepStrictEqual(groupID, thisGroupID);
        }
      }
    }
  );

  Then(
    'The {int}th atomic result for {string} satisfies the regex {string}',
    function (index, method, regexString) {
      // Only allow the "spin()" method
      assert.strictEqual(method, 'spin()');

      const abiType = algosdk.ABIType.from(
        '(byte[3],byte[17],byte[17],byte[17])'
      );
      const actualResult = this.composerExecuteResponse.methodResults[index];
      let spin = abiType.decode(actualResult.rawReturnValue)[0];
      spin = new TextDecoder().decode(Uint8Array.from(spin));

      assert.ok(spin.match(regexString));
    }
  );

  Given(
    'a dryrun response file {string} and a transaction at index {string}',
    async function (drrFile, txId) {
      const drContents = await loadResourceAsJson(drrFile);
      const drr = algosdk.modelsv2.DryrunResponse.fromEncodingData(
        algosdk.modelsv2.DryrunResponse.encodingSchema.fromPreparedJSON(
          drContents
        )
      );
      this.txtrace = drr.txns[parseInt(txId)];
    }
  );

  Then('calling app trace produces {string}', async function (expected) {
    const traceString = algosdk.dryrunTxnResultAppTrace(this.txtrace);
    const expectedString = new TextDecoder().decode(
      await loadResource(expected)
    );
    assert.strictEqual(traceString, expectedString);
  });

  When(
    'I append to my Method objects list in the case of a non-empty signature {string}',
    function (methodsig) {
      if (this.methods === undefined) this.methods = [];
      if (methodsig !== '')
        this.methods.push(algosdk.ABIMethod.fromSignature(methodsig));
    }
  );

  When('I create an Interface object from my Method objects list', function () {
    this.iface = new algosdk.ABIInterface({
      name: '',
      methods: this.methods.map((m) => m.toJSON()),
    });
  });

  When('I create a Contract object from my Method objects list', function () {
    this.contract = new algosdk.ABIContract({
      name: '',
      methods: this.methods.map((m) => m.toJSON()),
    });
  });

  When('I get the method from the Interface by name {string}', function (name) {
    this.errorString = undefined;
    this.retreived_method = undefined;
    try {
      this.retreived_method = this.iface.getMethodByName(name);
    } catch (error) {
      this.errorString = error.message;
    }
    this.methods = undefined;
  });

  When('I get the method from the Contract by name {string}', function (name) {
    this.errorString = undefined;
    this.retreived_method = undefined;
    try {
      this.retreived_method = this.contract.getMethodByName(name);
    } catch (error) {
      this.errorString = error.message;
    }
    this.methods = undefined;
  });

  Then(
    'the produced method signature should equal {string}. If there is an error it begins with {string}',
    function (expectedSig, errString) {
      if (this.retreived_method !== undefined) {
        assert.strictEqual(true, errString === '' || errString === undefined);
        assert.strictEqual(this.retreived_method.getSignature(), expectedSig);
      } else if (this.errorString !== undefined) {
        assert.strictEqual(true, this.retreived_method === undefined);
        assert.strictEqual(
          true,
          this.errorString.includes(errString),
          `expected ${errString} got ${this.errorString}`
        );
      } else {
        assert.ok(false, 'Both retrieved method and error are undefined');
      }
    }
  );

  Then(
    'according to {string}, the contents of the box with name {string} in the current application should be {string}. If there is an error it is {string}.',
    async function (fromClient, boxName, boxValue, errString) {
      const boxKey = splitAndProcessAppArgs(boxName)[0];

      let resp = null;
      try {
        if (fromClient === 'algod') {
          resp = await this.v2Client
            .getApplicationBoxByName(this.currentApplicationIndex, boxKey)
            .do();
        } else if (fromClient === 'indexer') {
          resp = await this.indexerV2client
            .lookupApplicationBoxByIDandName(
              this.currentApplicationIndex,
              boxKey
            )
            .do();
        } else {
          assert.fail(`expecting algod or indexer, got ${fromClient}`);
        }
      } catch (err) {
        if (errString !== '') {
          assert.ok(
            err.message.includes(errString),
            `expected ${errString} got ${err.message}`
          );
          return;
        }
        throw err;
      }
      assert.ok(!errString, "expected error, didn't get one");

      const actualName = resp.name;
      const actualValue = resp.value;
      assert.deepStrictEqual(boxKey, actualName);
      assert.deepStrictEqual(algosdk.base64ToBytes(boxValue), actualValue);
    }
  );

  function splitBoxNames(boxB64Names) {
    if (boxB64Names == null || boxB64Names === '') {
      return [];
    }
    const splitBoxB64Names = boxB64Names.split(':');
    const boxNames = [];
    splitBoxB64Names.forEach((subArg) => {
      boxNames.push(makeUint8Array(algosdk.base64ToBytes(subArg)));
    });
    return boxNames;
  }

  Then(
    'according to indexer, with {int} being the parameter that limits results, and {string} being the parameter that sets the next result, the current application should have the following boxes {string}.',
    async function (limit, nextPage, boxNames) {
      const boxes = splitBoxNames(boxNames);
      const resp = await this.indexerV2client
        .searchForApplicationBoxes(this.currentApplicationIndex)
        .limit(limit)
        .nextToken(nextPage)
        .do();

      assert.deepStrictEqual(boxes.length, resp.boxes.length);
      const actualBoxes = new Set(resp.boxes.map((b) => b.name));
      const expectedBoxes = new Set(boxes);
      assert.deepStrictEqual(expectedBoxes, actualBoxes);
    }
  );

  Then(
    'according to {string}, with {int} being the parameter that limits results, the current application should have {int} boxes.',
    async function (fromClient, limit, expectedBoxNum) {
      let resp = null;
      if (fromClient === 'algod') {
        resp = await this.v2Client
          .getApplicationBoxes(this.currentApplicationIndex)
          .max(limit)
          .do();
      } else if (fromClient === 'indexer') {
        resp = await this.indexerV2client
          .searchForApplicationBoxes(this.currentApplicationIndex)
          .limit(limit)
          .do();
      } else {
        assert.fail(`expecting algod or indexer, got ${fromClient}`);
      }

      assert.deepStrictEqual(expectedBoxNum, resp.boxes.length);
    }
  );

  Then(
    'according to {string}, the current application should have the following boxes {string}.',
    async function (fromClient, boxNames) {
      const boxes = splitBoxNames(boxNames);

      let resp = null;
      if (fromClient === 'algod') {
        resp = await this.v2Client
          .getApplicationBoxes(this.currentApplicationIndex)
          .do();
      } else if (fromClient === 'indexer') {
        resp = await this.indexerV2client
          .searchForApplicationBoxes(this.currentApplicationIndex)
          .do();
      } else {
        assert.fail(`expecting algod or indexer, got ${fromClient}`);
      }

      assert.deepStrictEqual(boxes.length, resp.boxes.length);
      const actualBoxes = new Set(resp.boxes.map((b) => b.name));
      const expectedBoxes = new Set(boxes);
      assert.deepStrictEqual(expectedBoxes, actualBoxes);
    }
  );

  Then(
    'I wait for indexer to catch up to the round where my most recent transaction was confirmed.',
    async function () {
      // eslint-disable-next-line no-promise-executor-return
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const maxAttempts = 30;

      const roundToWaitFor = this.lastTxnConfirmedRound;
      let indexerRound = BigInt(0);
      let attempts = 0;

      for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const status = await this.indexerV2client.makeHealthCheck().do();
        indexerRound = status.round;

        if (indexerRound >= roundToWaitFor) {
          // Success
          break;
        }

        // eslint-disable-next-line no-await-in-loop
        await sleep(1000); // Sleep 1 second and check again
        attempts += 1;

        if (attempts > maxAttempts) {
          // Failsafe to prevent infinite loop
          throw new Error(
            `Timeout waiting for indexer to catch up to round ${roundToWaitFor}. It is currently on ${indexerRound}`
          );
        }
      }
    }
  );

  Given('a source map json file {string}', async function (srcmap) {
    const js = await loadResourceAsJson(srcmap);
    this.sourcemap = new algosdk.ProgramSourceMap(js);
  });

  Then('the source map contains pcs {string}', function (pcsString) {
    const expectedPcs = makeArray(
      ...pcsString.split(',').map((pc) => parseInt(pc, 10))
    );
    const actualPcs = makeArray(...this.sourcemap.getPcs());
    assert.deepStrictEqual(actualPcs, expectedPcs);
  });

  Then(
    'the source map maps pc {int} to line {int} and column {int} of source {string}',
    function (pc, expectedLine, expectedColumn, source) {
      const actual = this.sourcemap.getLocationForPc(pc);
      assert.ok(actual);
      assert.strictEqual(actual.line, expectedLine);
      assert.strictEqual(actual.column, expectedColumn);
      assert.strictEqual(this.sourcemap.sources[actual.sourceIndex], source);
    }
  );

  Then(
    'the source map maps source {string} and line {int} to pc {int} at column {int}',
    function (source, line, pc, expectedColumn) {
      const sourceIndex = this.sourcemap.sources.indexOf(source);
      assert.ok(sourceIndex >= 0);
      const actualPcs = this.sourcemap.getPcsOnSourceLine(sourceIndex, line);
      for (const actualPcInfo of actualPcs) {
        if (actualPcInfo.pc === pc) {
          assert.strictEqual(actualPcInfo.column, expectedColumn);
          return;
        }
      }
      throw new Error(`Could not find pc ${pc}`);
    }
  );

  When(
    'I compile a teal program {string} with mapping enabled',
    async function (teal) {
      const tealSrc = await loadResource(teal);
      const compiledResponse = await this.v2Client
        .compile(tealSrc)
        .sourcemap(true)
        .do();
      this.rawSourceMap = algosdk.encodeJSON(compiledResponse.sourcemap);
    }
  );

  Then(
    'the resulting source map is the same as the json {string}',
    async function (expectedJsonPath) {
      const expected = new TextDecoder()
        .decode(await loadResource(expectedJsonPath))
        .trim();
      assert.deepStrictEqual(this.rawSourceMap, expected);
    }
  );

  Then(
    'disassembly of {string} matches {string}',
    async function (bytecodeFilename, sourceFilename) {
      const bytecode = await loadResource(bytecodeFilename);
      const resp = await this.v2Client.disassemble(bytecode).do();
      const expectedSource = new TextDecoder().decode(
        await loadResource(sourceFilename)
      );

      assert.deepStrictEqual(resp.result.toString('UTF-8'), expectedSource);
    }
  );

  When(
    'we make a GetLightBlockHeaderProof call for round {int}',
    async function (int) {
      await doOrDoRaw(this.v2Client.getLightBlockHeaderProof(int));
    }
  );

  When('we make a GetStateProof call for round {int}', async function (int) {
    await doOrDoRaw(this.v2Client.getStateProof(int));
  });

  When(
    'we make a Lookup Block Hash call against round {int}',
    async function (int) {
      await doOrDoRaw(this.v2Client.getBlockHash(int));
    }
  );

  Given(
    'a base64 encoded program bytes for heuristic sanity check {string}',
    async function (programByteStr) {
      this.seeminglyProgram = new Uint8Array(
        algosdk.base64ToBytes(programByteStr)
      );
    }
  );

  When('I start heuristic sanity check over the bytes', async function () {
    this.actualErrMsg = undefined;
    try {
      new algosdk.LogicSigAccount(this.seeminglyProgram); // eslint-disable-line
    } catch (e) {
      this.actualErrMsg = e.message;
    }
  });

  Then(
    'if the heuristic sanity check throws an error, the error contains {string}',
    async function (errMsg) {
      if (errMsg !== '') assert.ok(this.actualErrMsg.includes(errMsg));
      else assert.strictEqual(this.actualErrMsg, undefined);
    }
  );

  When(
    'I prepare the transaction without signatures for simulation',
    function () {
      // Transform transaction into a "EncodedSignedTransaction", but don't
      // sign it so we can check that we can simulate unsigned txns.
      this.stx = algosdk.encodeUnsignedSimulateTransaction(this.txn);
    }
  );

  Then('I simulate the transaction', async function () {
    this.simulateResponse = await this.v2Client
      .simulateRawTransactions(this.stx)
      .do();
  });

  Then(
    'I simulate the current transaction group with the composer',
    async function () {
      // Alias the simulate response as execute response so it can be re-used
      // in other steps that check the ABI method results.
      this.composerExecuteResponse = await this.composer.simulate(
        this.v2Client
      );
      this.simulateResponse = this.composerExecuteResponse.simulateResponse;
      this.methodResults = this.composerExecuteResponse.methodResults;
    }
  );

  Then(
    'the simulation should succeed without any failure message',
    function () {
      for (const txnGroup of this.simulateResponse.txnGroups) {
        assert.equal(txnGroup.failureMessage, undefined);
      }
    }
  );

  Then(
    'the simulation should report missing signatures at group {string}, transactions {string}',
    async function (txnGroupIndex, transactionPath) {
      // Parse the path ("0,0") into a list of numbers ([0, 0])
      const stringPath = transactionPath.split(',');
      const txnIndexes = stringPath.map((n) => parseInt(n, 10));
      const groupNum = parseInt(txnGroupIndex, 10);

      // Check for missing signature flag
      for (const txnIndex of txnIndexes) {
        assert.deepStrictEqual(
          true,
          this.simulateResponse.txnGroups[groupNum].txnResults[txnIndex]
            .missingSignature
        );
      }
    }
  );

  Then(
    'the simulation should report a failure at group {string}, path {string} with message {string}',
    async function (txnGroupIndex, failAt, errorMsg) {
      // Parse transaction group number
      const groupNum = parseInt(txnGroupIndex, 10);

      // Parse the path ("0,0") into a list of numbers ([0, 0])
      const stringPath = failAt.split(',');
      const failPath = stringPath.map((n) => parseInt(n, 10));

      const failedMessage =
        this.simulateResponse.txnGroups[groupNum].failureMessage;
      assert.ok(
        failedMessage.includes(errorMsg),
        `Error message: "${failedMessage}" does not contain "${errorMsg}"`
      );

      // Check path array
      const { failedAt } = this.simulateResponse.txnGroups[groupNum];
      assert.deepStrictEqual(makeArray(...failedAt), makeArray(...failPath));
    }
  );

  When('I make a new simulate request.', async function () {
    this.simulateRequest = new algosdk.modelsv2.SimulateRequest({
      txnGroups: [],
    });
  });

  Then('I allow more logs on that simulate request.', async function () {
    this.simulateRequest.allowMoreLogging = true;
  });

  Then(
    'I simulate the transaction group with the simulate request.',
    async function () {
      this.composerExecuteResponse = await this.composer.simulate(
        this.v2Client,
        this.simulateRequest
      );
      this.simulateResponse = this.composerExecuteResponse.simulateResponse;
      this.methodResults = this.composerExecuteResponse.methodResults;
    }
  );

  Then(
    'I check the simulation result has power packs allow-more-logging.',
    async function () {
      assert.ok(this.simulateResponse.evalOverrides);
      assert.ok(this.simulateResponse.evalOverrides.maxLogCalls);
      assert.ok(this.simulateResponse.evalOverrides.maxLogSize);
    }
  );

  Then(
    'I allow {int} more budget on that simulate request.',
    async function (budget) {
      this.simulateRequest.extraOpcodeBudget = budget;
    }
  );

  Then(
    'I check the simulation result has power packs extra-opcode-budget with extra budget {int}.',
    async function (budget) {
      assert.ok(this.simulateResponse.evalOverrides);
      assert.strictEqual(
        budget,
        this.simulateResponse.evalOverrides.extraOpcodeBudget
      );
    }
  );

  Then(
    'I allow exec trace options {string} on that simulate request.',
    async function (execTraceOptions) {
      const optionList = execTraceOptions.split(',');

      assert.ok(this.simulateRequest);
      this.simulateRequest.execTraceConfig =
        new algosdk.modelsv2.SimulateTraceConfig({
          enable: true,
          scratchChange: optionList.includes('scratch'),
          stackChange: optionList.includes('stack'),
          stateChange: optionList.includes('state'),
        });
    }
  );

  function avmValueCheck(expectedStringLiteral, actualAvmValue) {
    const [expectedAvmType, expectedValue] = expectedStringLiteral.split(':');

    if (expectedAvmType === 'uint64') {
      assert.equal(actualAvmValue.type, 2);
      if (expectedValue === 0) {
        assert.equal(actualAvmValue.uint, undefined);
      } else {
        assert.equal(actualAvmValue.uint, BigInt(expectedValue));
      }
    } else if (expectedAvmType === 'bytes') {
      assert.equal(actualAvmValue.type, 1);
      if (expectedValue.length === 0) {
        assert.equal(actualAvmValue.bytes, undefined);
      } else {
        assert.deepEqual(
          actualAvmValue.bytes,
          algosdk.base64ToBytes(expectedValue)
        );
      }
    } else {
      assert.fail('expectedAvmType should be either uint64 or bytes');
    }
  }

  Then(
    '{int}th unit in the {string} trace at txn-groups path {string} should add value {string} to stack, pop {int} values from stack, write value {string} to scratch slot {string}.',
    async function (
      unitIndex,
      traceType,
      txnGroupPath,
      stackAddition,
      stackPopCount,
      scratchWriteContent,
      slotID
    ) {
      const unitFinder = (txnGroupPathStr, traceTypeStr, unitIndexInt) => {
        const txnGroupPathSplit = txnGroupPathStr
          .split(',')
          .filter((r) => r !== '')
          .map(Number);
        assert.ok(txnGroupPathSplit.length > 0);

        let traces =
          this.simulateResponse.txnGroups[0].txnResults[txnGroupPathSplit[0]]
            .execTrace;
        assert.ok(traces);

        for (let i = 1; i < txnGroupPathSplit.length; i++) {
          traces = traces.innerTrace[txnGroupPathSplit[i]];
          assert.ok(traces);
        }

        let trace = traces.approvalProgramTrace;

        if (traceTypeStr === 'approval') {
          trace = traces.approvalProgramTrace;
        } else if (traceTypeStr === 'clearState') {
          trace = traces.clearStateProgramTrace;
        } else if (traceTypeStr === 'logic') {
          trace = traces.logicSigTrace;
        }
        const changeUnit = trace[unitIndexInt];
        return changeUnit;
      };

      assert.ok(this.simulateResponse);

      const changeUnit = unitFinder(txnGroupPath, traceType, unitIndex);
      if (stackPopCount > 0) {
        assert.equal(changeUnit.stackPopCount, stackPopCount);
      } else {
        assert.ok(!changeUnit.stackPopCount);
      }

      const stackAdditionSplit = stackAddition
        .split(',')
        .filter((r) => r !== '');

      if (changeUnit.stackAdditions) {
        assert.equal(
          changeUnit.stackAdditions.length,
          stackAdditionSplit.length
        );
        for (let i = 0; i < stackAdditionSplit.length; i++) {
          avmValueCheck(stackAdditionSplit[i], changeUnit.stackAdditions[i]);
        }
      } else {
        assert.equal(stackAdditionSplit.length, 0);
      }

      if (slotID !== '') {
        assert.equal(changeUnit.scratchChanges.length, 1);

        const slotIDint = Number(slotID);
        assert.equal(changeUnit.scratchChanges[0].slot, slotIDint);
        assert.notEqual(scratchWriteContent, '');

        const newValue = changeUnit.scratchChanges[0]?.newValue;
        assert.ok(newValue);

        avmValueCheck(scratchWriteContent, newValue);
      } else {
        assert.ok(!changeUnit.scratchChanges);
        assert.equal(scratchWriteContent, '');
      }
    }
  );

  Then(
    'the current application initial {string} state should be empty.',
    function (stateType) {
      assert.ok(this.simulateResponse.initialStates);
      assert.ok(this.simulateResponse.initialStates.appInitialStates);
      let initialAppState = null;
      let found = false;
      for (const entry of this.simulateResponse.initialStates
        .appInitialStates) {
        if (entry.id !== this.currentApplicationIndex) {
          continue;
        }
        initialAppState = entry;
        found = true;
        break;
      }
      assert.ok(found);
      if (initialAppState) {
        switch (stateType) {
          case 'local':
            assert.ok(!initialAppState.appLocals);
            break;
          case 'global':
            assert.ok(!initialAppState.appGlobals);
            break;
          case 'box':
            assert.ok(!initialAppState.appBoxes);
            break;
          default:
            assert.fail('state type can only be one of local/global/box');
        }
      }
    }
  );

  Then(
    'the current application initial {string} state should contain {string} with value {string}.',
    function (stateType, keyStr, valueStr) {
      assert.ok(this.simulateResponse.initialStates);
      assert.ok(this.simulateResponse.initialStates.appInitialStates);
      let initialAppState = null;
      for (const entry of this.simulateResponse.initialStates
        .appInitialStates) {
        if (entry.id !== this.currentApplicationIndex) {
          continue;
        }
        initialAppState = entry;
        break;
      }
      assert.ok(initialAppState);
      let kvs = null;
      switch (stateType) {
        case 'local':
          assert.ok(initialAppState.appLocals);
          assert.strictEqual(initialAppState.appLocals.length, 1);
          assert.ok(initialAppState.appLocals[0].account);
          assert.ok(
            initialAppState.appLocals[0].account instanceof algosdk.Address
          );
          assert.ok(initialAppState.appLocals[0].kvs);
          kvs = initialAppState.appLocals[0].kvs;
          break;
        case 'global':
          assert.ok(initialAppState.appGlobals);
          assert.ok(!initialAppState.appGlobals.account);
          assert.ok(initialAppState.appGlobals.kvs);
          kvs = initialAppState.appGlobals.kvs;
          break;
        case 'box':
          assert.ok(initialAppState.appBoxes);
          assert.ok(!initialAppState.appBoxes.account);
          assert.ok(initialAppState.appBoxes.kvs);
          kvs = initialAppState.appBoxes.kvs;
          break;
        default:
          assert.fail('state type can only be one of local/global/box');
      }
      assert.ok(kvs.length > 0);

      const binaryKey = new TextEncoder().encode(keyStr);

      let actualValue = null;
      for (const kv of kvs) {
        if (bytesEqual(binaryKey, kv.key)) {
          actualValue = kv.value;
          break;
        }
      }
      assert.ok(actualValue);
      avmValueCheck(valueStr, actualValue);
    }
  );

  Then(
    '{int}th unit in the {string} trace at txn-groups path {string} should write to {string} state {string} with new value {string}.',
    function (
      unitIndex,
      traceType,
      txnGroupPath,
      stateType,
      stateName,
      newValue
    ) {
      const unitFinder = (txnGroupPathStr, traceTypeStr, unitIndexInt) => {
        const txnGroupPathSplit = txnGroupPathStr
          .split(',')
          .filter((r) => r !== '')
          .map(Number);
        assert.ok(txnGroupPathSplit.length > 0);

        let traces =
          this.simulateResponse.txnGroups[0].txnResults[txnGroupPathSplit[0]]
            .execTrace;
        assert.ok(traces);

        for (let i = 1; i < txnGroupPathSplit.length; i++) {
          traces = traces.innerTrace[txnGroupPathSplit[i]];
          assert.ok(traces);
        }

        let trace = traces.approvalProgramTrace;
        if (traceTypeStr === 'approval') {
          trace = traces.approvalProgramTrace;
        } else if (traceTypeStr === 'clearState') {
          trace = traces.clearStateProgramTrace;
        } else if (traceTypeStr === 'logic') {
          trace = traces.logicSigTrace;
        }

        assert.ok(
          unitIndexInt < trace.length,
          `unitIndexInt (${unitIndexInt}) < trace.length (${trace.length})`
        );

        const changeUnit = trace[unitIndexInt];
        return changeUnit;
      };

      assert.ok(this.simulateResponse);

      const changeUnit = unitFinder(txnGroupPath, traceType, unitIndex);
      assert.ok(changeUnit.stateChanges);
      assert.strictEqual(changeUnit.stateChanges.length, 1);
      const stateChange = changeUnit.stateChanges[0];

      if (stateType === 'global') {
        assert.strictEqual(stateChange.appStateType, 'g');
        assert.ok(!stateChange.account);
      } else if (stateType === 'local') {
        assert.strictEqual(stateChange.appStateType, 'l');
        assert.ok(stateChange.account);
        assert.ok(stateChange.account instanceof algosdk.Address);
      } else if (stateType === 'box') {
        assert.strictEqual(stateChange.appStateType, 'b');
        assert.ok(!stateChange.account);
      } else {
        assert.fail('state type can only be one of local/global/box');
      }

      assert.strictEqual(stateChange.operation, 'w');

      assert.deepStrictEqual(
        stateChange.key,
        makeUint8Array(new TextEncoder().encode(stateName))
      );
      assert.ok(stateChange.newValue);
      avmValueCheck(newValue, stateChange.newValue);
    }
  );

  Then(
    '{string} hash at txn-groups path {string} should be {string}.',
    function (traceType, txnGroupPath, b64ProgHash) {
      const txnGroupPathSplit = txnGroupPath
        .split(',')
        .filter((r) => r !== '')
        .map(Number);
      assert.ok(txnGroupPathSplit.length > 0);

      let traces =
        this.simulateResponse.txnGroups[0].txnResults[txnGroupPathSplit[0]]
          .execTrace;
      assert.ok(traces);

      for (let i = 1; i < txnGroupPathSplit.length; i++) {
        traces = traces.innerTrace[txnGroupPathSplit[i]];
        assert.ok(traces);
      }

      let hash = traces.approvalProgramHash;

      if (traceType === 'approval') {
        hash = traces.approvalProgramHash;
      } else if (traceType === 'clearState') {
        hash = traces.clearStateProgramHash;
      } else if (traceType === 'logic') {
        hash = traces.logicSigHash;
      }
      assert.deepStrictEqual(
        hash,
        makeUint8Array(algosdk.base64ToBytes(b64ProgHash))
      );
    }
  );

  When('we make a Ready call', async function () {
    await this.v2Client.ready().do();
  });

  When(
    'we make a SetBlockTimeStampOffset call against offset {int}',
    async function (offset) {
      await this.v2Client.setBlockOffsetTimestamp(offset).do();
    }
  );

  When('we make a GetBlockTimeStampOffset call', async function () {
    await this.v2Client.getBlockOffsetTimestamp().doRaw();
  });

  When(
    'we make a SetSyncRound call against round {int}',
    async function (round) {
      await this.v2Client.setSyncRound(round).do();
    }
  );

  When('we make a GetSyncRound call', async function () {
    await this.v2Client.getSyncRound().doRaw();
  });

  When('we make a UnsetSyncRound call', async function () {
    await this.v2Client.unsetSyncRound().do();
  });

  When('we make an arbitrary algod call', async function () {
    await this.v2Client.healthCheck().do();
  });

  When('we make an arbitrary indexer call', async function () {
    await this.indexerV2client.makeHealthCheck().do();
  });

  When(
    'we make a TransactionGroupLedgerStateDeltaForRoundResponse call for round {int}',
    async function (round) {
      await this.v2Client
        .getTransactionGroupLedgerStateDeltasForRound(round)
        .doRaw();
    }
  );

  When(
    'we make a LedgerStateDeltaForTransactionGroupResponse call for ID {string}',
    async function (id) {
      await this.v2Client.getLedgerStateDeltaForTransactionGroup(id).do();
    }
  );

  When(
    'we make a GetLedgerStateDelta call against round {int}',
    async function (round) {
      await this.v2Client.getLedgerStateDelta(round).do();
    }
  );

  When(
    'we make a GetBlockTxids call against block number {int}',
    async function (round) {
      await this.v2Client.getBlockTxids(round).doRaw();
    }
  );

  if (!options.ignoreReturn) {
    return steps;
  }

  return undefined;
};
