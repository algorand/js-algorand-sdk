/* eslint-disable func-names,radix */
const assert = require('assert');
const sha256 = require('js-sha256');
const fs = require('fs');
const path = require('path');
const nacl = require('../../../src/nacl/naclWrappers');
const algosdk = require('../../../index');

const maindir = path.dirname(path.dirname(path.dirname(__dirname)));

function keyPairFromSecretKey(sk) {
  return nacl.keyPairFromSecretKey(sk);
}

function keyPairFromSeed(seed) {
  return nacl.keyPairFromSeed(seed);
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

/**
 * This function must be used instead of creating Uint8Arrays directly because of this firefox
 * issue: https://github.com/mozilla/geckodriver/issues/1798
 */
function makeUint8Array(arg) {
  return new Uint8Array(arg);
}

/**
 * This function must be used instead of creating an empty object for use in assert.deepStructEqual
 * because of this firefox issue: https://github.com/mozilla/geckodriver/issues/1798
 */
function makeEmptyObject() {
  return {};
}

function formatIncludeAll(includeAll) {
  if (!['true', 'false'].includes(includeAll)) {
    throw new Error(`Unknown value for includeAll: ${includeAll}`);
  }

  return includeAll === 'true';
}

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

  When('I create the payment transaction', function () {
    this.txn = {
      from: this.pk,
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
    assert.deepStrictEqual(health, makeEmptyObject());
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

  Then('I get transactions by address only', async function () {
    const transactions = await this.acl.transactionByAddress(this.accounts[0]);
    assert.deepStrictEqual(
      true,
      Object.entries(transactions).length === 0 ||
        'transactions' in transactions
    );
  });

  Then('I get transactions by address and date', async function () {
    const transactions = await this.acl.transactionByAddressAndDate(
      this.accounts[0]
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
    let info = await this.acl.pendingTransactionInformation(this.txid);
    assert.deepStrictEqual(true, 'type' in info);
    // let localParams = await this.acl.getTransactionParams();
    // this.lastRound = localParams.lastRound;
    await this.acl.statusAfterBlock(this.lastRound + 2);
    info = await this.acl.transactionById(this.txid);
    assert.deepStrictEqual(true, 'type' in info);
  });

  Then('I can get the transaction by ID', async function () {
    await this.acl.statusAfterBlock(this.lastRound + 2);
    const info = await this.acl.transactionById(this.txid);
    assert.deepStrictEqual(true, 'type' in info);
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
    'key registration transaction parameters {int} {int} {int} {string} {string} {string} {int} {int} {int} {string} {string}',
    function (
      fee,
      fv,
      lv,
      gh,
      votekey,
      selkey,
      votefst,
      votelst,
      votekd,
      gen,
      note
    ) {
      this.fee = parseInt(fee);
      this.fv = parseInt(fv);
      this.lv = parseInt(lv);
      this.gh = gh;
      if (gen !== 'none') {
        this.gen = gen;
      }
      if (note !== 'none') {
        this.note = makeUint8Array(Buffer.from(note, 'base64'));
      }
      this.votekey = votekey;
      this.selkey = selkey;
      this.votefst = votefst;
      this.votelst = votelst;
      this.votekd = votekd;
    }
  );

  When('I create the key registration transaction', function () {
    this.txn = {
      fee: this.fee,
      firstRound: this.fv,
      lastRound: this.lv,
      genesisHash: this.gh,
      voteKey: this.votekey,
      selectionKey: this.selkey,
      voteFirst: this.votefst,
      voteLast: this.votelst,
      voteKeyDilution: this.votekd,
      type: 'keyreg',
    };
    if (this.gen) {
      this.txn.genesisID = this.gen;
    }
    if (this.note) {
      this.txn.note = this.note;
    }
  });

  When(
    'I get recent transactions, limited by {int} transactions',
    function (int) {
      this.acl.transactionByAddress(this.accounts[0], parseInt(int));
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
  // begin teal contract template tests
  /// /////////////////////////////////

  Given('contract test fixture', function () {
    this.contractTestFixture = {
      split: undefined,
      htlc: undefined,
      periodicPay: undefined,
      limitOrder: undefined,
      dynamicFee: undefined,
      activeAddress: '',
      htlcPreimage: '',
      limitOrderN: 0,
      limitOrderD: 0,
      limitOrderMin: 0,
      splitRat1: 0,
      splitRat2: 0,
      splitMin: 0,
      contractFundAmount: 0,
      periodicPayPeriod: 0,
    };
  });

  When('I fund the contract account', async function () {
    const amount = this.contractTestFixture.contractFundAmount;
    const from = this.accounts[0];
    const to = this.contractTestFixture.activeAddress;
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    if (this.fv === 0) {
      this.fv = 1;
    }
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    this.txn = {
      from,
      to,
      fee: this.fee,
      amount,
      firstRound: this.fv,
      lastRound: this.lv,
      genesisHash: this.gh,
      type: 'pay',
    };
    const stxKmd = await this.kcl.signTransaction(
      this.handle,
      this.wallet_pswd,
      this.txn
    );
    this.txid = await this.acl.sendRawTransaction(stxKmd);
    this.txid = this.txid.txId;
    await this.acl.statusAfterBlock(this.lastRound + 2);
    let info = await this.acl.transactionInformation(from, this.txid);
    assert.deepStrictEqual(true, 'type' in info);
    info = await this.acl.transactionById(this.txid);
    assert.deepStrictEqual(true, 'type' in info);
  });

  Given(
    'a split contract with ratio {int} to {int} and minimum payment {int}',
    function (rat2, rat1, minPay) {
      const owner = this.accounts[0];
      const receivers = [this.accounts[0], this.accounts[1]];
      const expiryRound = 100;
      const maxFee = 5000000;
      this.contractTestFixture.splitRat1 = parseInt(rat1);
      this.contractTestFixture.splitRat2 = parseInt(rat2);
      this.contractTestFixture.splitMin = parseInt(minPay);
      this.contractTestFixture.split = new algosdk.LogicTemplates.Split(
        owner,
        receivers[0],
        receivers[1],
        this.contractTestFixture.splitRat1,
        this.contractTestFixture.splitRat2,
        expiryRound,
        this.contractTestFixture.splitMin,
        maxFee
      );
      this.contractTestFixture.activeAddress = this.contractTestFixture.split.getAddress();
      this.contractTestFixture.contractFundAmount = minPay * (rat1 + rat2) * 10;
    }
  );

  When('I send the split transactions', async function () {
    const contractCode = this.contractTestFixture.split.getProgram();
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    const amount =
      this.contractTestFixture.splitMin *
      (this.contractTestFixture.splitRat1 + this.contractTestFixture.splitRat2);
    const txnBytes = algosdk.LogicTemplates.getSplitFundsTransaction(
      contractCode,
      amount,
      this.fv,
      this.lv,
      this.fee,
      this.params.genesishashb64
    );
    this.txid = await this.acl.sendRawTransaction(txnBytes);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
  });

  Given(
    'an HTLC contract with hash preimage {string}',
    function (preimageStringB64) {
      // Write code here that turns the phrase above into concrete actions
      this.contractTestFixture.htlcPreimage = preimageStringB64;
      const preimageBytes = Buffer.from(preimageStringB64, 'base64');
      const hash = sha256.create();
      hash.update(preimageBytes);
      const hashB64String = Buffer.from(hash.hex(), 'hex').toString('base64');
      const hashFn = 'sha256';
      const owner = this.accounts[0];
      const receiver = this.accounts[1];
      const expiryRound = 100;
      const maxFee = 1000000;
      this.contractTestFixture.htlc = new algosdk.LogicTemplates.HTLC(
        owner,
        receiver,
        hashFn,
        hashB64String,
        expiryRound,
        maxFee
      );
      this.contractTestFixture.activeAddress = this.contractTestFixture.htlc.getAddress();
      this.contractTestFixture.contractFundAmount = 100000000;
    }
  );

  When('I claim the algos', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    const payTxn = {
      from: this.contractTestFixture.htlc.getAddress(),
      to: this.accounts[1],
      closeRemainderTo: this.accounts[1],
      fee: this.fee,
      amount: 0,
      firstRound: this.fv,
      lastRound: this.lv,
      genesisHash: this.params.genesishashb64,
      type: 'pay',
    };
    const txnBytes = algosdk.LogicTemplates.signTransactionWithHTLCUnlock(
      this.contractTestFixture.htlc.getProgram(),
      payTxn,
      this.contractTestFixture.htlcPreimage
    );
    this.txid = await this.acl.sendRawTransaction(txnBytes.blob);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
  });

  Given(
    'a periodic payment contract with withdrawing window {int} and period {int}',
    function (withdrawWindow, period) {
      const receiver = this.accounts[0];
      const amount = 10000000;
      const expiryRound = 100;
      const maxFee = 1000000000000;
      this.contractTestFixture.periodicPay = new algosdk.LogicTemplates.PeriodicPayment(
        receiver,
        amount,
        parseInt(withdrawWindow),
        parseInt(period),
        expiryRound,
        maxFee,
        undefined
      );
      this.contractTestFixture.activeAddress = this.contractTestFixture.periodicPay.getAddress();
      this.contractTestFixture.contractFundAmount = amount * 10;
      this.contractTestFixture.periodicPayPeriod = parseInt(period);
    }
  );

  When('I claim the periodic payment', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    const remainder = this.fv % this.contractTestFixture.periodicPayPeriod;
    this.fv += remainder;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;
    const txnBytes = algosdk.LogicTemplates.getPeriodicPaymentWithdrawalTransaction(
      this.contractTestFixture.periodicPay.getProgram(),
      this.fee,
      this.fv,
      this.gh
    );
    this.txid = await this.acl.sendRawTransaction(txnBytes.blob);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
  });

  Given(
    'a limit order contract with parameters {int} {int} {int}',
    function (ratn, ratd, minTrade) {
      const maxFee = 100000;
      const expiryRound = 100;
      this.contractTestFixture.limitOrderN = parseInt(ratn);
      this.contractTestFixture.limitOrderD = parseInt(ratd);
      this.contractTestFixture.limitOrderMin = parseInt(minTrade);
      this.contractTestFixture.contractFundAmount = 2 * parseInt(minTrade);
      if (this.contractTestFixture.contractFundAmount < 1000000) {
        this.contractTestFixture.contractFundAmount = 1000000;
      }
      const assetid = parseInt(this.assetTestFixture.index);
      this.contractTestFixture.limitOrder = new algosdk.LogicTemplates.LimitOrder(
        this.accounts[0],
        assetid,
        parseInt(ratn),
        parseInt(ratd),
        expiryRound,
        parseInt(minTrade),
        maxFee
      );
      this.contractTestFixture.activeAddress = this.contractTestFixture.limitOrder.getAddress();
    }
  );

  When('I swap assets for algos', async function () {
    const response = await this.kcl.exportKey(
      this.handle,
      this.wallet_pswd,
      this.accounts[1]
    );
    const secretKey = response.private_key;
    const microAlgoAmount = this.contractTestFixture.limitOrderMin + 1; // just over the minimum
    const assetAmount =
      Math.floor(
        (microAlgoAmount * this.contractTestFixture.limitOrderN) /
          this.contractTestFixture.limitOrderD
      ) + 1;
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;
    const txnBytes = algosdk.LogicTemplates.getSwapAssetsTransaction(
      this.contractTestFixture.limitOrder.getProgram(),
      assetAmount,
      microAlgoAmount,
      secretKey,
      this.fee,
      this.fv,
      this.lv,
      this.gh
    );
    this.txid = await this.acl.sendRawTransaction(txnBytes);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
  });

  Given('a dynamic fee contract with amount {int}', async function (amount) {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    if (this.fv === 0) {
      this.fv = 1;
    }
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;
    this.contractTestFixture.contractFundAmount = parseInt(amount);
    this.contractTestFixture.dynamicFee = new algosdk.LogicTemplates.DynamicFee(
      this.accounts[1],
      parseInt(amount),
      this.fv,
      this.lv
    ); // intentionally leave optional args undefined
    this.contractTestFixture.activeAddress = this.contractTestFixture.dynamicFee.getAddress();
  });

  Given('I send the dynamic fee transactions', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    if (this.fv === 0) {
      this.fv = 1;
    }
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;

    const firstResponse = await this.kcl.exportKey(
      this.handle,
      this.wallet_pswd,
      this.accounts[0]
    );
    const secretKeyOne = firstResponse.private_key;
    const txnAndLsig = algosdk.LogicTemplates.signDynamicFee(
      this.contractTestFixture.dynamicFee.getProgram(),
      secretKeyOne,
      this.gh
    );
    const secondResponse = await this.kcl.exportKey(
      this.handle,
      this.wallet_pswd,
      this.accounts[1]
    );
    const secretKeyTwo = secondResponse.private_key;
    const txnBytes = algosdk.LogicTemplates.getDynamicFeeTransactions(
      txnAndLsig.txn,
      txnAndLsig.lsig,
      secretKeyTwo,
      this.fee
    );
    this.txid = await this.acl.sendRawTransaction(txnBytes);
    this.txid = this.txid.txId;
    [this.pk] = this.accounts;
  });

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

  Given(
    'mock http responses in {string} loaded from {string}',
    function (expectedBody) {
      if (expectedBody !== null) {
        expectedMockResponse = expectedBody;
      }
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
    function (expectedBody, status) {
      if (expectedBody !== null) {
        expectedMockResponse = expectedBody;
      }
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
    async function (client, _endpoint) {
      try {
        if (client === 'algod') {
          // endpoints are ignored by mock server, see setupMockServerForResponses
          this.actualMockResponse = await this.v2Client.status().do();
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
          if (!err.toString().includes('Internal Server Error')) {
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
      assert.strictEqual(
        JSON.stringify(JSON.parse(expectedMockResponse)),
        JSON.stringify(this.actualMockResponse)
      );
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
    'we make a Pending Transaction Information against txid {string} with max {int}',
    function (txid, max) {
      this.v2Client.pendingTransactionInformation(txid).max(max).do();
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
    'we make an Account Information call against account {string}',
    async function (account) {
      await this.v2Client.accountInformation(account).do();
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
    'we make a Lookup Asset Balances call against asset index {int} with limit {int} nextToken {string} round {int} currencyGreaterThan {int} currencyLessThan {int}',
    async function (
      index,
      limit,
      nextToken,
      round,
      currencyGreater,
      currencyLesser
    ) {
      await this.indexerClient
        .lookupAssetBalances(index)
        .limit(limit)
        .round(round)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .nextToken(nextToken)
        .do();
    }
  );

  When(
    'we make a Lookup Asset Balances call against asset index {int} with limit {int} afterAddress {string} round {int} currencyGreaterThan {int} currencyLessThan {int}',
    async function (
      index,
      limit,
      afterAddress,
      round,
      currencyGreater,
      currencyLesser
    ) {
      await this.indexerClient
        .lookupAssetBalances(index)
        .limit(limit)
        .round(round)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .do();
    }
  );

  When(
    'we make a Lookup Asset Transactions call against asset index {int} with NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {int} afterTime {int} currencyGreaterThan {int} currencyLessThan {int} address {string} addressRole {string} ExcluseCloseTo {string}',
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
    'we make a Lookup Asset by ID call against asset index {int}',
    async function (assetIndex) {
      await this.indexerClient.lookupAssetByID(assetIndex).do();
    }
  );

  When(
    'we make a LookupApplications call with {int} and {int}',
    async function (index, round) {
      await this.indexerClient.lookupApplications(index).round(round).do();
    }
  );

  When(
    'we make a LookupApplicationLogsByID call with applicationID {int} limit {int} minRound {int} maxRound {int} nextToken {string} sender {string} and txID {string}',
    async function (appID, limit, minRound, maxRound, nextToken, sender, txID) {
      await this.indexerClient
        .lookupApplicationLogs(appID)
        .limit(limit)
        .minRound(minRound)
        .maxRound(maxRound)
        .nextToken(nextToken)
        .sender(sender)
        .txid(txID)
        .do();
    }
  );

  When(
    'we make a Search Accounts call with assetID {int} limit {int} currencyGreaterThan {int} currencyLessThan {int} and nextToken {string}',
    async function (
      assetIndex,
      limit,
      currencyGreater,
      currencyLesser,
      nextToken
    ) {
      await this.indexerClient
        .searchAccounts()
        .assetID(assetIndex)
        .limit(limit)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .nextToken(nextToken)
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
    'we make a Search For Transactions call with account {string} NotePrefix {string} TxType {string} SigType {string} txid {string} round {int} minRound {int} maxRound {int} limit {int} beforeTime {int} afterTime {int} currencyGreaterThan {int} currencyLessThan {int} assetIndex {int} addressRole {string} ExcluseCloseTo {string}',
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
    'we make a SearchForApplications call with {int} and {int}',
    async function (index, round) {
      await this.indexerClient
        .searchForApplications()
        .index(index)
        .round(round)
        .do();
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
    'we make a SearchForAssets call with limit {int} creator {string} name {string} unit {string} index {int} and nextToken {string}',
    async function (limit, creator, name, unit, index, nextToken) {
      await this.indexerClient
        .searchForAssets()
        .limit(limit)
        .creator(creator)
        .name(name)
        .unit(unit)
        .index(index)
        .nextToken(nextToken)
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
  // begin indexer and integration tests
  /// /////////////////////////////////

  const indexerIntegrationClients = {};

  Given(
    'indexer client {int} at {string} port {int} with token {string}',
    (clientNum, indexerHost, indexerPort, indexerToken) => {
      let mutableIndexerHost = indexerHost;

      if (!mutableIndexerHost.startsWith('http')) {
        mutableIndexerHost = `http://${mutableIndexerHost}`;
      }
      indexerIntegrationClients[clientNum] = new algosdk.Indexer(
        indexerToken,
        mutableIndexerHost,
        indexerPort,
        {}
      );
    }
  );

  When('I use {int} to check the services health', async (clientNum) => {
    const ic = indexerIntegrationClients[clientNum];
    await ic.makeHealthCheck().do();
  });

  Then('I receive status code {int}', async (code) => {
    // Currently only supports the good case. code != 200 should throw an exception.
    assert.strictEqual(code, 200);
  });

  let integrationBlockResponse;

  When('I use {int} to lookup block {int}', async (clientNum, blockNum) => {
    const ic = indexerIntegrationClients[clientNum];
    integrationBlockResponse = await ic.lookupBlock(blockNum).do();
  });

  Then(
    'The block was confirmed at {int}, contains {int} transactions, has the previous block hash {string}',
    (timestamp, numTransactions, prevHash) => {
      assert.strictEqual(timestamp, integrationBlockResponse.timestamp);
      assert.strictEqual(
        numTransactions,
        integrationBlockResponse.transactions.length
      );
      assert.strictEqual(
        prevHash,
        integrationBlockResponse['previous-block-hash']
      );
    }
  );

  let integrationLookupAccountResponse;

  When(
    'I use {int} to lookup account {string} at round {int}',
    async (clientNum, account, round) => {
      const ic = indexerIntegrationClients[clientNum];
      integrationLookupAccountResponse = await ic
        .lookupAccountByID(account)
        .round(round)
        .do();
    }
  );

  Then(
    'The account has {int} assets, the first is asset {int} has a frozen status of {string} and amount {int}.',
    (numAssets, firstAssetIndex, firstAssetFrozenStatus, firstAssetAmount) => {
      const firstAssetFrozenBool = firstAssetFrozenStatus === 'true';
      assert.strictEqual(
        numAssets,
        integrationLookupAccountResponse.account.assets.length
      );
      if (numAssets === 0) {
        return;
      }
      const scrutinizedAsset =
        integrationLookupAccountResponse.account.assets[0];
      assert.strictEqual(firstAssetIndex, scrutinizedAsset['asset-id']);
      assert.strictEqual(firstAssetFrozenBool, scrutinizedAsset['is-frozen']);
      assert.strictEqual(firstAssetAmount, scrutinizedAsset.amount);
    }
  );

  Then(
    'The account created {int} assets, the first is asset {int} is named {string} with a total amount of {int} {string}',
    (
      numCreatedAssets,
      firstCreatedAssetIndex,
      assetName,
      assetIssuance,
      assetUnit
    ) => {
      assert.strictEqual(
        numCreatedAssets,
        integrationLookupAccountResponse.account['created-assets'].length
      );
      const scrutinizedAsset =
        integrationLookupAccountResponse.account['created-assets'][0];
      assert.strictEqual(firstCreatedAssetIndex, scrutinizedAsset.index);
      assert.strictEqual(assetName, scrutinizedAsset.params.name);
      assert.strictEqual(assetIssuance, scrutinizedAsset.params.total);
      assert.strictEqual(assetUnit, scrutinizedAsset.params['unit-name']);
    }
  );

  Then(
    'The account has {int} μalgos and {int} assets, {int} has {int}',
    (microAlgos, numAssets, assetIndexToScrutinize, assetAmount) => {
      assert.strictEqual(
        microAlgos,
        integrationLookupAccountResponse.account.amount
      );
      if (numAssets === 0) {
        return;
      }
      assert.strictEqual(
        numAssets,
        integrationLookupAccountResponse.account.assets.length
      );
      if (assetIndexToScrutinize === 0) {
        return;
      }
      for (
        let idx = 0;
        idx < integrationLookupAccountResponse.account.assets.length;
        idx++
      ) {
        const scrutinizedAsset =
          integrationLookupAccountResponse.account.assets[idx];
        if (scrutinizedAsset.index === assetIndexToScrutinize) {
          assert.strictEqual(assetAmount, scrutinizedAsset.amount);
        }
      }
    }
  );

  let integrationLookupAssetResponse;

  When('I use {int} to lookup asset {int}', async (clientNum, assetIndex) => {
    const ic = indexerIntegrationClients[clientNum];
    integrationLookupAssetResponse = await ic.lookupAssetByID(assetIndex).do();
  });

  Then(
    'The asset found has: {string}, {string}, {string}, {int}, {string}, {int}, {string}',
    (
      name,
      units,
      creator,
      decimals,
      defaultFrozen,
      totalIssuance,
      clawback
    ) => {
      const assetParams = integrationLookupAssetResponse.asset.params;
      assert.strictEqual(name, assetParams.name);
      assert.strictEqual(units, assetParams['unit-name']);
      assert.strictEqual(creator, assetParams.creator);
      assert.strictEqual(decimals, assetParams.decimals);
      const defaultFrozenBool = defaultFrozen === 'true';
      assert.strictEqual(defaultFrozenBool, assetParams['default-frozen']);
      assert.strictEqual(totalIssuance, assetParams.total);
      assert.strictEqual(clawback, assetParams.clawback);
    }
  );

  let integrationLookupAssetBalancesResponse;

  When(
    'I use {int} to lookup asset balances for {int} with {int}, {int}, {int} and token {string}',
    async (
      clientNum,
      assetIndex,
      currencyGreater,
      currencyLesser,
      limit,
      nextToken
    ) => {
      const ic = indexerIntegrationClients[clientNum];
      integrationLookupAssetBalancesResponse = await ic
        .lookupAssetBalances(assetIndex)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .nextToken(nextToken)
        .do();
    }
  );

  When(
    'I get the next page using {int} to lookup asset balances for {int} with {int}, {int}, {int}',
    async (clientNum, assetIndex, currencyGreater, currencyLesser, limit) => {
      const ic = indexerIntegrationClients[clientNum];
      const nextToken = integrationLookupAssetBalancesResponse['next-token'];
      integrationLookupAssetBalancesResponse = await ic
        .lookupAssetBalances(assetIndex)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .nextToken(nextToken)
        .do();
    }
  );

  Then(
    'There are {int} with the asset, the first is {string} has {string} and {int}',
    (numAccounts, firstAccountAddress, isFrozenString, accountAmount) => {
      assert.strictEqual(
        numAccounts,
        integrationLookupAssetBalancesResponse.balances.length
      );
      if (numAccounts === 0) {
        return;
      }
      const firstHolder = integrationLookupAssetBalancesResponse.balances[0];
      assert.strictEqual(firstAccountAddress, firstHolder.address);
      const isFrozenBool = isFrozenString === 'true';
      assert.strictEqual(isFrozenBool, firstHolder['is-frozen']);
      assert.strictEqual(accountAmount, firstHolder.amount);
    }
  );

  let integrationSearchAccountsResponse;

  When(
    'I use {int} to search for an account with {int}, {int}, {int}, {int} and token {string}',
    async (
      clientNum,
      assetIndex,
      limit,
      currencyGreater,
      currencyLesser,
      nextToken
    ) => {
      const ic = indexerIntegrationClients[clientNum];
      integrationSearchAccountsResponse = await ic
        .searchAccounts()
        .assetID(assetIndex)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .nextToken(nextToken)
        .do();
    }
  );

  When(
    'I use {int} to search for an account with {int}, {int}, {int}, {int}, {string}, {int} and token {string}',
    async function (
      clientNum,
      assetIndex,
      limit,
      currencyGreater,
      currencyLesser,
      authAddr,
      appID,
      nextToken
    ) {
      const ic = indexerIntegrationClients[clientNum];
      integrationSearchAccountsResponse = await ic
        .searchAccounts()
        .assetID(assetIndex)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .authAddr(authAddr)
        .applicationID(appID)
        .nextToken(nextToken)
        .do();
      this.responseForDirectJsonComparison = integrationSearchAccountsResponse;
    }
  );

  When(
    'I use {int} to search for an account with {int}, {int}, {int}, {int}, {string}, {int}, {string} and token {string}',
    async function (
      clientNum,
      assetIndex,
      limit,
      currencyGreater,
      currencyLesser,
      authAddr,
      appID,
      includeAll,
      nextToken
    ) {
      const ic = indexerIntegrationClients[clientNum];
      integrationSearchAccountsResponse = await ic
        .searchAccounts()
        .assetID(assetIndex)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .authAddr(authAddr)
        .applicationID(appID)
        .includeAll(formatIncludeAll(includeAll))
        .nextToken(nextToken)
        .do();
      this.responseForDirectJsonComparison = integrationSearchAccountsResponse;
    }
  );

  Then(
    'There are {int}, the first has {int}, {int}, {int}, {int}, {string}, {int}, {string}, {string}',
    (
      numAccounts,
      pendingRewards,
      rewardsBase,
      rewards,
      withoutRewards,
      address,
      amount,
      status,
      type
    ) => {
      assert.strictEqual(
        numAccounts,
        integrationSearchAccountsResponse.accounts.length
      );
      if (numAccounts === 0) {
        return;
      }
      const scrutinizedAccount = integrationSearchAccountsResponse.accounts[0];
      assert.strictEqual(pendingRewards, scrutinizedAccount['pending-rewards']);
      assert.strictEqual(rewardsBase, scrutinizedAccount['reward-base']);
      assert.strictEqual(rewards, scrutinizedAccount.rewards);
      assert.strictEqual(
        withoutRewards,
        scrutinizedAccount['amount-without-pending-rewards']
      );
      assert.strictEqual(address, scrutinizedAccount.address);
      assert.strictEqual(amount, scrutinizedAccount.amount);
      assert.strictEqual(status, scrutinizedAccount.status);
      if (type) {
        assert.strictEqual(type, scrutinizedAccount['sig-type']);
      }
    }
  );

  Then(
    'I get the next page using {int} to search for an account with {int}, {int}, {int} and {int}',
    async (clientNum, assetIndex, limit, currencyGreater, currencyLesser) => {
      const ic = indexerIntegrationClients[clientNum];
      const nextToken = integrationSearchAccountsResponse['next-token'];
      integrationSearchAccountsResponse = await ic
        .searchAccounts()
        .assetID(assetIndex)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .limit(limit)
        .nextToken(nextToken)
        .do();
    }
  );

  Then(
    'The first account is online and has {string}, {int}, {int}, {int}, {string}, {string}',
    (address, keyDilution, firstValid, lastValid, voteKey, selKey) => {
      const scrutinizedAccount = integrationSearchAccountsResponse.accounts[0];
      assert.strictEqual('Online', scrutinizedAccount.status);
      assert.strictEqual(address, scrutinizedAccount.address);
      assert.strictEqual(
        keyDilution,
        scrutinizedAccount.participation['vote-key-dilution']
      );
      assert.strictEqual(
        firstValid,
        scrutinizedAccount.participation['vote-first-valid']
      );
      assert.strictEqual(
        lastValid,
        scrutinizedAccount.participation['vote-last-valid']
      );
      assert.strictEqual(
        voteKey,
        scrutinizedAccount.participation['vote-participation-key']
      );
      assert.strictEqual(
        selKey,
        scrutinizedAccount.participation['selection-participation-key']
      );
    }
  );

  let integrationSearchTransactionsResponse;

  When(
    'I use {int} to search for transactions with {int}, {string}, {string}, {string}, {string}, {int}, {int}, {int}, {int}, {string}, {string}, {int}, {int}, {string}, {string}, {string} and token {string}',
    async (
      clientNum,
      limit,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      assetId,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      address,
      addressRole,
      excludeCloseToString,
      nextToken
    ) => {
      const ic = indexerIntegrationClients[clientNum];
      const excludeCloseToBool = excludeCloseToString === 'true';
      integrationSearchTransactionsResponse = await ic
        .searchForTransactions()
        .limit(limit)
        .notePrefix(notePrefix)
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .assetID(assetId)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .address(address)
        .addressRole(addressRole)
        .excludeCloseTo(excludeCloseToBool)
        .nextToken(nextToken)
        .do();
    }
  );

  When(
    'I use {int} to search for transactions with {int}, {string}, {string}, {string}, {string}, {int}, {int}, {int}, {int}, {string}, {string}, {int}, {int}, {string}, {string}, {string}, {int} and token {string}',
    async function (
      clientNum,
      limit,
      notePrefix,
      txType,
      sigType,
      txid,
      round,
      minRound,
      maxRound,
      assetId,
      beforeTime,
      afterTime,
      currencyGreater,
      currencyLesser,
      address,
      addressRole,
      excludeCloseToString,
      appID,
      nextToken
    ) {
      const ic = indexerIntegrationClients[clientNum];
      const excludeCloseToBool = excludeCloseToString === 'true';
      integrationSearchTransactionsResponse = await ic
        .searchForTransactions()
        .limit(limit)
        .notePrefix(notePrefix)
        .txType(txType)
        .sigType(sigType)
        .txid(txid)
        .round(round)
        .minRound(minRound)
        .maxRound(maxRound)
        .assetID(assetId)
        .beforeTime(beforeTime)
        .afterTime(afterTime)
        .currencyGreaterThan(currencyGreater)
        .currencyLessThan(currencyLesser)
        .address(address)
        .addressRole(addressRole)
        .excludeCloseTo(excludeCloseToBool)
        .applicationID(appID)
        .nextToken(nextToken)
        .do();
      this.responseForDirectJsonComparison = integrationSearchTransactionsResponse;
    }
  );

  When(
    'I use {int} to search for all {string} transactions',
    async (clientNum, account) => {
      const ic = indexerIntegrationClients[clientNum];
      integrationSearchTransactionsResponse = await ic
        .searchForTransactions()
        .address(account)
        .do();
    }
  );

  When(
    'I use {int} to search for all {int} asset transactions',
    async (clientNum, assetIndex) => {
      const ic = indexerIntegrationClients[clientNum];
      integrationSearchTransactionsResponse = await ic
        .searchForTransactions()
        .assetID(assetIndex)
        .do();
    }
  );

  When(
    'I use {int} to search for applications with {int}, {int}, and token {string}',
    async function (clientNum, limit, appID, token) {
      const ic = indexerIntegrationClients[clientNum];
      this.responseForDirectJsonComparison = await ic
        .searchForApplications()
        .limit(limit)
        .index(appID)
        .nextToken(token)
        .do();
    }
  );

  When(
    'I use {int} to search for applications with {int}, {int}, {string} and token {string}',
    async function (clientNum, limit, appID, includeAll, token) {
      const ic = indexerIntegrationClients[clientNum];
      this.responseForDirectJsonComparison = await ic
        .searchForApplications()
        .limit(limit)
        .index(appID)
        .includeAll(formatIncludeAll(includeAll))
        .nextToken(token)
        .do();
    }
  );

  When(
    'I use {int} to lookup application with {int}',
    async function (clientNum, appID) {
      const ic = indexerIntegrationClients[clientNum];
      this.responseForDirectJsonComparison = await ic
        .lookupApplications(appID)
        .do();
    }
  );

  When(
    'I use {int} to lookup application with {int} and {string}',
    async function (clientNum, appID, includeAll) {
      const ic = indexerIntegrationClients[clientNum];
      try {
        this.responseForDirectJsonComparison = await ic
          .lookupApplications(appID)
          .includeAll(formatIncludeAll(includeAll))
          .do();
      } catch (err) {
        if (err.status !== 404) {
          throw err;
        }
        this.responseForDirectJsonComparison = err.response.body;
      }
    }
  );

  function sortKeys(x) {
    // recursively sorts on keys, unless the passed object is an array of dicts that all contain the property 'key',
    // in which case it sorts on the value corresponding to key 'key'
    if (typeof x !== 'object' || !x) return x;
    if (Array.isArray(x)) {
      if (
        x.every(
          (subobject) =>
            typeof subobject === 'object' &&
            Object.prototype.hasOwnProperty.call(subobject, 'key')
        )
      ) {
        return x.sort((a, b) => (a.key > b.key ? 1 : -1));
      }
      return x.map(sortKeys);
    }
    return Object.keys(x)
      .sort()
      .reduce((o, k) => ({ ...o, [k]: sortKeys(x[k]) }), {});
  }

  Then('the parsed response should equal {string}.', async function (jsonFile) {
    const rawResponse = await loadResource(jsonFile);
    const responseFromFile = sortKeys(JSON.parse(rawResponse.toString()));
    this.responseForDirectJsonComparison = sortKeys(
      this.responseForDirectJsonComparison
    );
    assert.strictEqual(
      JSON.stringify(this.responseForDirectJsonComparison),
      JSON.stringify(responseFromFile)
    );
  });

  When(
    'I get the next page using {int} to search for transactions with {int} and {int}',
    async (clientNum, limit, maxRound) => {
      const ic = indexerIntegrationClients[clientNum];
      const nextToken = integrationSearchTransactionsResponse['next-token'];
      integrationSearchTransactionsResponse = await ic
        .searchForTransactions()
        .limit(limit)
        .maxRound(maxRound)
        .nextToken(nextToken)
        .do();
    }
  );

  Then(
    'there are {int} transactions in the response, the first is {string}.',
    (numTransactions, txid) => {
      assert.strictEqual(
        numTransactions,
        integrationSearchTransactionsResponse.transactions.length
      );
      if (numTransactions === 0) {
        return;
      }
      assert.strictEqual(
        txid,
        integrationSearchTransactionsResponse.transactions[0].id
      );
    }
  );

  Then('Every transaction has tx-type {string}', (txType) => {
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.strictEqual(txType, scrutinizedTxn['tx-type']);
    }
  });

  Then('Every transaction has sig-type {string}', (sigType) => {
    function getSigTypeFromTxnResponse(txn) {
      if (txn.signature.logicsig) {
        return 'lsig';
      }
      if (txn.signature.sig) {
        return 'sig';
      }
      if (txn.signature.multisig) {
        return 'msig';
      }
      return 'did not recognize sigtype of txn';
    }
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.strictEqual(sigType, getSigTypeFromTxnResponse(scrutinizedTxn));
    }
  });

  Then('Every transaction has round {int}', (round) => {
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.strictEqual(round, scrutinizedTxn['confirmed-round']);
    }
  });

  Then('Every transaction has round >= {int}', (round) => {
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.ok(round <= scrutinizedTxn['confirmed-round']);
    }
  });

  Then('Every transaction has round <= {int}', (round) => {
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.ok(round >= scrutinizedTxn['confirmed-round']);
    }
  });

  Then('Every transaction works with asset-id {int}', (assetId) => {
    function extractIdFromTransaction(txn) {
      if (txn['created-asset-index']) {
        return txn['created-asset-index'];
      }
      if (txn['asset-config-transaction']) {
        return txn['asset-config-transaction']['asset-id'];
      }
      if (txn['asset-transfer-transaction']) {
        return txn['asset-transfer-transaction']['asset-id'];
      }
      if (txn['asset-freeze-transaction']) {
        return txn['asset-freeze-transaction']['asset-id'];
      }
      return 'could not find asset id within txn';
    }
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.strictEqual(assetId, extractIdFromTransaction(scrutinizedTxn));
    }
  });

  Then('Every transaction is older than {string}', (olderThan) => {
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.ok(scrutinizedTxn['round-time'] < Date.parse(olderThan) / 1000);
    }
  });

  Then('Every transaction is newer than {string}', (newerThan) => {
    for (
      let idx = 0;
      idx < integrationSearchTransactionsResponse.transactions.length;
      idx++
    ) {
      const scrutinizedTxn =
        integrationSearchTransactionsResponse.transactions[idx];
      assert.ok(scrutinizedTxn['round-time'] > Date.parse(newerThan) / 1000);
    }
  });

  Then(
    'Every transaction moves between {int} and {int} currency',
    (lowerBound, upperBound) => {
      function getAmountMoved(txn) {
        if (txn['payment-transaction']) {
          return txn['payment-transaction'].amount;
        }
        if (txn['asset-transfer-transaction']) {
          return txn['asset-transfer-transaction'].amount;
        }
        return 'could not get amount moved from txn';
      }
      for (
        let idx = 0;
        idx < integrationSearchTransactionsResponse.transactions.length;
        idx++
      ) {
        const scrutinizedTxn =
          integrationSearchTransactionsResponse.transactions[idx];
        const amountMoved = getAmountMoved(scrutinizedTxn);
        if (upperBound !== 0) {
          assert.ok(amountMoved <= upperBound);
        }
        assert.ok(amountMoved >= lowerBound);
      }
    }
  );

  let integrationSearchAssetsResponse;

  When(
    'I use {int} to search for assets with {int}, {int}, {string}, {string}, {string}, and token {string}',
    async (clientNum, zero, assetId, creator, name, unit, nextToken) => {
      const ic = indexerIntegrationClients[clientNum];
      integrationSearchAssetsResponse = await ic
        .searchForAssets()
        .index(assetId)
        .creator(creator)
        .name(name)
        .unit(unit)
        .nextToken(nextToken)
        .do();
    }
  );

  Then(
    'there are {int} assets in the response, the first is {int}.',
    (numAssets, firstAssetId) => {
      assert.strictEqual(
        numAssets,
        integrationSearchAssetsResponse.assets.length
      );
      if (numAssets === 0) {
        return;
      }
      assert.strictEqual(
        firstAssetId,
        integrationSearchAssetsResponse.assets[0].index
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
      this.signingMnemonic = mnemonic;
    }
  );

  function operationStringToEnum(inString) {
    switch (inString) {
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
        const resource = await loadResource(approvalProgramFile);
        approvalProgramBytes = makeUint8Array(resource);
      }
      // open and load in clear program
      let clearProgramBytes;
      if (clearProgramFile !== '') {
        const resource = await loadResource(clearProgramFile);
        clearProgramBytes = makeUint8Array(resource);
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
    const result = algosdk.mnemonicToSecretKey(this.signingMnemonic);
    this.stx = this.txn.signTxn(result.sk);
  });

  Then(
    'the base{int} encoded signed transaction should equal {string}',
    function (base, base64golden) {
      const actualBase64 = Buffer.from(this.stx).toString('base64');
      assert.strictEqual(actualBase64, base64golden);
    }
  );

  Given(
    'an algod v{int} client connected to {string} port {int} with token {string}',
    function (clientVersion, host, port, token) {
      let mutableHost = host;

      if (!mutableHost.startsWith('http')) {
        mutableHost = `http://${mutableHost}`;
      }
      this.v2Client = new algosdk.Algodv2(token, mutableHost, port, {});
    }
  );

  Given(
    'I create a new transient account and fund it with {int} microalgos.',
    async function (fundingAmount) {
      const generatedResult = algosdk.generateAccount();
      this.transientSecretKey = generatedResult.sk;
      this.transientAddress = generatedResult.addr;
      const sp = await this.v2Client.getTransactionParams().do();
      if (sp.firstRound === 0) sp.firstRound = 1;
      const fundingTxnArgs = {
        from: this.accounts[0],
        to: this.transientAddress,
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
      await this.v2Client.statusAfterBlock(sp.firstRound + 2).do();
      const fundingConfirmation = await this.acl.transactionById(
        fundingResponse.txId
      );
      assert.deepStrictEqual(true, 'type' in fundingConfirmation);
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
        const resouce = await loadResource(approvalProgramFile);
        approvalProgramBytes = makeUint8Array(resouce);
      }
      // open and load in clear program
      let clearProgramBytes;
      if (clearProgramFile !== '') {
        const resouce = await loadResource(clearProgramFile);
        clearProgramBytes = makeUint8Array(resouce);
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
        from: this.transientAddress,
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
        const appStx = this.txn.signTxn(this.transientSecretKey);
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
    const sp = await this.v2Client.getTransactionParams().do();
    await this.v2Client.statusAfterBlock(sp.firstRound + 2).do();
    const confirmation = await this.acl.transactionById(this.appTxid.txId);
    assert.deepStrictEqual(true, 'type' in confirmation);
  });

  Given('I remember the new application ID.', async function () {
    const infoResult = await this.acl.pendingTransactionInformation(
      this.appTxid.txId
    );
    this.currentApplicationIndex = infoResult.txresults.createdapp;
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
        .accountInformation(this.transientAddress)
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

  if (!options.ignoreReturn) {
    return steps;
  }

  return undefined;
};
