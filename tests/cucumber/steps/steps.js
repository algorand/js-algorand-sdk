/* eslint-disable func-names,radix */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const algosdk = require('../../../index');
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
  const DEV_MODE_INITIAL_MICROALGOS = 10_000_000;

  /*
   * waitForAlgodInDevMode is a Dev mode helper method that waits for a transaction to resolve.
   * Since Dev mode produces blocks on a per transaction basis, it's possible
   * algod generates a block _before_ the corresponding SDK call to wait for a block.
   * Without _any_ wait, it's possible the SDK looks for the transaction before algod completes processing.
   * So, the method performs a local sleep to simulate waiting for a block.
   */
  function waitForAlgodInDevMode() {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  const { algod_token: algodToken, kmd_token: kmdToken } = options;

  Given('an algod client', async function () {
    this.acl = new algosdk.Algod(algodToken, 'http://localhost', 60000);
    return this.acl;
  });

  Given('a kmd client', function () {
    this.kcl = new algosdk.Kmd(kmdToken, 'http://localhost', 60001);
    return this.kcl;
  });

  Given('an algod v2 client', function () {
    this.v2Client = new algosdk.Algodv2(algodToken, 'http://localhost', 60000);
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
    this.versions = await this.acl.versions();
    this.versions = this.versions.versions;
    return this.versions;
  });

  Then('v1 should be in the versions', function () {
    assert.deepStrictEqual(true, this.versions.indexOf('v1') >= 0);
  });

  When('I get versions with kmd', async function () {
    this.versions = await this.kcl.versions();
    this.versions = this.versions.versions;
    return this.versions;
  });

  When('I get the status', async function () {
    this.status = await this.acl.status();
    return this.status;
  });

  When('I get status after this block', async function () {
    // Send a transaction to advance blocks in dev mode.
    const sp = await this.acl.getTransactionParams();
    if (sp.firstRound === 0) sp.firstRound = 1;
    const fundingTxnArgs = {
      from: this.accounts[0],
      to: this.accounts[0],
      amount: 0,
      fee: sp.fee,
      firstRound: sp.lastRound + 1,
      lastRound: sp.lastRound + 1000,
      genesisHash: sp.genesishashb64,
      genesisID: sp.genesisID,
    };
    const stxKmd = await this.kcl.signTransaction(
      this.handle,
      this.wallet_pswd,
      fundingTxnArgs
    );
    await this.acl.sendRawTransaction(stxKmd);

    this.statusAfter = await this.acl.statusAfterBlock(this.status.lastRound);
    return this.statusAfter;
  });

  Then('I can get the block info', async function () {
    this.block = await this.acl.block(this.statusAfter.lastRound);
    assert.deepStrictEqual(true, Number.isInteger(this.block.round));
  });

  Given(
    'payment transaction parameters {int} {int} {int} {string} {string} {string} {int} {string} {string}',
    function (fee, fv, lv, gh, to, close, amt, gen, note) {
      this.fee = parseInt(fee);
      this.fv = parseInt(fv);
      this.lv = parseInt(lv);
      this.gh = gh;
      this.to = to;
      if (close !== 'none') {
        this.close = close;
      }
      this.amt = parseInt(amt);
      if (gen !== 'none') {
        this.gen = gen;
      }
      if (note !== 'none') {
        this.note = makeUint8Array(Buffer.from(note, 'base64'));
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
        Buffer.from(
          algosdk.decodeAddress(this.msig.addrs[i]).publicKey
        ).toString('base64')
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
      assert.deepStrictEqual(
        Buffer.from(golden, 'base64'),
        Buffer.from(this.stx)
      );
    }
  );

  Then(
    'the signed transaction should equal the kmd signed transaction',
    function () {
      assert.deepStrictEqual(Buffer.from(this.stx), Buffer.from(this.stxKmd));
    }
  );

  Then(
    'the multisig address should equal the golden {string}',
    function (golden) {
      assert.deepStrictEqual(algosdk.multisigAddress(this.msig), golden);
    }
  );

  Then(
    'the multisig transaction should equal the golden {string}',
    function (golden) {
      assert.deepStrictEqual(
        Buffer.from(golden, 'base64'),
        Buffer.from(this.stx)
      );
    }
  );

  Then(
    'the multisig transaction should equal the kmd signed multisig transaction',
    async function () {
      await this.kcl.deleteMultisig(
        this.handle,
        this.wallet_pswd,
        algosdk.multisigAddress(this.msig)
      );
      const s = algosdk.decodeObj(this.stx);
      const m = algosdk.encodeObj(s.msig);
      assert.deepStrictEqual(
        Buffer.from(m),
        Buffer.from(this.stxKmd, 'base64')
      );
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
      const sp = await this.acl.getTransactionParams();
      if (sp.firstRound === 0) sp.firstRound = 1;
      const fundingTxnArgs = {
        from: this.accounts[0],
        to: this.rekey,
        amount: DEV_MODE_INITIAL_MICROALGOS,
        fee: sp.fee,
        firstRound: sp.lastRound + 1,
        lastRound: sp.lastRound + 1000,
        genesisHash: sp.genesishashb64,
        genesisID: sp.genesisID,
      };

      const stxKmd = await this.kcl.signTransaction(
        this.handle,
        this.wallet_pswd,
        fundingTxnArgs
      );
      await this.acl.sendRawTransaction(stxKmd);
      return this.rekey;
    }
  );

  Then('the key should be in the wallet', async function () {
    let keys = await this.kcl.listKeys(this.handle);
    keys = keys.addresses;
    assert.deepStrictEqual(true, keys.indexOf(this.pk) >= 0);
    return keys;
  });

  When('I delete the key', async function () {
    return this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk);
  });

  Then('the key should not be in the wallet', async function () {
    let keys = await this.kcl.listKeys(this.handle);
    keys = keys.addresses;
    assert.deepStrictEqual(false, keys.indexOf(this.pk) >= 0);
    return keys;
  });

  When('I generate a key', function () {
    const result = algosdk.generateAccount();
    this.pk = result.addr;
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
        Buffer.from(exp).toString('base64'),
        Buffer.from(this.sk).toString('base64')
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
      const result = await this.acl.getTransactionParams();
      this.lastRound = result.lastRound;
      this.txn = {
        from: this.accounts[0],
        to: this.accounts[1],
        fee: result.fee,
        firstRound: result.lastRound + 1,
        lastRound: result.lastRound + 1000,
        genesisHash: result.genesishashb64,
        genesisID: result.genesisID,
        note: makeUint8Array(Buffer.from(note, 'base64')),
        amount: parseInt(amt),
      };
      return this.txn;
    }
  );

  Given(
    'default transaction with parameters {int} {string} and rekeying key',
    async function (amt, note) {
      this.pk = this.rekey;
      const result = await this.acl.getTransactionParams();
      this.lastRound = result.lastRound;
      this.txn = {
        from: this.rekey,
        to: this.accounts[1],
        fee: result.fee,
        firstRound: result.lastRound + 1,
        lastRound: result.lastRound + 1000,
        genesisHash: result.genesishashb64,
        genesisID: result.genesisID,
        note: makeUint8Array(Buffer.from(note, 'base64')),
        amount: parseInt(amt),
      };
      return this.txn;
    }
  );

  Given(
    'default multisig transaction with parameters {int} {string}',
    async function (amt, note) {
      [this.pk] = this.accounts;
      const result = await this.acl.getTransactionParams();
      this.msig = {
        version: 1,
        threshold: 1,
        addrs: this.accounts,
      };

      this.txn = {
        from: algosdk.multisigAddress(this.msig),
        to: this.accounts[1],
        fee: result.fee,
        firstRound: result.lastRound + 1,
        lastRound: result.lastRound + 1000,
        genesisHash: result.genesishashb64,
        genesisID: result.genesisID,
        note: makeUint8Array(Buffer.from(note, 'base64')),
        amount: parseInt(amt),
      };
      return this.txn;
    }
  );

  When('I import the multisig', async function () {
    const addrs = [];
    for (let i = 0; i < this.msig.addrs.length; i++) {
      addrs.push(
        Buffer.from(
          algosdk.decodeAddress(this.msig.addrs[i]).publicKey
        ).toString('base64')
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
    let keys = await this.kcl.listMultisig(this.handle);
    keys = keys.addresses;
    assert.deepStrictEqual(
      true,
      keys.indexOf(algosdk.multisigAddress(this.msig)) >= 0
    );
    return keys;
  });

  Then('the multisig should not be in the wallet', async function () {
    let keys = await this.kcl.listMultisig(this.handle);
    if (typeof keys.addresses === 'undefined') {
      return true;
    }

    keys = keys.addresses;
    assert.deepStrictEqual(
      false,
      keys.indexOf(algosdk.multisigAddress(this.msig)) >= 0
    );
    return keys;
  });

  When('I export the multisig', async function () {
    this.msigExp = await this.kcl.exportMultisig(
      this.handle,
      algosdk.multisigAddress(this.msig)
    );
    return this.msigExp;
  });

  When('I delete the multisig', async function () {
    return this.kcl.deleteMultisig(
      this.handle,
      this.wallet_pswd,
      algosdk.multisigAddress(this.msig)
    );
  });

  Then('the multisig should equal the exported multisig', function () {
    for (let i = 0; i < this.msigExp.length; i++) {
      assert.deepStrictEqual(
        algosdk.encodeAddress(Buffer.from(this.msigExp[i], 'base64')),
        this.msig.addrs[i]
      );
    }
  });

  Then('the node should be healthy', async function () {
    const health = await this.acl.healthCheck();
    assert.deepStrictEqual(health, makeObject({}));
  });

  Then('I get the ledger supply', async function () {
    return this.acl.ledgerSupply();
  });

  Then('I get transactions by address and round', async function () {
    const lastRound = await this.acl.status();
    const transactions = await this.acl.transactionByAddress(
      this.accounts[0],
      1,
      lastRound.lastRound
    );
    assert.deepStrictEqual(
      true,
      Object.entries(transactions).length === 0 ||
        'transactions' in transactions
    );
  });

  Then('I get pending transactions', async function () {
    const transactions = await this.acl.pendingTransactions(10);
    assert.deepStrictEqual(
      true,
      Object.entries(transactions).length === 0 ||
        'truncatedTxns' in transactions
    );
  });

  When('I get the suggested params', async function () {
    this.params = await this.acl.getTransactionParams();
    return this.params;
  });

  When('I get the suggested fee', async function () {
    this.fee = await this.acl.suggestedFee();
    this.fee = this.fee.fee;
    return this.fee;
  });

  Then(
    'the fee in the suggested params should equal the suggested fee',
    function () {
      assert.deepStrictEqual(this.params.fee, this.fee);
    }
  );

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
    this.txn = {
      to: this.to,
      fee: this.fee,
      firstRound: this.fv,
      lastRound: this.lv,
      genesisHash: this.gh,
      flatFee: true,
    };
    if (this.gen) {
      this.txn.genesisID = this.gen;
    }
    if (this.close) {
      this.txn.closeRemainderTo = this.close;
    }
    if (this.note) {
      this.txn.note = this.note;
    }
    if (this.amt) {
      this.txn.amount = this.amt;
    }
  });

  Given('encoded multisig transaction {string}', function (encTxn) {
    this.mtx = Buffer.from(encTxn, 'base64');
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
      this.mtxs.push(Buffer.from(mtxs[i], 'base64'));
    }
  });

  When('I create the multisig payment transaction', function () {
    this.txn = {
      from: algosdk.multisigAddress(this.msig),
      to: this.to,
      fee: this.fee,
      firstRound: this.fv,
      lastRound: this.lv,
      genesisHash: this.gh,
    };
    if (this.gen) {
      this.txn.genesisID = this.gen;
    }
    if (this.close) {
      this.txn.closeRemainderTo = this.close;
    }
    if (this.note) {
      this.txn.note = this.note;
    }
    if (this.amt) {
      this.txn.amount = this.amt;
    }
    return this.txn;
  });

  When('I create the multisig payment transaction with zero fee', function () {
    this.txn = {
      from: algosdk.multisigAddress(this.msig),
      to: this.to,
      fee: this.fee,
      flatFee: true,
      firstRound: this.fv,
      lastRound: this.lv,
      genesisHash: this.gh,
    };
    if (this.gen) {
      this.txn.genesisID = this.gen;
    }
    if (this.close) {
      this.txn.closeRemainderTo = this.close;
    }
    if (this.note) {
      this.txn.note = this.note;
    }
    if (this.amt) {
      this.txn.amount = this.amt;
    }
    return this.txn;
  });

  When('I send the transaction', async function () {
    this.txid = await this.acl.sendRawTransaction(this.stx);
    this.txid = this.txid.txId;
    return this.txid;
  });

  When('I send the kmd-signed transaction', async function () {
    this.txid = await this.acl.sendRawTransaction(this.stxKmd);
    this.txid = this.txid.txId;
    return this.txid;
  });

  // eslint-disable-next-line consistent-return
  When('I send the multisig transaction', async function () {
    try {
      this.txid = await this.acl.sendRawTransaction(this.stx);
      this.err = false;
      return this.txid;
    } catch (e) {
      this.err = true;
    }
  });

  Then('the transaction should go through', async function () {
    await waitForAlgodInDevMode();
    const info = await this.acl.pendingTransactionInformation(this.txid);
    assert.deepStrictEqual(true, 'type' in info);

    // TODO: this needs to be modified/removed when v1 is no longer supported
    // let localParams = await this.acl.getTransactionParams();
    // this.lastRound = localParams.lastRound;
    // await waitForAlgodInDevMode();
    // info = await this.acl.transactionById(this.txid);
    // assert.deepStrictEqual(true, 'type' in info);
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

  Then('I get account information', async function () {
    return this.acl.accountInformation(this.accounts[0]);
  });

  Then('I can get account information', async function () {
    await this.acl.accountInformation(this.pk);
    return this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk);
  });

  Given(
    'default V2 key registration transaction {string}',
    async function (type) {
      const voteKey = makeUint8Array(
        Buffer.from('9mr13Ri8rFepxN3ghIUrZNui6LqqM5hEzB45Rri5lkU=', 'base64')
      );
      const selectionKey = makeUint8Array(
        Buffer.from('dx717L3uOIIb/jr9OIyls1l5Ei00NFgRa380w7TnPr4=', 'base64')
      );
      const stateProofKey = makeUint8Array(
        Buffer.from(
          'mYR0GVEObMTSNdsKM6RwYywHYPqVDqg3E4JFzxZOreH9NU8B+tKzUanyY8AQ144hETgSMX7fXWwjBdHz6AWk9w==',
          'base64'
        )
      );

      const from = this.accounts[0];
      this.pk = from;

      const result = await this.acl.getTransactionParams();
      const suggestedParams = {
        fee: result.fee,
        firstRound: result.lastRound + 1,
        lastRound: result.lastRound + 1000,
        genesisHash: result.genesishashb64,
        genesisID: result.genesisID,
      };
      this.lastRound = result.lastRound;

      if (type === 'online') {
        this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          from,
          voteKey,
          selectionKey,
          stateProofKey,
          voteFirst: 1,
          voteLast: 2000,
          voteKeyDilution: 10,
          suggestedParams,
        });
      } else if (type === 'offline') {
        this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          from,
          suggestedParams,
        });
      } else if (type === 'nonparticipation') {
        this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParamsFromObject({
          from,
          nonParticipation: true,
          suggestedParams,
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
      metadataHash: 'fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh',
      expectedParams: undefined,
      queriedParams: undefined,
      lastTxn: undefined,
    };
  });

  Given(
    'default asset creation transaction with total issuance {int}',
    async function (issuance) {
      [this.assetTestFixture.creator] = this.accounts;
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const parsedIssuance = parseInt(issuance);
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
      const genesisID = '';
      const type = 'acfg';

      this.assetTestFixture.lastTxn = {
        from: this.assetTestFixture.creator,
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        note: this.note,
        genesisHash: this.gh,
        assetTotal: parsedIssuance,
        assetDecimals: decimals,
        assetDefaultFrozen: defaultFrozen,
        assetUnitName: unitName,
        assetName,
        assetURL,
        assetMetadataHash: metadataHash,
        assetManager: manager,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        genesisID,
        type,
      };
      // update vars used by other helpers
      this.assetTestFixture.expectedParams = {
        creator: this.assetTestFixture.creator,
        total: parsedIssuance,
        defaultfrozen: defaultFrozen,
        unitname: unitName,
        assetname: assetName,
        url: assetURL,
        metadatahash: Buffer.from(metadataHash).toString('base64'),
        managerkey: manager,
        reserveaddr: reserve,
        freezeaddr: freeze,
        clawbackaddr: clawback,
        decimals,
      };
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
      [this.pk] = this.accounts;
    }
  );

  Given(
    'default-frozen asset creation transaction with total issuance {int}',
    async function (issuance) {
      [this.assetTestFixture.creator] = this.accounts;
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const parsedIssuance = parseInt(issuance);
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
      const genesisID = '';
      const type = 'acfg';

      this.assetTestFixture.lastTxn = {
        from: this.assetTestFixture.creator,
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        note: this.note,
        genesisHash: this.gh,
        assetTotal: parsedIssuance,
        assetDecimals: decimals,
        assetDefaultFrozen: defaultFrozen,
        assetUnitName: unitName,
        assetName,
        assetURL,
        assetMetadataHash: metadataHash,
        assetManager: manager,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        genesisID,
        type,
      };
      // update vars used by other helpers
      this.assetTestFixture.expectedParams = {
        creator: this.assetTestFixture.creator,
        total: parsedIssuance,
        defaultfrozen: defaultFrozen,
        unitname: unitName,
        assetname: assetName,
        url: assetURL,
        metadatahash: Buffer.from(metadataHash).toString('base64'),
        managerkey: manager,
        reserveaddr: reserve,
        freezeaddr: freeze,
        clawbackaddr: clawback,
        decimals,
      };
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
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
    const accountResponse = await this.acl.accountInformation(
      this.assetTestFixture.creator
    );
    const heldAssets = accountResponse.thisassettotal;
    let keys = Object.keys(heldAssets).map((key) => parseInt(key));
    keys = keys.sort(sortKeysAscending);
    const assetIndex = keys[keys.length - 1];

    // this is stored as a string so it can be used as a key later.
    this.assetTestFixture.index = assetIndex.toString();
  });

  When('I get the asset info', async function () {
    this.assetTestFixture.queriedParams = await this.acl.assetInformation(
      this.assetTestFixture.index
    );
  });

  Then('the asset info should match the expected asset info', function () {
    Object.keys(this.assetTestFixture.expectedParams).forEach((key) => {
      assert.strictEqual(
        true,
        this.assetTestFixture.expectedParams[key] ===
          this.assetTestFixture.queriedParams[key] ||
          typeof this.assetTestFixture.expectedParams[key] === 'undefined' ||
          typeof this.assetTestFixture.queriedParams[key] === 'undefined'
      );
    });
  });

  When(
    'I create a no-managers asset reconfigure transaction',
    async function () {
      [this.assetTestFixture.creator] = this.accounts;
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      // if we truly supplied no managers at all, it would be an asset destroy txn
      // so leave one key written
      const manager = this.assetTestFixture.creator;
      let reserve;
      let freeze;
      let clawback;
      const genesisID = '';
      const type = 'acfg';

      this.assetTestFixture.lastTxn = {
        from: this.assetTestFixture.creator,
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        note: this.note,
        genesisHash: this.gh,
        assetManager: manager,
        assetReserve: reserve,
        assetFreeze: freeze,
        assetClawback: clawback,
        assetIndex: parseInt(this.assetTestFixture.index),
        genesisID,
        type,
      };
      // update vars used by other helpers
      this.assetTestFixture.expectedParams.reserveaddr = '';
      this.assetTestFixture.expectedParams.freezeaddr = '';
      this.assetTestFixture.expectedParams.clawbackaddr = '';
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
      [this.pk] = this.accounts;
    }
  );

  When('I create an asset destroy transaction', async function () {
    [this.assetTestFixture.creator] = this.accounts;
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    const genesisID = '';
    const type = 'acfg';

    this.assetTestFixture.lastTxn = {
      from: this.assetTestFixture.creator,
      fee: this.fee,
      firstRound: this.fv,
      lastRound: this.lv,
      note: this.note,
      genesisHash: this.gh,
      assetIndex: parseInt(this.assetTestFixture.index),
      genesisID,
      type,
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    [this.pk] = this.accounts;
  });

  Then('I should be unable to get the asset info', async function () {
    let failed = false;
    try {
      await this.acl.assetInformation(this.assetTestFixture.index);
    } catch (e) {
      failed = true;
    }
    assert.deepStrictEqual(failed, true);
  });

  When(
    'I create a transaction for a second account, signalling asset acceptance',
    async function () {
      const accountToUse = this.accounts[1];
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const genesisID = '';
      const type = 'axfer';

      this.assetTestFixture.lastTxn = {
        from: accountToUse,
        to: accountToUse,
        amount: 0,
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        note: this.note,
        genesisHash: this.gh,
        assetIndex: parseInt(this.assetTestFixture.index),
        genesisID,
        type,
      };
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
      this.pk = accountToUse;
    }
  );

  When(
    'I create a transaction transferring {int} assets from creator to a second account',
    async function (amount) {
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const genesisID = '';
      const type = 'axfer';

      this.assetTestFixture.lastTxn = {
        from: this.assetTestFixture.creator,
        to: this.accounts[1],
        amount: parseInt(amount),
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        note: this.note,
        genesisHash: this.gh,
        assetIndex: parseInt(this.assetTestFixture.index),
        genesisID,
        type,
      };
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
      this.pk = this.assetTestFixture.creator;
    }
  );

  When(
    'I create a transaction transferring {int} assets from a second account to creator',
    async function (amount) {
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const genesisID = '';
      const type = 'axfer';

      this.assetTestFixture.lastTxn = {
        to: this.assetTestFixture.creator,
        from: this.accounts[1],
        amount: parseInt(amount),
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        note: this.note,
        genesisHash: this.gh,
        assetIndex: parseInt(this.assetTestFixture.index),
        genesisID,
        type,
      };
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
      [this.pk] = this.accounts;
    }
  );

  Then(
    'the creator should have {int} assets remaining',
    async function (expectedTotal) {
      const accountInformation = await this.acl.accountInformation(
        this.assetTestFixture.creator
      );
      const assetsHeld = accountInformation.assets[this.assetTestFixture.index];
      assert.deepStrictEqual(assetsHeld.amount, parseInt(expectedTotal));
    }
  );

  When('I send the bogus kmd-signed transaction', async function () {
    this.err = false;
    try {
      await this.acl.sendRawTransaction(this.stxKmd);
    } catch (e) {
      this.err = true;
    }
  });

  When(
    'I create an un-freeze transaction targeting the second account',
    async function () {
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const freezer = this.assetTestFixture.creator;

      this.assetTestFixture.lastTxn = {
        from: freezer,
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        genesisHash: this.gh,
        type: 'afrz',
        freezeAccount: this.accounts[1],
        assetIndex: parseInt(this.assetTestFixture.index),
        freezeState: false,
        note: this.note,
      };
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
      this.pk = this.assetTestFixture.creator;
    }
  );

  When(
    'I create a freeze transaction targeting the second account',
    async function () {
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const freezer = this.assetTestFixture.creator;

      this.assetTestFixture.lastTxn = {
        from: freezer,
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        genesisHash: this.gh,
        type: 'afrz',
        freezeAccount: this.accounts[1],
        assetIndex: parseInt(this.assetTestFixture.index),
        freezeState: true,
        note: this.note,
      };
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
      this.pk = this.assetTestFixture.creator;
    }
  );

  When(
    'I create a transaction revoking {int} assets from a second account to creator',
    async function (amount) {
      this.params = await this.acl.getTransactionParams();
      this.fee = this.params.fee;
      this.fv = this.params.lastRound;
      this.lv = this.fv + 1000;
      this.note = undefined;
      this.gh = this.params.genesishashb64;
      const genesisID = '';
      const type = 'axfer';

      this.assetTestFixture.lastTxn = {
        from: this.assetTestFixture.creator,
        to: this.assetTestFixture.creator,
        assetRevocationTarget: this.accounts[1],
        amount: parseInt(amount),
        fee: this.fee,
        firstRound: this.fv,
        lastRound: this.lv,
        note: this.note,
        genesisHash: this.gh,
        assetIndex: parseInt(this.assetTestFixture.index),
        genesisID,
        type,
      };
      // update vars used by other helpers
      this.txn = this.assetTestFixture.lastTxn;
      this.lastRound = this.params.lastRound;
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
      if (expectedBody !== null) {
        expectedMockResponse = expectedBody;
        if (format === 'msgp') {
          expectedMockResponse = new Uint8Array(
            Buffer.from(expectedMockResponse, 'base64')
          );
        }
      }
      responseFormat = format;
      this.v2Client = new algosdk.Algodv2(
        '',
        `http://${mockAlgodResponderHost}:${mockAlgodResponderPort}`,
        {}
      );
      this.indexerClient = new algosdk.Indexer(
        '',
        `http://${mockAlgodResponderHost}:${mockAlgodResponderPort}`,
        {}
      );
    }
  );

  Given(
    'mock http responses in {string} loaded from {string} with status {int}.',
    function (expectedBody, status, format) {
      if (expectedBody !== null) {
        expectedMockResponse = expectedBody;
        if (format === 'msgp') {
          expectedMockResponse = new Uint8Array(
            Buffer.from(expectedMockResponse, 'base64')
          );
        }
      }
      responseFormat = format;
      this.v2Client = new algosdk.Algodv2(
        '',
        `http://${mockAlgodResponderHost}:${mockAlgodResponderPort}`,
        {}
      );
      this.indexerClient = new algosdk.Indexer(
        '',
        `http://${mockAlgodResponderHost}:${mockAlgodResponderPort}`,
        {}
      );
      this.expectedMockResponseCode = status;
    }
  );

  When(
    'we make any {string} call to {string}.',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async function (client, _endpoint) {
      try {
        if (client === 'algod') {
          // endpoints are ignored by mock server, see setupMockServerForResponses
          if (responseFormat === 'msgp') {
            this.actualMockResponse = await this.v2Client.block(0).do();
          } else {
            this.actualMockResponse = await this.v2Client.status().do();
          }
        } else if (client === 'indexer') {
          // endpoints are ignored by mock server, see setupMockServerForResponses
          this.actualMockResponse = await this.indexerClient
            .makeHealthCheck()
            .do();
        } else {
          throw Error(`did not recognize desired client "${client}"`);
        }
      } catch (err) {
        if (this.expectedMockResponseCode === 200) {
          throw err;
        }
        if (this.expectedMockResponseCode === 500) {
          if (!err.toString().includes('Received status 500')) {
            throw Error(
              `expected response code 500 implies error Internal Server Error but instead had error: ${err}`
            );
          }
        }
      }
    }
  );

  Then('the parsed response should equal the mock response.', function () {
    if (this.expectedMockResponseCode === 200) {
      // assert.deepStrictEqual considers a Buffer and Uint8Array with the same contents as unequal.
      // These types are fairly interchangable in different parts of the SDK, so we need to normalize
      // them before comparing, which is why we chain encoding/decoding below.
      if (responseFormat === 'json') {
        assert.strictEqual(
          JSON.stringify(JSON.parse(expectedMockResponse)),
          JSON.stringify(this.actualMockResponse)
        );
      } else {
        assert.deepStrictEqual(
          algosdk.decodeObj(
            new Uint8Array(algosdk.encodeObj(this.actualMockResponse))
          ),
          algosdk.decodeObj(expectedMockResponse)
        );
      }
    }
  });

  Then('expect error string to contain {string}', (expectedErrorString) => {
    if (expectedErrorString === 'nil') {
      assert.strictEqual('', globalErrForExamination);
      return;
    }
    assert.strictEqual(expectedErrorString, globalErrForExamination);
  });

  Given('mock server recording request paths', function () {
    this.v2Client = new algosdk.Algodv2(
      '',
      `http://${mockAlgodPathRecorderHost}:${mockAlgodPathRecorderPort}`,
      {}
    );
    this.indexerClient = new algosdk.Indexer(
      '',
      `http://${mockIndexerPathRecorderHost}:${mockIndexerPathRecorderPort}`,
      {}
    );
  });

  Then(
    'expect the path used to be {string}',
    (algodSeenRequests, indexerSeenRequests, expectedRequestPath) => {
      let actualRequestPath;
      if (algodSeenRequests.length !== 0) {
        [actualRequestPath] = algodSeenRequests;
      } else if (indexerSeenRequests.length !== 0) {
        [actualRequestPath] = indexerSeenRequests;
      }
      assert.strictEqual(actualRequestPath, expectedRequestPath);
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
      await this.v2Client.pendingTransactionInformation(txid).do();
    }
  );

  When(
    'we make a Pending Transaction Information with max {int} and format {string}',
    async function (max, format) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }
      await this.v2Client.pendingTransactionsInformation().max(max).do();
    }
  );

  When(
    'we make a Pending Transactions By Address call against account {string} and max {int}',
    function (account, max) {
      this.v2Client.pendingTransactionByAddress(account).max(max).do();
    }
  );

  When(
    'we make a Pending Transactions By Address call against account {string} and max {int} and format {string}',
    async function (account, max, format) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }
      await this.v2Client.pendingTransactionByAddress(account).max(max).do();
    }
  );

  When(
    'we make a Status after Block call with round {int}',
    async function (round) {
      await this.v2Client.statusAfterBlock(round).do();
    }
  );

  When(
    'we make an Account Information call against account {string} with exclude {string}',
    async function (account, exclude) {
      await this.v2Client.accountInformation(account).exclude(exclude).do();
    }
  );

  When(
    'we make an Account Information call against account {string}',
    async function (account) {
      await this.v2Client.accountInformation(account).do();
    }
  );

  When(
    'we make an Account Asset Information call against account {string} assetID {int}',
    async function (account, assetID) {
      await this.v2Client.accountAssetInformation(account, assetID).do();
    }
  );

  When(
    'we make an Account Application Information call against account {string} applicationID {int}',
    async function (account, applicationID) {
      await this.v2Client
        .accountApplicationInformation(account, applicationID)
        .do();
    }
  );

  When(
    'we make a Get Block call against block number {int}',
    function (blockNum) {
      this.v2Client.block(blockNum).do();
    }
  );

  When(
    'we make a Get Block call against block number {int} with format {string}',
    async function (blockNum, format) {
      if (format !== 'msgpack') {
        assert.fail('this SDK only supports format msgpack for this function');
      }
      await this.v2Client.block(blockNum).do();
    }
  );

  When('we make a GetAssetByID call for assetID {int}', async function (index) {
    await this.v2Client.getAssetByID(index).do();
  });

  When(
    'we make a GetApplicationByID call for applicationID {int}',
    async function (index) {
      await this.v2Client.getApplicationByID(index).do();
    }
  );

  let anyPendingTransactionInfoResponse;

  When('we make any Pending Transaction Information call', async function () {
    anyPendingTransactionInfoResponse = await this.v2Client
      .pendingTransactionInformation()
      .do();
  });

  Then(
    'the parsed Pending Transaction Information response should have sender {string}',
    (sender) => {
      const actualSender = algosdk.encodeAddress(
        anyPendingTransactionInfoResponse.txn.txn.snd
      );
      assert.strictEqual(sender, actualSender);
    }
  );

  let anyPendingTransactionsInfoResponse;

  When('we make any Pending Transactions Information call', async function () {
    anyPendingTransactionsInfoResponse = await this.v2Client
      .pendingTransactionsInformation()
      .do();
  });

  Then(
    'the parsed Pending Transactions Information response should contain an array of len {int} and element number {int} should have sender {string}',
    (len, idx, sender) => {
      assert.strictEqual(
        len,
        anyPendingTransactionsInfoResponse['top-transactions'].length
      );
      if (len !== 0) {
        assert.strictEqual(
          sender,
          algosdk.encodeAddress(
            anyPendingTransactionsInfoResponse['top-transactions'][idx].txn.snd
          )
        );
      }
    }
  );

  let anySendRawTransactionResponse;

  When('we make any Send Raw Transaction call', async function () {
    anySendRawTransactionResponse = await this.v2Client
      .sendRawTransaction(makeUint8Array(0))
      .do();
  });

  Then(
    'the parsed Send Raw Transaction response should have txid {string}',
    (txid) => {
      assert.strictEqual(txid, anySendRawTransactionResponse.txId);
    }
  );

  let anyPendingTransactionsByAddressResponse;

  When('we make any Pending Transactions By Address call', async function () {
    anyPendingTransactionsByAddressResponse = await this.v2Client
      .pendingTransactionByAddress()
      .do();
  });

  Then(
    'the parsed Pending Transactions By Address response should contain an array of len {int} and element number {int} should have sender {string}',
    (len, idx, sender) => {
      assert.strictEqual(
        len,
        anyPendingTransactionsByAddressResponse['total-transactions']
      );
      if (len === 0) {
        return;
      }
      let actualSender =
        anyPendingTransactionsByAddressResponse['top-transactions'][idx].txn
          .snd;
      actualSender = algosdk.encodeAddress(actualSender);
      assert.strictEqual(sender, actualSender);
    }
  );

  let anyNodeStatusResponse;

  When('we make any Node Status call', async function () {
    anyNodeStatusResponse = await this.v2Client.status().do();
  });

  Then(
    'the parsed Node Status response should have a last round of {int}',
    (lastRound) => {
      assert.strictEqual(lastRound, anyNodeStatusResponse['last-round']);
    }
  );

  let anyLedgerSupplyResponse;

  When('we make any Ledger Supply call', async function () {
    anyLedgerSupplyResponse = await this.v2Client.supply().do();
  });

  Then(
    'the parsed Ledger Supply response should have totalMoney {int} onlineMoney {int} on round {int}',
    (totalMoney, onlineMoney, round) => {
      assert.strictEqual(totalMoney, anyLedgerSupplyResponse['total-money']);
      assert.strictEqual(onlineMoney, anyLedgerSupplyResponse['online-money']);
      assert.strictEqual(round, anyLedgerSupplyResponse.current_round);
    }
  );

  When('we make any Status After Block call', async function () {
    anyNodeStatusResponse = await this.v2Client.statusAfterBlock(1).do();
  });

  Then(
    'the parsed Status After Block response should have a last round of {int}',
    (lastRound) => {
      assert.strictEqual(lastRound, anyNodeStatusResponse['last-round']);
    }
  );

  let anyAccountInformationResponse;

  When('we make any Account Information call', async function () {
    anyAccountInformationResponse = await this.v2Client
      .accountInformation()
      .do();
  });

  Then(
    'the parsed Account Information response should have address {string}',
    (address) => {
      assert.strictEqual(address, anyAccountInformationResponse.address);
    }
  );

  let anyBlockResponse;

  When('we make any Get Block call', async function () {
    anyBlockResponse = await this.v2Client.block(1).do();
  });

  Then(
    'the parsed Get Block response should have rewards pool {string}',
    (rewardsPoolAddress) => {
      const rewardsPoolB64String = Buffer.from(
        anyBlockResponse.block.rwd
      ).toString('base64');
      assert.strictEqual(rewardsPoolAddress, rewardsPoolB64String);
    }
  );

  let anySuggestedTransactionsResponse;

  When('we make any Suggested Transaction Parameters call', async function () {
    anySuggestedTransactionsResponse = await this.v2Client
      .getTransactionParams()
      .do();
  });

  Then(
    'the parsed Suggested Transaction Parameters response should have first round valid of {int}',
    (firstRound) => {
      assert.strictEqual(
        firstRound,
        anySuggestedTransactionsResponse.firstRound
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
      await this.indexerClient
        .lookupAssetBalances(index)
        .limit(limit)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .do();
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
      await this.indexerClient
        .lookupAssetTransactions(assetIndex)
        .notePrefix(notePrefix)
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .limit(limit)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .address(address)
        .addressRole(addressRole)
        .excludeCloseTo(excludeCloseTo)
        .do();
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
        .notePrefix(notePrefix)
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .limit(limit)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .address(address)
        .addressRole(addressRole)
        .excludeCloseTo(excludeCloseTo)
        .rekeyTo(rekeyTo)
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
      await this.indexerClient
        .lookupAccountTransactions(account)
        .notePrefix(notePrefix)
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .limit(limit)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .assetID(assetIndex)
        .do();
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
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .limit(limit)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .assetID(assetIndex)
        .rekeyTo(rekeyTo)
        .do();
    }
  );

  When(
    'we make a Lookup Block call against round {int}',
    async function (round) {
      await this.indexerClient.lookupBlock(round).do();
    }
  );

  When(
    'we make a Lookup Account by ID call against account {string} with round {int}',
    async function (account, round) {
      await this.indexerClient.lookupAccountByID(account).round(round).do();
    }
  );

  When(
    'we make a Lookup Account by ID call against account {string} with exclude {string}',
    async function (account, exclude) {
      await this.indexerClient.lookupAccountByID(account).exclude(exclude).do();
    }
  );

  When(
    'we make a Lookup Asset by ID call against asset index {int}',
    async function (assetIndex) {
      await this.indexerClient.lookupAssetByID(assetIndex).do();
    }
  );

  When(
    'we make a LookupApplicationLogsByID call with applicationID {int} limit {int} minRound {int} maxRound {int} nextToken {string} sender {string} and txID {string}',
    async function (appID, limit, minRound, maxRound, nextToken, sender, txID) {
      await this.indexerClient
        .lookupApplicationLogs(appID)
        .limit(limit)
        .maxRound(maxRound)
        .minRound(minRound)
        .nextToken(nextToken)
        .sender(sender)
        .txid(txID)
        .do();
    }
  );

  When(
    'we make a Search Accounts call with assetID {int} limit {int} currencyGreaterThan {int} currencyLessThan {int} and round {int}',
    async function (assetIndex, limit, currencyGreater, currencyLesser, round) {
      await this.indexerClient
        .searchAccounts()
        .assetID(assetIndex)
        .limit(limit)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .round(round)
        .do();
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
        .limit(limit)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .round(round)
        .authAddr(authAddress)
        .do();
    }
  );

  When(
    'we make a Search Accounts call with exclude {string}',
    async function (exclude) {
      await this.indexerClient.searchAccounts().exclude(exclude).do();
    }
  );

  When(
    'we make a SearchForApplications call with creator {string}',
    async function (creator) {
      await this.indexerClient.searchForApplications().creator(creator).do();
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
      await this.indexerClient
        .searchForTransactions()
        .address(account)
        .notePrefix(notePrefix)
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .limit(limit)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .assetID(assetIndex)
        .addressRole(addressRole)
        .excludeCloseTo(excludeCloseTo)
        .do();
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
        .notePrefix(notePrefix)
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .limit(limit)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .assetID(assetIndex)
        .addressRole(addressRole)
        .excludeCloseTo(excludeCloseTo)
        .rekeyTo(rekeyTo)
        .do();
    }
  );

  When(
    'we make a SearchForAssets call with limit {int} creator {string} name {string} unit {string} index {int}',
    async function (limit, creator, name, unit, index) {
      await this.indexerClient
        .searchForAssets()
        .limit(limit)
        .creator(creator)
        .name(name)
        .unit(unit)
        .index(index)
        .do();
    }
  );

  When(
    'we make a SearchForApplications call with applicationID {int}',
    async function (index) {
      await this.indexerClient.searchForApplications().index(index).do();
    }
  );

  When(
    'we make a LookupApplications call with applicationID {int}',
    async function (index) {
      await this.indexerClient.lookupApplications(index).do();
    }
  );

  let anyLookupAssetBalancesResponse;

  When('we make any LookupAssetBalances call', async function () {
    anyLookupAssetBalancesResponse = await this.indexerClient
      .lookupAssetBalances()
      .setIntDecoding('mixed')
      .do();
  });

  Then(
    'the parsed LookupAssetBalances response should be valid on round {int}, and contain an array of len {int} and element number {int} should have address {string} amount {int} and frozen state {string}',
    (round, length, idx, address, amount, frozenStateAsString) => {
      assert.strictEqual(
        round,
        anyLookupAssetBalancesResponse['current-round']
      );
      assert.strictEqual(
        length,
        anyLookupAssetBalancesResponse.balances.length
      );
      if (length === 0) {
        return;
      }
      let frozenState = false;
      if (frozenStateAsString === 'true') {
        frozenState = true;
      }
      assert.strictEqual(
        amount,
        anyLookupAssetBalancesResponse.balances[idx].amount
      );
      assert.strictEqual(
        frozenState,
        anyLookupAssetBalancesResponse.balances[idx]['is-frozen']
      );
    }
  );

  When(
    'we make a LookupAccountAssets call with accountID {string} assetID {int} includeAll {string} limit {int} next {string}',
    async function (account, assetID, includeAll, limit, next) {
      await this.indexerClient
        .lookupAccountAssets(account)
        .assetId(assetID)
        .includeAll(includeAll === 'true')
        .limit(limit)
        .nextToken(next)
        .do();
    }
  );

  When(
    'we make a LookupAccountCreatedAssets call with accountID {string} assetID {int} includeAll {string} limit {int} next {string}',
    async function (account, assetID, includeAll, limit, next) {
      await this.indexerClient
        .lookupAccountCreatedAssets(account)
        .assetID(assetID)
        .includeAll(includeAll === 'true')
        .limit(limit)
        .nextToken(next)
        .do();
    }
  );

  When(
    'we make a LookupAccountAppLocalStates call with accountID {string} applicationID {int} includeAll {string} limit {int} next {string}',
    async function (account, applicationID, includeAll, limit, next) {
      await this.indexerClient
        .lookupAccountAppLocalStates(account)
        .applicationID(applicationID)
        .includeAll(includeAll === 'true')
        .limit(limit)
        .nextToken(next)
        .do();
    }
  );

  When(
    'we make a LookupAccountCreatedApplications call with accountID {string} applicationID {int} includeAll {string} limit {int} next {string}',
    async function (account, applicationID, includeAll, limit, next) {
      await this.indexerClient
        .lookupAccountCreatedApplications(account)
        .applicationID(applicationID)
        .includeAll(includeAll === 'true')
        .limit(limit)
        .nextToken(next)
        .do();
    }
  );

  let anyLookupAssetTransactionsResponse;

  When('we make any LookupAssetTransactions call', async function () {
    anyLookupAssetTransactionsResponse = await this.indexerClient
      .lookupAssetTransactions()
      .setIntDecoding('mixed')
      .do();
  });

  Then(
    'the parsed LookupAssetTransactions response should be valid on round {int}, and contain an array of len {int} and element number {int} should have sender {string}',
    (round, length, idx, sender) => {
      assert.strictEqual(
        round,
        anyLookupAssetTransactionsResponse['current-round']
      );
      assert.strictEqual(
        length,
        anyLookupAssetTransactionsResponse.transactions.length
      );
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        sender,
        anyLookupAssetTransactionsResponse.transactions[idx].sender
      );
    }
  );

  let anyLookupAccountTransactionsResponse;

  When('we make any LookupAccountTransactions call', async function () {
    anyLookupAccountTransactionsResponse = await this.indexerClient
      .lookupAccountTransactions()
      .do();
  });

  Then(
    'the parsed LookupAccountTransactions response should be valid on round {int}, and contain an array of len {int} and element number {int} should have sender {string}',
    (round, length, idx, sender) => {
      assert.strictEqual(
        round,
        anyLookupAccountTransactionsResponse['current-round']
      );
      assert.strictEqual(
        length,
        anyLookupAccountTransactionsResponse.transactions.length
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
    anyLookupBlockResponse = await this.indexerClient.lookupBlock().do();
  });

  Then(
    'the parsed LookupBlock response should have previous block hash {string}',
    (prevHash) => {
      assert.strictEqual(
        prevHash,
        anyLookupBlockResponse['previous-block-hash']
      );
    }
  );

  let anyLookupAccountByIDResponse;

  When('we make any LookupAccountByID call', async function () {
    anyLookupAccountByIDResponse = await this.indexerClient
      .lookupAccountByID()
      .do();
  });

  Then(
    'the parsed LookupAccountByID response should have address {string}',
    (address) => {
      assert.strictEqual(address, anyLookupAccountByIDResponse.account.address);
    }
  );

  let anyLookupAssetByIDResponse;

  When('we make any LookupAssetByID call', async function () {
    anyLookupAssetByIDResponse = await this.indexerClient
      .lookupAssetByID()
      .setIntDecoding('mixed')
      .do();
  });

  Then('the parsed LookupAssetByID response should have index {int}', (idx) => {
    assert.strictEqual(idx, anyLookupAssetByIDResponse.asset.index);
  });

  let anySearchAccountsResponse;

  When('we make any SearchAccounts call', async function () {
    anySearchAccountsResponse = await this.indexerClient.searchAccounts().do();
  });

  Then(
    'the parsed SearchAccounts response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have address {string}',
    (round, length, idx, address) => {
      assert.strictEqual(round, anySearchAccountsResponse['current-round']);
      assert.strictEqual(length, anySearchAccountsResponse.accounts.length);
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        address,
        anySearchAccountsResponse.accounts[idx].address
      );
    }
  );

  Then(
    'the parsed SearchAccounts response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have authorizing address {string}',
    (round, length, idx, authAddress) => {
      assert.strictEqual(round, anySearchAccountsResponse['current-round']);
      assert.strictEqual(length, anySearchAccountsResponse.accounts.length);
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        authAddress,
        anySearchAccountsResponse.accounts[idx]['auth-addr']
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
        round,
        anySearchForTransactionsResponse['current-round']
      );
      assert.strictEqual(
        length,
        anySearchForTransactionsResponse.transactions.length
      );
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        sender,
        anySearchForTransactionsResponse.transactions[idx].sender
      );
    }
  );

  Then(
    'the parsed SearchForTransactions response should be valid on round {int} and the array should be of len {int} and the element at index {int} should have rekey-to {string}',
    (round, length, idx, rekeyTo) => {
      assert.strictEqual(
        round,
        anySearchForTransactionsResponse['current-round']
      );
      assert.strictEqual(
        length,
        anySearchForTransactionsResponse.transactions.length
      );
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        rekeyTo,
        anySearchForTransactionsResponse.transactions[idx]['rekey-to']
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
      assert.strictEqual(round, anySearchForAssetsResponse['current-round']);
      assert.strictEqual(length, anySearchForAssetsResponse.assets.length);
      if (length === 0) {
        return;
      }
      assert.strictEqual(
        assetIndex,
        anySearchForAssetsResponse.assets[idx].index
      );
    }
  );

  /// /////////////////////////////////
  // begin rekey test helpers
  /// /////////////////////////////////

  When('I add a rekeyTo field with address {string}', function (address) {
    this.txn.reKeyTo = address;
  });

  When(
    'I add a rekeyTo field with the private key algorand address',
    function () {
      const keypair = keyPairFromSecretKey(this.sk);
      const pubKeyFromSk = keypair.publicKey;
      this.txn.reKeyTo = algosdk.encodeAddress(pubKeyFromSk);
    }
  );

  When('I set the from address to {string}', function (from) {
    this.txn.from = from;
  });

  let dryrunResponse;

  When('we make any Dryrun call', async function () {
    const dr = new algosdk.modelsv2.DryrunRequest({});
    dryrunResponse = await this.v2Client.dryrun(dr).do();
  });

  Then(
    'the parsed Dryrun Response should have global delta {string} with {int}',
    (key, action) => {
      assert.strictEqual(dryrunResponse.txns[0]['global-delta'][0].key, key);
      assert.strictEqual(
        dryrunResponse.txns[0]['global-delta'][0].value.action,
        action
      );
    }
  );

  When('I dryrun a {string} program {string}', async function (kind, program) {
    const data = await loadResource(program);
    const algoTxn = new algosdk.Transaction({
      from: 'UAPJE355K7BG7RQVMTZOW7QW4ICZJEIC3RZGYG5LSHZ65K6LCNFPJDSR7M',
      fee: 1000,
      amount: 1000,
      firstRound: 1,
      lastRound: 1000,
      type: 'pay',
      genesisHash: 'ZIkPs8pTDxbRJsFB1yJ7gvnpDu0Q85FRkl2NCkEAQLU=',
    });
    let txns;
    let sources;

    switch (kind) {
      case 'compiled':
        txns = [
          {
            lsig: algosdk.makeLogicSig(data),
            txn: algoTxn,
          },
        ];
        break;
      case 'source':
        txns = [
          {
            txn: algoTxn,
          },
        ];
        sources = [
          new algosdk.modelsv2.DryrunSource('lsig', data.toString('utf8'), 0),
        ];
        break;
      default:
        throw Error(`kind ${kind} not in (source, compiled)`);
    }

    const dr = new algosdk.modelsv2.DryrunRequest({
      txns,
      sources,
    });
    dryrunResponse = await this.v2Client.dryrun(dr).do();
  });

  Then('I get execution result {string}', (result) => {
    let msgs;
    const res = dryrunResponse.txns[0];
    if (
      res['logic-sig-messages'] !== undefined &&
      res['logic-sig-messages'].length > 0
    ) {
      msgs = res['logic-sig-messages'];
    } else if (
      res['app-call-messages'] !== undefined &&
      res['app-call-messages'].length > 0
    ) {
      msgs = res['app-call-messages'];
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
      compileStatusCode = e.response.statusCode;
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
        Buffer.from(compileResponse.result, 'base64')
      );
      assert.deepStrictEqual(makeUint8Array(data), decodedResult);
    }
  );

  /// /////////////////////////////////
  // TealSign tests
  /// /////////////////////////////////

  Given('base64 encoded data to sign {string}', function (data) {
    this.data = Buffer.from(data, 'base64');
  });

  Given('program hash {string}', function (contractAddress) {
    this.contractAddress = contractAddress;
  });

  Given('base64 encoded program {string}', function (programEncoded) {
    const program = Buffer.from(programEncoded, 'base64');
    const lsig = algosdk.makeLogicSig(program);
    this.contractAddress = lsig.address();
  });

  Given('base64 encoded private key {string}', function (keyEncoded) {
    const seed = Buffer.from(keyEncoded, 'base64');
    const keys = keyPairFromSeed(seed);
    this.sk = keys.secretKey;
  });

  When('I perform tealsign', function () {
    this.sig = algosdk.tealSign(this.sk, this.data, this.contractAddress);
  });

  Then('the signature should be equal to {string}', function (expectedEncoded) {
    const expected = makeUint8Array(Buffer.from(expectedEncoded, 'base64'));
    assert.deepStrictEqual(this.sig, expected);
  });

  /// /////////////////////////////////
  // begin application test helpers
  /// /////////////////////////////////

  Given(
    'a signing account with address {string} and mnemonic {string}',
    function (address, mnemonic) {
      this.signingAccount = algosdk.mnemonicToSecretKey(mnemonic);
      if (this.signingAccount.addr !== address) {
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
        from,
        to,
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
      const toSign = Buffer.concat([
        Buffer.from('appID'),
        algosdk.encodeUint64(appID),
      ]);
      const expected = algosdk.encodeAddress(
        makeUint8Array(genericHash(toSign))
      );
      const actual = algosdk.getApplicationAddress(appID);
      assert.strictEqual(expected, actual);
    }
  );

  Given(
    "I fund the current application's address with {int} microalgos.",
    async function (amount) {
      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstRound === 0) sp.firstRound = 1;
      const fundingTxnArgs = {
        from: this.accounts[0],
        to: algosdk.getApplicationAddress(this.currentApplicationIndex),
        amount,
        suggestedParams: sp,
      };
      const stxn = await this.kcl.signTransaction(
        this.handle,
        this.wallet_pswd,
        fundingTxnArgs
      );

      const fundingResponse = await this.v2Client.sendRawTransaction(stxn).do();
      const info = await algosdk.waitForConfirmation(
        this.v2Client,
        fundingResponse.txId,
        1
      );
      assert.ok(info['confirmed-round'] > 0);
    }
  );

  Given(
    'suggested transaction parameters fee {int}, flat-fee {string}, first-valid {int}, last-valid {int}, genesis-hash {string}, genesis-id {string}',
    function (fee, flatFee, firstRound, lastRound, genesisHash, genesisID) {
      assert.ok(['true', 'false'].includes(flatFee));

      this.suggestedParams = {
        flatFee: flatFee === 'true',
        fee,
        firstRound,
        lastRound,
        genesisID,
        genesisHash,
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

      this.txn = algosdk.makeKeyRegistrationTxnWithSuggestedParams(
        sender,
        undefined,
        votePk.length ? votePk : undefined,
        selectionPk.length ? selectionPk : undefined,
        voteFirst,
        voteLast,
        keyDilution,
        this.suggestedParams,
        undefined,
        nonpart === 'true',
        stateProofPk.length ? stateProofPk : undefined
      );
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
          Buffer.from(compiledResponse.result, 'base64')
        );
        return compiledProgram;
      } catch (err) {
        throw new Error(`could not compile teal program: ${err}`);
      }
    }
    return makeUint8Array(data);
  }

  function splitAndProcessAppArgs(inArgs) {
    const splitArgs = inArgs.split(',');
    const subArgs = [];
    splitArgs.forEach((subArg) => {
      subArgs.push(subArg.split(':'));
    });
    const appArgs = [];
    subArgs.forEach((subArg) => {
      switch (subArg[0]) {
        case 'str':
          appArgs.push(makeUint8Array(Buffer.from(subArg[1])));
          break;
        case 'int':
          appArgs.push(makeUint8Array([parseInt(subArg[1])]));
          break;
        case 'addr':
          appArgs.push(algosdk.decodeAddress(subArg[1]).publicKey);
          break;
        case 'b64':
          appArgs.push(Buffer.from(subArg[1], 'base64'));
          break;
        default:
          throw Error(`did not recognize app arg of type${subArg[0]}`);
      }
    });
    return appArgs;
  }

  When(
    'I build an application transaction with operation {string}, application-id {int}, sender {string}, approval-program {string}, clear-program {string}, global-bytes {int}, global-ints {int}, local-bytes {int}, local-ints {int}, app-args {string}, foreign-apps {string}, foreign-assets {string}, app-accounts {string}, fee {int}, first-valid {int}, last-valid {int}, genesis-hash {string}, extra-pages {int}',
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
      extraPages
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
      // build suggested params object
      const sp = {
        genesisHash: genesisHashBase64,
        firstRound: firstValid,
        lastRound: lastValid,
        fee,
        flatFee: true,
      };

      switch (operationString) {
        case 'call':
          this.txn = algosdk.makeApplicationNoOpTxn(
            sender,
            sp,
            appIndex,
            appArgs,
            appAccounts,
            foreignApps,
            foreignAssets
          );
          return;
        case 'create':
          this.txn = algosdk.makeApplicationCreateTxn(
            sender,
            sp,
            operation,
            approvalProgramBytes,
            clearProgramBytes,
            numLocalInts,
            numLocalByteSlices,
            numGlobalInts,
            numGlobalByteSlices,
            appArgs,
            appAccounts,
            foreignApps,
            foreignAssets,
            undefined,
            undefined,
            undefined,
            extraPages
          );
          return;
        case 'update':
          this.txn = algosdk.makeApplicationUpdateTxn(
            sender,
            sp,
            appIndex,
            approvalProgramBytes,
            clearProgramBytes,
            appArgs,
            appAccounts,
            foreignApps,
            foreignAssets
          );
          return;
        case 'optin':
          this.txn = algosdk.makeApplicationOptInTxn(
            sender,
            sp,
            appIndex,
            appArgs,
            appAccounts,
            foreignApps,
            foreignAssets
          );
          return;
        case 'delete':
          this.txn = algosdk.makeApplicationDeleteTxn(
            sender,
            sp,
            appIndex,
            appArgs,
            appAccounts,
            foreignApps,
            foreignAssets
          );
          return;
        case 'clear':
          this.txn = algosdk.makeApplicationClearStateTxn(
            sender,
            sp,
            appIndex,
            appArgs,
            appAccounts,
            foreignApps,
            foreignAssets
          );
          return;
        case 'closeout':
          this.txn = algosdk.makeApplicationCloseOutTxn(
            sender,
            sp,
            appIndex,
            appArgs,
            appAccounts,
            foreignApps,
            foreignAssets
          );
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
      const actualBase64 = Buffer.from(this.stx).toString('base64');
      assert.strictEqual(actualBase64, base64golden);
    }
  );

  Then('the decoded transaction should equal the original', function () {
    const decoded = algosdk.decodeSignedTransaction(this.stx);
    // comparing the output of get_obj_for_encoding instead because the Transaction class instance
    // may have some nonconsequential differences in internal representation
    assert.deepStrictEqual(
      decoded.txn.get_obj_for_encoding(),
      this.txn.get_obj_for_encoding()
    );
  });

  Given(
    'an algod v2 client connected to {string} port {int} with token {string}',
    function (host, port, token) {
      let mutableHost = host;

      if (!mutableHost.startsWith('http')) {
        mutableHost = `http://${mutableHost}`;
      }

      if (port !== undefined && port !== '') mutableHost += `:${port}`;

      this.v2Client = new algosdk.Algodv2(token, mutableHost, {});
    }
  );

  Given(
    'I create a new transient account and fund it with {int} microalgos.',
    async function (fundingAmount) {
      this.transientAccount = algosdk.generateAccount();

      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstRound === 0) sp.firstRound = 1;
      const fundingTxnArgs = {
        from: this.accounts[0],
        to: this.transientAccount.addr,
        amount: fundingAmount,
        suggestedParams: sp,
      };
      const stxKmd = await this.kcl.signTransaction(
        this.handle,
        this.wallet_pswd,
        fundingTxnArgs
      );
      const fundingResponse = await this.v2Client
        .sendRawTransaction(stxKmd)
        .do();
      const info = await algosdk.waitForConfirmation(
        this.v2Client,
        fundingResponse.txId,
        1
      );
      assert.ok(info['confirmed-round'] > 0);
    }
  );

  Given(
    'I build an application transaction with the transient account, the current application, suggested params, operation {string}, approval-program {string}, clear-program {string}, global-bytes {int}, global-ints {int}, local-bytes {int}, local-ints {int}, app-args {string}, foreign-apps {string}, foreign-assets {string}, app-accounts {string}, extra-pages {int}',
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
      extraPages
    ) {
      if (operationString === 'create') {
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
      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstRound === 0) sp.firstRound = 1;
      const o = {
        type: 'appl',
        from: this.transientAccount.addr,
        suggestedParams: sp,
        appIndex: this.currentApplicationIndex,
        appOnComplete: operation,
        appLocalInts: numLocalInts,
        appLocalByteSlices: numLocalByteSlices,
        appGlobalInts: numGlobalInts,
        appGlobalByteSlices: numGlobalByteSlices,
        appApprovalProgram: approvalProgramBytes,
        appClearProgram: clearProgramBytes,
        appArgs,
        appAccounts,
        appForeignApps: foreignApps,
        appForeignAssets: foreignAssets,
        extraPages,
      };
      this.txn = new algosdk.Transaction(o);
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
          // error was expected. check that err.response.text includes expected string.
          const errorContainsString = err.response.text.includes(errorString);
          assert.deepStrictEqual(true, errorContainsString);
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
      this.appTxid.txId,
      1
    );
    assert.ok(info['confirmed-round'] > 0);
  });

  Given('I reset the array of application IDs to remember.', async function () {
    this.appIDs = [];
  });

  Given('I remember the new application ID.', async function () {
    const info = await this.v2Client
      .pendingTransactionInformation(this.appTxid.txId)
      .do();
    this.currentApplicationIndex = info['application-index'];

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
      stateKey,
      stateValue
    ) {
      const accountInfo = await this.v2Client
        .accountInformation(this.transientAccount.addr)
        .do();
      const appTotalSchema = accountInfo['apps-total-schema'];
      assert.strictEqual(appTotalSchema['num-byte-slice'], numByteSlices);
      assert.strictEqual(appTotalSchema['num-uint'], numUints);

      const appCreated = appCreatedBoolAsString === 'true';
      const createdApps = accountInfo['created-apps'];
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
          foundApp || createdApps[i].id === this.currentApplicationIndex;
      }
      assert.ok(foundApp);

      // If there is no key to check, we're done.
      if (stateKey === '') {
        return;
      }

      let foundValueForKey = false;
      let keyValues = [];
      if (applicationState === 'local') {
        let counter = 0;
        for (let i = 0; i < accountInfo['apps-local-state'].length; i++) {
          const localState = accountInfo['apps-local-state'][i];
          if (localState.id === this.currentApplicationIndex) {
            keyValues = localState['key-value'];
            counter += 1;
          }
        }
        assert.strictEqual(counter, 1);
      } else if (applicationState === 'global') {
        let counter = 0;
        for (let i = 0; i < accountInfo['created-apps'].length; i++) {
          const createdApp = accountInfo['created-apps'][i];
          if (createdApp.id === this.currentApplicationIndex) {
            keyValues = createdApp.params['global-state'];
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
        if (foundKey === stateKey) {
          foundValueForKey = true;
          const foundValue = keyValue.value;
          if (foundValue.type === 1) {
            assert.strictEqual(foundValue.bytes, stateValue);
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
        Buffer.from(expectedSelectorHex, 'hex')
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
          args.push(makeUint8Array(Buffer.from(b64Arg, 'base64')));
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
    note
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
        undefined
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
        parseInt(extraPages, 10)
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
        parseInt(extraPages, 10)
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
      const nonce = makeUint8Array(Buffer.from(this.nonce));
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
        nonce
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
        .map((b64SignedTxn) => Buffer.from(b64SignedTxn, 'base64'));

      const actualSignedTxns = this.composerSignedTransactions.map(
        (signedTxn) => Buffer.from(signedTxn)
      );
      assert.deepStrictEqual(
        [...actualSignedTxns],
        [...expectedSignedTxns],
        `Got ${actualSignedTxns
          .map((stxn) => stxn.toString('base64'))
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
        const expectedReturnValue = Buffer.from(
          b64ExpectedReturnValues[i],
          'base64'
        );

        if (actualResult.decodeError) {
          throw actualResult.decodeError;
        }
        assert.deepStrictEqual(
          Buffer.from(actualResult.rawReturnValue),
          expectedReturnValue,
          `Actual return value for method at index ${i} does not match expected. Actual: ${Buffer.from(
            actualResult.rawReturnValue
          ).toString('base64')}`
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
      const actualResult = this.composerExecuteResponse.methodResults[
        resultIndex
      ];
      const resultArray = methodReturnType.decode(actualResult.rawReturnValue);
      assert.strictEqual(resultArray.length, 2);
      const [randomIntResult, witnessResult] = resultArray;

      // Check the random int against the witness
      const witnessHash = genericHash(witnessResult).slice(0, 8);
      const witness = algosdk.bytesToBigInt(witnessHash);
      const quotient = witness % BigInt(methodArg);
      assert.strictEqual(quotient, randomIntResult);
    }
  );

  Then(
    'The {int}th atomic result for randElement\\({string}) proves correct',
    function (resultIndex, methodArg) {
      // Return format for randElement method
      const methodReturnType = algosdk.ABIType.from('(byte,byte[17])');
      const actualResult = this.composerExecuteResponse.methodResults[
        resultIndex
      ];
      const resultArray = methodReturnType.decode(actualResult.rawReturnValue);
      assert.strictEqual(resultArray.length, 2);
      const [randomResult, witnessResult] = resultArray;

      // Check the random character against the witness
      const witnessHash = genericHash(witnessResult).slice(0, 8);
      const witness = algosdk.bytesToBigInt(witnessHash);
      const quotient = witness % BigInt(methodArg.length);
      assert.strictEqual(
        methodArg[quotient],
        Buffer.from(makeUint8Array([randomResult])).toString('utf-8')
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
      let actualResult = this.composerExecuteResponse.methodResults[index]
        .txInfo;
      actualResult = glom(actualResult, pathString);

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
            actualResults = actualResults['inner-txns'][itxnIndex];
          }

          const thisGroupID = actualResults.txn.txn.group;
          if (j === 0) {
            groupID = thisGroupID;
          } else {
            assert.strictEqual(groupID, thisGroupID);
          }
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
      spin = Buffer.from(spin).toString('utf-8');

      assert.ok(spin.match(regexString));
    }
  );

  Given(
    'a dryrun response file {string} and a transaction at index {string}',
    async function (drrFile, txId) {
      const drContents = await loadResource(drrFile);
      const js = parseJSON(drContents);
      const drr = new algosdk.DryrunResult(js);
      this.txtrace = drr.txns[parseInt(txId)];
    }
  );

  Then('calling app trace produces {string}', async function (expected) {
    const traceString = this.txtrace.appTrace();
    const expectedString = (await loadResource(expected)).toString();
    assert.equal(traceString, expectedString);
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

  Given('a source map json file {string}', async function (srcmap) {
    const js = parseJSON(await loadResource(srcmap));
    this.sourcemap = new algosdk.SourceMap(js);
  });

  Then(
    'the string composed of pc:line number equals {string}',
    function (mapping) {
      const buff = Object.entries(this.sourcemap.pcToLine).map(
        ([pc, line]) => `${pc}:${line}`
      );
      assert.equal(buff.join(';'), mapping);
    }
  );

  Then(
    'getting the line associated with a pc {string} equals {string}',
    function (pc, expectedLine) {
      const actualLine = this.sourcemap.getLineForPc(parseInt(pc));
      assert.equal(actualLine, parseInt(expectedLine));
    }
  );

  Then(
    'getting the last pc associated with a line {string} equals {string}',
    function (line, expectedPc) {
      const actualPcs = this.sourcemap.getPcsForLine(parseInt(line));
      assert.equal(actualPcs.pop(), parseInt(expectedPc));
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
      this.rawSourceMap = JSON.stringify(compiledResponse.sourcemap);
    }
  );

  Then(
    'the resulting source map is the same as the json {string}',
    async function (expectedJsonPath) {
      const expected = await loadResource(expectedJsonPath);
      assert.equal(this.rawSourceMap, expected.toString().trim());
    }
  );

  When(
    'we make a GetLightBlockHeaderProof call for round {int}',
    async function (int) {
      await this.v2Client.getLightBlockHeaderProof(int).do();
    }
  );

  When('we make a GetStateProof call for round {int}', async function (int) {
    await this.v2Client.getStateProof(int).do();
  });

  Given(
    'a base64 encoded program bytes for heuristic sanity check {string}',
    async function (programByteStr) {
      this.seeminglyProgram = new Uint8Array(
        Buffer.from(programByteStr, 'base64')
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

  if (!options.ignoreReturn) {
    return steps;
  }

  return undefined;
};
