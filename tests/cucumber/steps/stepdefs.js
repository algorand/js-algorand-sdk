const assert = require('assert');
const { Before, Given, When, Then, setDefaultTimeout } = require('cucumber');
let algosdk = require("../../../src/main");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const address = require("../../../src/encoding/address");
const splitTemplate = require("../../../src/logicTemplates/split");
const htlcTemplate = require("../../../src/logicTemplates/htlc");
const periodicPayTemplate = require("../../../src/logicTemplates/periodicpayment");
const limitOrderTemplate = require("../../../src/logicTemplates/limitorder");
const dynamicFeeTemplate = require("../../../src/logicTemplates/dynamicfee");
const sha256 = require('js-sha256');
const fs = require('fs');
const path = require("path")
const maindir = path.dirname(path.dirname(path.dirname(__dirname)))
const homedir = require('os').homedir()

setDefaultTimeout(60000)

Before(async function () {
    // You can use this hook to write code that will run before each scenario,
    // before even the Background steps
});

Given("an algod client", async function(){
    data_dir_path = "file://" + process.env.NODE_DIR + "/";
    algod_token = "";
    algod_address = "";

    xml = new XMLHttpRequest();
    xml.open("GET", data_dir_path + "algod.net", false);
    xml.onreadystatechange = function () {
        algod_address = xml.responseText.trim();
    };
    xml.send();

    xml.open("GET", data_dir_path + "algod.token", false);
    xml.onreadystatechange = function () {
        algod_token = xml.responseText.trim();
    };
    xml.send();

    this.acl = new algosdk.Algod(algod_token, algod_address.split(":")[0], algod_address.split(":")[1]);
    return this.acl
})

Given("a kmd client", function(){
    data_dir_path = "file://" + process.env.NODE_DIR + "/";
    kmd_folder_name = process.env.KMD_DIR + "/";
    kmd_token = "";
    kmd_address = "";

    xml.open("GET", data_dir_path + kmd_folder_name + "kmd.net", false);
    xml.onreadystatechange = function () {
        kmd_address = xml.responseText.trim();
    };
    xml.send();

    xml.open("GET", data_dir_path + kmd_folder_name + "kmd.token", false);
    xml.onreadystatechange = function () {
        kmd_token = xml.responseText.trim();
    };
    xml.send();

    this.kcl = new algosdk.Kmd(kmd_token, kmd_address.split(":")[0], kmd_address.split(":")[1])

    return this.kcl

});

Given("wallet information", async function(){
    this.wallet_name = "unencrypted-default-wallet";
    this.wallet_pswd = "";

    result = await this.kcl.listWallets()
    for(var i = 0; i < result.wallets.length; i++){
        var w = result.wallets[i];
        if (w.name == this.wallet_name) {
            this.wallet_id = w.id;
            break
        }
    }
    this.handle = await this.kcl.initWalletHandle(this.wallet_id, this.wallet_pswd)
    this.handle = this.handle.wallet_handle_token
    this.accounts = await this.kcl.listKeys(this.handle)
    this.accounts = this.accounts.addresses
    return this.accounts

});

When("I get versions with algod", async function(){
    this.versions = await this.acl.versions();
    this.versions = this.versions.versions;
    return this.versions
});

Then("v1 should be in the versions", function(){
    assert.deepStrictEqual(true, this.versions.indexOf("v1") >= 0)
});

When("I get versions with kmd", async function(){
    this.versions = await this.kcl.versions();
    this.versions = this.versions.versions;
    return this.versions
});

When("I get the status", async function(){
    this.status = await this.acl.status();
    return this.status
});

When("I get status after this block", async function(){
    this.statusAfter = await this.acl.statusAfterBlock(this.status.lastRound);
    return this.statusAfter
});

Then("I can get the block info", async function(){
    this.block = await this.acl.block(this.statusAfter.lastRound);
    assert.deepStrictEqual(true, Number.isInteger(this.block.round));
})


Given("payment transaction parameters {int} {int} {int} {string} {string} {string} {int} {string} {string}", function(fee, fv, lv, gh, to, close, amt, gen, note) {
    this.fee = parseInt(fee)
    this.fv = parseInt(fv)
    this.lv = parseInt(lv)
    this.gh = gh
    this.to = to
    if (close !== "none"){
        this.close = close
    }
    this.amt = parseInt(amt)
    if (gen !== "none") {
        this.gen = gen
    }
    if (note !== "none") {
        this.note = new Uint8Array(Buffer.from(note, "base64"))
    }
})

Given("mnemonic for private key {string}", function(mn) {
    result = algosdk.mnemonicToSecretKey(mn)
    this.pk = result.addr

    this.sk = result.sk
})

Given("multisig addresses {string}", function(addresses) {
    addrlist = addresses.split(" ")
    this.msig = {
        version: 1,
        threshold: 2,
        addrs: addrlist
    }
    this.pk = algosdk.multisigAddress(this.msig)
})


When("I create the payment transaction", function() {
    this.txn = {
        "from": this.pk,
        "to": this.to,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.gh,
    };
    if (this.gen) {
        this.txn["genesisID"] = this.gen
    }
    if (this.close) {
        this.txn["closeRemainderTo"] = this.close
    }
    if (this.note) {
        this.txn["note"] = this.note
    }
    if (this.amt) {
        this.txn["amount"] = this.amt
    }
})


When("I sign the transaction with the private key", function() {
    let obj = algosdk.signTransaction(this.txn, this.sk)
    this.stx = obj.blob
})

When("I sign the multisig transaction with the private key", function() {
    let obj = algosdk.signMultisigTransaction(this.txn, this.msig, this.sk)
    this.stx = obj.blob
})

When("I sign the transaction with kmd", async function(){
    this.stxKmd = await this.kcl.signTransaction(this.handle, this.wallet_pswd, this.txn)
    return this.stxKmd
})

When("I sign the multisig transaction with kmd", async function(){
    addrs = [];
    for(i = 0; i < this.msig.addrs.length; i++){
        addrs.push(Buffer.from(address.decode(this.msig.addrs[i]).publicKey).toString("base64"))
    }
    await this.kcl.importMultisig(this.handle, this.msig.version, this.msig.threshold, addrs)

    key = address.decode(this.pk).publicKey
    this.stxKmd = await this.kcl.signMultisigTransaction(this.handle, this.wallet_pswd, this.txn, key, null)
    this.stxKmd = this.stxKmd.multisig
    return this.stxKmd
})

Then('the signed transaction should equal the golden {string}', function(golden){
    assert.deepStrictEqual(Buffer.from(golden, "base64"), Buffer.from(this.stx))
})


Then("the signed transaction should equal the kmd signed transaction", function(){
    assert.deepStrictEqual(Buffer.from(this.stx), Buffer.from(this.stxKmd))
})

Then("the multisig address should equal the golden {string}", function(golden) {
    assert.deepStrictEqual(algosdk.multisigAddress(this.msig), golden)
})

Then('the multisig transaction should equal the golden {string}', function(golden){
    assert.deepStrictEqual(Buffer.from(golden, "base64"), Buffer.from(this.stx))
})

Then("the multisig transaction should equal the kmd signed multisig transaction", async function(){
    await this.kcl.deleteMultisig(this.handle, this.wallet_pswd, algosdk.multisigAddress(this.msig))
    s = algosdk.decodeObj(this.stx)
    m = algosdk.encodeObj(s.msig)
    assert.deepStrictEqual(Buffer.from(m), Buffer.from(this.stxKmd, "base64"))
})


When("I generate a key using kmd", async function(){
    this.pk = await this.kcl.generateKey(this.handle)
    this.pk = this.pk.address
    return this.pk
});

Then("the key should be in the wallet", async function(){
    keys = await this.kcl.listKeys(this.handle)
    keys = keys.addresses
    assert.deepStrictEqual(true, keys.indexOf(this.pk) >= 0)
    return keys
})

When("I delete the key", async function(){
    return await this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk)
})

Then("the key should not be in the wallet", async function(){
    keys = await this.kcl.listKeys(this.handle)
    keys = keys.addresses
    assert.deepStrictEqual(false, keys.indexOf(this.pk) >= 0)
    return keys
})

When("I generate a key", function(){
    var result = algosdk.generateAccount()
    this.pk = result.addr
    this.sk = result.sk
})

When("I import the key", async function(){
    return await this.kcl.importKey(this.handle, this.sk)
})

Then("the private key should be equal to the exported private key", async function(){
    exp = await this.kcl.exportKey(this.handle, this.wallet_pswd, this.pk)
    exp = exp.private_key
    assert.deepStrictEqual(Buffer.from(exp).toString("base64"), Buffer.from(this.sk).toString("base64"))
    return await this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk)
})


When("I get the private key", async function(){
    sk = await this.kcl.exportKey(this.handle, this.wallet_pswd, this.pk)
    this.sk = sk.private_key
    return this.sk
})


Given("default transaction with parameters {int} {string}", async function(amt, note) {
    this.pk = this.accounts[0]
    result = await this.acl.getTransactionParams()
    this.lastRound = result.lastRound
    this.txn = {
            "from": this.accounts[0],
            "to": this.accounts[1],
            "fee": result["fee"],
            "firstRound": result["lastRound"] + 1,
            "lastRound": result["lastRound"] + 1000,
            "genesisHash": result["genesishashb64"],
            "genesisID": result["genesisID"],
            "note": new Uint8Array(Buffer.from(note, "base64")),
            "amount": parseInt(amt)
        }
    return this.txn
});


Given("default multisig transaction with parameters {int} {string}", async function(amt, note) {
    this.pk = this.accounts[0]
    result = await this.acl.getTransactionParams()
    this.msig = {
        version: 1,
        threshold: 1,
        addrs: this.accounts
    }

    this.txn = {
            "from": algosdk.multisigAddress(this.msig),
            "to": this.accounts[1],
            "fee": result["fee"],
            "firstRound": result["lastRound"] + 1,
            "lastRound": result["lastRound"] + 1000,
            "genesisHash": result["genesishashb64"],
            "genesisID": result["genesisID"],
            "note": new Uint8Array(Buffer.from(note, "base64")),
            "amount": parseInt(amt)
        }
    return this.txn
});

When("I import the multisig", async function(){

    addrs = [];
    for(i = 0; i < this.msig.addrs.length; i++){
        addrs.push(Buffer.from(address.decode(this.msig.addrs[i]).publicKey).toString("base64"))
    }
    return await this.kcl.importMultisig(this.handle, this.msig.version, this.msig.threshold, addrs)
})

Then("the multisig should be in the wallet", async function(){
    keys = await this.kcl.listMultisig(this.handle)
    keys = keys.addresses
    assert.deepStrictEqual(true, keys.indexOf(algosdk.multisigAddress(this.msig)) >= 0)
    return keys
})


Then("the multisig should not be in the wallet", async function(){
    keys = await this.kcl.listMultisig(this.handle)
    if(typeof keys.addresses === "undefined"){
        return true
    }
    else{
        keys = keys.addresses
        assert.deepStrictEqual(false, keys.indexOf(algosdk.multisigAddress(this.msig)) >= 0)
        return keys
    }
})


When("I export the multisig", async function(){
    this.msigExp = await this.kcl.exportMultisig(this.handle, algosdk.multisigAddress(this.msig))
    return this.msigExp
})


When("I delete the multisig", async function(){
    return await this.kcl.deleteMultisig(this.handle, this.wallet_pswd, algosdk.multisigAddress(this.msig))
})


Then("the multisig should equal the exported multisig", function(){
    for(i = 0; i < this.msigExp.length; i++){
        assert.deepStrictEqual(address.encode(Buffer.from(this.msigExp[i], "base64")), this.msig.addrs[i])
    }
})


Then('the node should be healthy', async function () {
    health = await this.acl.healthCheck();
    assert.deepStrictEqual(health, {});
});


Then('I get the ledger supply', async function () {
    return await this.acl.ledgerSupply();
});


Then('I get transactions by address and round', async function () {
    lastRound = await this.acl.status()
    transactions = await this.acl.transactionByAddress(this.accounts[0], 1, lastRound["lastRound"])
    assert.deepStrictEqual(true, Object.entries(transactions).length === 0 || "transactions" in transactions)
});


Then('I get transactions by address only', async function () {
    lastRound = await this.acl.status()
    transactions = await this.acl.transactionByAddress(this.accounts[0])
    assert.deepStrictEqual(true, Object.entries(transactions).length === 0 || "transactions" in transactions)
});


Then('I get transactions by address and date', async function () {
    fromDate = (new Date()).toISOString().split("T")[0]
    transactions = await this.acl.transactionByAddressAndDate(this.accounts[0])
    assert.deepStrictEqual(true, Object.entries(transactions).length === 0 || "transactions" in transactions)
});


Then('I get pending transactions', async function () {
    transactions = await this.acl.pendingTransactions(10)
    assert.deepStrictEqual(true, Object.entries(transactions).length === 0 || "truncatedTxns" in transactions)
});


When('I get the suggested params', async function () {
    this.params = await this.acl.getTransactionParams()
    return this.params
});


When('I get the suggested fee', async function () {
    this.fee = await this.acl.suggestedFee()
    this.fee = this.fee.fee
    return this.fee
});


Then('the fee in the suggested params should equal the suggested fee', function () {
    assert.deepStrictEqual(this.params.fee, this.fee)
});


When('I create a bid', function () {
    addr = algosdk.generateAccount()
    this.sk = addr.sk
    addr = addr.addr
    this.bid = {
        "bidderKey": addr,
        "bidAmount": 1,
        "maxPrice": 2,
        "bidID": 3,
        "auctionKey": addr,
        "auctionID": 4
    }
    return this.bid
});


When('I encode and decode the bid', function () {
    this.sbid = algosdk.decodeObj(algosdk.encodeObj(this.sbid));
    return this.sbid
});


When("I sign the bid", function() {
    this.sbid = algosdk.decodeObj(algosdk.signBid(this.bid, this.sk));
    this.oldBid = algosdk.decodeObj(algosdk.signBid(this.bid, this.sk));
})


Then('the bid should still be the same', function () {
    assert.deepStrictEqual(algosdk.encodeObj(this.sbid), algosdk.encodeObj(this.oldBid))
});


When('I decode the address', function () {
    this.old = this.pk
    this.addrBytes = address.decode(this.pk).publicKey
});


When('I encode the address', function () {
    this.pk = address.encode(this.addrBytes)
});


Then('the address should still be the same', function () {
    assert.deepStrictEqual(this.pk, this.old)
});


When('I convert the private key back to a mnemonic', function () {
    this.mn = algosdk.secretKeyToMnemonic(this.sk)
});


Then('the mnemonic should still be the same as {string}', function (mn) {
    assert.deepStrictEqual(this.mn, mn)
});


Given('mnemonic for master derivation key {string}', function (mn) {
    this.mdk = algosdk.mnemonicToMasterDerivationKey(mn)
});


When('I convert the master derivation key back to a mnemonic', function () {
    this.mn = algosdk.masterDerivationKeyToMnemonic(this.mdk)
});


When('I create the flat fee payment transaction', function () {
    this.txn = {
        "to": this.to,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.gh,
        "flatFee": true
    };
    if (this.gen) {
        this.txn["genesisID"] = this.gen
    }
    if (this.close) {
        this.txn["closeRemainderTo"] = this.close
    }
    if (this.note) {
        this.txn["note"] = this.note
    }
    if (this.amt) {
        this.txn["amount"] = this.amt
    }
});


Given('encoded multisig transaction {string}', function (encTxn) {
    this.mtx = Buffer.from(encTxn, "base64")
    this.stx = algosdk.decodeObj(this.mtx);
});


When('I append a signature to the multisig transaction', function () {
    addresses = this.stx.msig.subsig.slice()
    for (i=0; i < addresses.length; i++){
        addresses[i] = address.encode(addresses[i].pk)
    }
    msig = {
        version: this.stx.msig.v,
        threshold: this.stx.msig.thr,
        addrs: addresses
    }
    this.stx = algosdk.appendSignMultisigTransaction(this.mtx, msig, this.sk).blob
});


When('I merge the multisig transactions', function () {
    this.stx = algosdk.mergeMultisigTransactions(this.mtxs)
});


When('I convert {int} microalgos to algos and back', function (microalgos) {
    this.microalgos = algosdk.algosToMicroalgos(algosdk.microalgosToAlgos(microalgos)).toString()
});


Then('it should still be the same amount of microalgos {int}', function (microalgos) {
    assert.deepStrictEqual(this.microalgos, microalgos.toString())
});


Given('encoded multisig transactions {string}', function (encTxns) {
    this.mtxs = [];
    mtxs = encTxns.split(" ")
    for (i = 0; i < mtxs.length; i++){
        this.mtxs.push(Buffer.from(mtxs[i], "base64"))
    }
});


When("I create the multisig payment transaction", function() {
    this.txn = {
        "from": algosdk.multisigAddress(this.msig),
        "to": this.to,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.gh,
    };
    if (this.gen) {
        this.txn["genesisID"] = this.gen
    }
    if (this.close) {
        this.txn["closeRemainderTo"] = this.close
    }
    if (this.note) {
        this.txn["note"] = this.note
    }
    if (this.amt) {
        this.txn["amount"] = this.amt
    }
    return this.txn
});

When("I send the transaction", async function(){
    this.txid = await this.acl.sendRawTransaction(this.stx)
    this.txid = this.txid.txId
    return this.txid
});

When("I send the kmd-signed transaction", async function(){
    this.txid = await this.acl.sendRawTransaction(this.stxKmd)
    this.txid = this.txid.txId
    return this.txid
});

When("I send the multisig transaction", async function(){
    try {
        this.txid = await this.acl.sendRawTransaction(this.stx)
        this.err = false
        return this.txid

    } catch (e){
        this.err = true
    }

});

Then("the transaction should go through", async function(){
    info = await this.acl.pendingTransactionInformation(this.txid)
    assert.deepStrictEqual(true, "type" in info)
    await this.acl.statusAfterBlock(this.lastRound + 2)
    info = await this.acl.transactionInformation(this.pk, this.txid)
    assert.deepStrictEqual(true, "type" in info)
    info = await this.acl.transactionById(this.txid)
    assert.deepStrictEqual(true, "type" in info)
});


Then("I can get the transaction by ID", async function(){
    await this.acl.statusAfterBlock(this.lastRound + 2)
    info = await this.acl.transactionById(this.txid)
    assert.deepStrictEqual(true, "type" in info)
});


Then("the transaction should not go through", function(){
    assert.deepStrictEqual(true, this.err)
});


When("I create a wallet", async function(){
    this.wallet_name = "Walletjs"
    this.wallet_pswd = ""
    this.wallet_id = await this.kcl.createWallet(this.wallet_name, this.wallet_pswd)
    this.wallet_id = this.wallet_id.wallet.id
    return this.wallet_id
})

Then("the wallet should exist", async function(){
    result = await this.kcl.listWallets()
    exists = false
    for(var i = 0; i < result.wallets.length; i++){
        var w = result.wallets[i];
        if (w.name == this.wallet_name) {
            exists = true
        }
    }
    assert.deepStrictEqual(true, exists)
})

When("I get the wallet handle", async function(){
    this.handle = await this.kcl.initWalletHandle(this.wallet_id, this.wallet_pswd)
    this.handle = this.handle.wallet_handle_token
    return this.handle
})

Then("I can get the master derivation key", async function(){
    mdk = await this.kcl.exportMasterDerivationKey(this.handle, this.wallet_pswd)
    return mdk
})

When("I rename the wallet", async function(){
    this.wallet_name = "Walletjs_new"
    return await this.kcl.renameWallet(this.wallet_id, this.wallet_pswd, this.wallet_name)
})

Then("I can still get the wallet information with the same handle", async function(){
    return await this.kcl.getWallet(this.handle)
})

When("I renew the wallet handle", async function(){
    return await this.kcl.renewWalletHandle(this.handle)
})

When("I release the wallet handle", async function(){
    return await this.kcl.releaseWalletHandle(this.handle)
})

Then("the wallet handle should not work", async function(){
    try{
        await this.kcl.renewWalletHandle(this.handle)
        this.err = false
    } catch (e){
        this.err = true
    }
    assert.deepStrictEqual(true, this.err)
})

When("I read a transaction {string} from file {string}", function(string, num){
    this.num = num
    this.txn = algosdk.decodeObj(new Uint8Array(fs.readFileSync(maindir + '/temp/raw' + num + '.tx')));
    return this.txn
})

When("I write the transaction to file", function(){
    fs.writeFileSync(maindir + '/temp/raw' + this.num + '.tx', Buffer.from(algosdk.encodeObj(this.txn)));
})

Then("the transaction should still be the same", function(){
    stxnew = new Uint8Array(fs.readFileSync(maindir + '/temp/raw' + this.num + '.tx'));
    stxold = new Uint8Array(fs.readFileSync(maindir + '/temp/old' + this.num + '.tx'));
    assert.deepStrictEqual(stxnew, stxold)
})

Then("I do my part", async function(){
    stx = new Uint8Array(fs.readFileSync(maindir + '/temp/txn.tx'));
    this.txid = await this.acl.sendRawTransaction(stx)
    this.txid = this.txid.txId
    return this.txid
})

Then("I get account information", async function(){
   return await this.acl.accountInformation(this.accounts[0])
})

Then("I can get account information", async function(){
    await this.acl.accountInformation(this.pk)
    return this.kcl.deleteKey(this.handle, this.wallet_pswd, this.pk)
})

Given('key registration transaction parameters {int} {int} {int} {string} {string} {string} {int} {int} {int} {string} {string}', function (fee, fv, lv, gh, votekey, selkey, votefst, votelst, votekd, gen, note) {
    this.fee = parseInt(fee)
    this.fv = parseInt(fv)
    this.lv = parseInt(lv)
    this.gh = gh
    if (gen !== "none") {
        this.gen = gen
    }
    if (note !== "none") {
        this.note = new Uint8Array(Buffer.from(note, "base64"))
    }
    this.votekey = votekey
    this.selkey = selkey
    this.votefst = votefst
    this.votelst = votelst
    this.votekd = votekd
});

When('I create the key registration transaction', function () {
    this.txn = {
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.gh,
        "voteKey": this.votekey,
        "selectionKey": this.selkey,
        "voteFirst":this.votefst,
        "voteLast": this.votelst,
        "voteKeyDilution": this.votekd,
        "type": "keyreg"
    };
    if (this.gen) {
        this.txn["genesisID"] = this.gen
    }
    if (this.note) {
        this.txn["note"] = this.note
    }
});

When('I get recent transactions, limited by {int} transactions', function (int) {
    this.acl.transactionByAddress(this.accounts[0], parseInt(int));
});

Given("asset test fixture", function() {
    this.assetTestFixture = {
        "creator": "",
        "index": 0,
        "name": "testcoin",
        "unitname": "coins",
        "url": "http://test",
        "metadataHash": "fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh",
        "expectedParams": undefined,
        "queriedParams": undefined,
        "lastTxn": undefined
    };
});


Given('default asset creation transaction with total issuance {int}', async function (issuance) {
    this.assetTestFixture.creator = this.accounts[0];
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    issuance = parseInt(issuance);
    let decimals = 0;
    let defaultFrozen = false;
    let assetName = this.assetTestFixture.name;
    let unitName = this.assetTestFixture.unitname;
    let assetURL = this.assetTestFixture.url;
    let metadataHash = this.assetTestFixture.metadataHash;
    let manager = this.assetTestFixture.creator;
    let reserve = this.assetTestFixture.creator;
    let freeze = this.assetTestFixture.creator;
    let clawback = this.assetTestFixture.creator;
    let genesisID = "";
    let type = "acfg";

    this.assetTestFixture.lastTxn = {
        "from": this.assetTestFixture.creator,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetTotal": issuance,
        "assetDecimals": decimals,
        "assetDefaultFrozen": defaultFrozen,
        "assetUnitName": unitName,
        "assetName": assetName,
        "assetURL": assetURL,
        "assetMetadataHash": metadataHash,
        "assetManager": manager,
        "assetReserve": reserve,
        "assetFreeze": freeze,
        "assetClawback": clawback,
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.assetTestFixture.expectedParams = {
      "creator": this.assetTestFixture.creator,
      "total": issuance,
      "defaultfrozen": defaultFrozen,
      "unitname": unitName,
      "assetname": assetName,
      "url": assetURL,
      "metadatahash": Buffer.from(metadataHash).toString('base64'),
      "managerkey": manager,
      "reserveaddr": reserve,
      "freezeaddr": freeze,
      "clawbackaddr": clawback,
      "decimals": decimals
    };
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.accounts[0];
});

Given('default-frozen asset creation transaction with total issuance {int}', async function (issuance) {
    this.assetTestFixture.creator = this.accounts[0];
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    issuance = parseInt(issuance);
    let decimals = 0;
    let defaultFrozen = true;
    let assetName = this.assetTestFixture.name;
    let unitName = this.assetTestFixture.unitname;
    let assetURL = this.assetTestFixture.url;
    let metadataHash = this.assetTestFixture.metadataHash;
    let manager = this.assetTestFixture.creator;
    let reserve = this.assetTestFixture.creator;
    let freeze = this.assetTestFixture.creator;
    let clawback = this.assetTestFixture.creator;
    let genesisID = "";
    let type = "acfg";

    this.assetTestFixture.lastTxn = {
        "from": this.assetTestFixture.creator,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetTotal": issuance,
        "assetDecimals": decimals,
        "assetDefaultFrozen": defaultFrozen,
        "assetUnitName": unitName,
        "assetName": assetName,
        "assetURL": assetURL,
        "assetMetadataHash": metadataHash,
        "assetManager": manager,
        "assetReserve": reserve,
        "assetFreeze": freeze,
        "assetClawback": clawback,
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.assetTestFixture.expectedParams = {
        "creator": this.assetTestFixture.creator,
        "total": issuance,
        "defaultfrozen": defaultFrozen,
        "unitname": unitName,
        "assetname": assetName,
        "url": assetURL,
        "metadatahash": Buffer.from(metadataHash).toString('base64'),
        "managerkey": manager,
        "reserveaddr": reserve,
        "freezeaddr": freeze,
        "clawbackaddr": clawback,
        "decimals": decimals
    };
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.accounts[0];
});

// a lambda "return a-b" would suffice for keys.sort, below, but define it separately for readability
function sortKeysAscending(a, b) {
    if (a > b) {
        return 1;
    } else if (b > a) {
        return -1;
    } else {
        return 0;
    }
}

When("I update the asset index", async function () {
    let accountResponse = await this.acl.accountInformation(this.assetTestFixture.creator);
    let heldAssets = accountResponse.thisassettotal;
    let keys = [];
    for (var k in heldAssets) keys.push(parseInt(k));
    keys = keys.sort(sortKeysAscending);
    let assetIndex = keys[keys.length - 1];
    this.assetTestFixture.index = assetIndex.toString(); // this is stored as a string so it can be used as a key later.
});

When("I get the asset info", async function () {
    this.assetTestFixture.queriedParams = await this.acl.assetInformation(this.assetTestFixture.index)
});

Then("the asset info should match the expected asset info", function () {
    for (var k in this.assetTestFixture.expectedParams) {
        assert.equal(true, this.assetTestFixture.expectedParams[k] === this.assetTestFixture.queriedParams[k] || ((!this.assetTestFixture.expectedParams[k]) && (!this.assetTestFixture.queriedParams[k])))
    }
});

When('I create a no-managers asset reconfigure transaction', async function () {
    this.assetTestFixture.creator = this.accounts[0];
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    // if we truly supplied no managers at all, it would be an asset destroy txn
    // so leave one key written
    let manager = this.assetTestFixture.creator;
    let reserve = undefined;
    let freeze = undefined;
    let clawback = undefined;
    let genesisID = "";
    let type = "acfg";

    this.assetTestFixture.lastTxn = {
        "from": this.assetTestFixture.creator,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetManager": manager,
        "assetReserve": reserve,
        "assetFreeze": freeze,
        "assetClawback": clawback,
        "assetIndex": parseInt(this.assetTestFixture.index),
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.assetTestFixture.expectedParams.reserveaddr = "";
    this.assetTestFixture.expectedParams.freezeaddr = "";
    this.assetTestFixture.expectedParams.clawbackaddr = "";
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.accounts[0];
});

When('I create an asset destroy transaction', async function () {
    this.assetTestFixture.creator = this.accounts[0];
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    let genesisID = "";
    let type = "acfg";

    this.assetTestFixture.lastTxn = {
        "from": this.assetTestFixture.creator,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetIndex": parseInt(this.assetTestFixture.index),
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.accounts[0];
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

When('I create a transaction for a second account, signalling asset acceptance', async function () {
    let accountToUse = this.accounts[1];
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    let genesisID = "";
    let type = "axfer";

    this.assetTestFixture.lastTxn = {
        "from": accountToUse,
        "to": accountToUse,
        "amount": 0,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetIndex": parseInt(this.assetTestFixture.index),
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = accountToUse;
});

When('I create a transaction transferring {int} assets from creator to a second account', async function (amount) {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    let genesisID = "";
    let type = "axfer";

    this.assetTestFixture.lastTxn = {
        "from": this.assetTestFixture.creator,
        "to": this.accounts[1],
        "amount": parseInt(amount),
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetIndex": parseInt(this.assetTestFixture.index),
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.assetTestFixture.creator;
});

When('I create a transaction transferring {int} assets from a second account to creator', async function (amount) {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    let genesisID = "";
    let type = "axfer";

    this.assetTestFixture.lastTxn = {
        "to": this.assetTestFixture.creator,
        "from": this.accounts[1],
        "amount": parseInt(amount),
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetIndex": parseInt(this.assetTestFixture.index),
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.accounts[1];
});

Then('the creator should have {int} assets remaining', async function (expectedTotal) {
    let accountInformation = await this.acl.accountInformation(this.assetTestFixture.creator);
    let assetsHeld = accountInformation.assets[this.assetTestFixture.index];
    assert.deepStrictEqual(assetsHeld.amount, parseInt(expectedTotal))
});

When('I send the bogus kmd-signed transaction', async function () {
    this.err = false;
    try {
        response = await this.acl.sendRawTransaction(this.stxKmd);
    } catch (e) {
        this.err = true;
    }
});

When('I create an un-freeze transaction targeting the second account', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    let freezer = this.assetTestFixture.creator;

    this.assetTestFixture.lastTxn = {
        "from": freezer,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.gh,
        "type": "afrz",
        "freezeAccount": this.accounts[1],
        "assetIndex": parseInt(this.assetTestFixture.index),
        "freezeState" : false,
        "note": this.note
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.assetTestFixture.creator;
});

When('I create a freeze transaction targeting the second account', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    let freezer = this.assetTestFixture.creator;

    this.assetTestFixture.lastTxn = {
        "from": freezer,
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.gh,
        "type": "afrz",
        "freezeAccount": this.accounts[1],
        "assetIndex": parseInt(this.assetTestFixture.index),
        "freezeState" : true,
        "note": this.note
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.assetTestFixture.creator;
});


When('I create a transaction revoking {int} assets from a second account to creator', async function (amount) {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    let genesisID = "";
    let type = "axfer";

    this.assetTestFixture.lastTxn = {
        "from": this.assetTestFixture.creator,
        "to": this.assetTestFixture.creator,
        "assetRevocationTarget": this.accounts[1],
        "amount": parseInt(amount),
        "fee": this.fee,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "note": this.note,
        "genesisHash": this.gh,
        "assetIndex": parseInt(this.assetTestFixture.index),
        "genesisID": genesisID,
        "type": type
    };
    // update vars used by other helpers
    this.txn = this.assetTestFixture.lastTxn;
    this.lastRound = this.params.lastRound;
    this.pk = this.assetTestFixture.creator;
});

Given('contract test fixture', function () {
    this.contractTestFixture = {
        "split": undefined,
        "htlc": undefined,
        "periodicPay": undefined,
        "limitOrder": undefined,
        "dynamicFee": undefined,
        "activeAddress": "",
        "htlcPreimage": "",
        "limitOrderN": 0,
        "limitOrderD": 0,
        "limitOrderMin": 0,
        "splitRat1": 0,
        "splitRat2": 0,
        "splitMin": 0,
        "contractFundAmount": 0,
        "periodicPayPeriod": 0
    };
});

When('I fund the contract account', async function () {
    let amount = this.contractTestFixture.contractFundAmount;
    let from = this.accounts[0];
    let to = this.contractTestFixture.activeAddress;
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    if (this.fv == 0) {
        this.fv = 1;
    }
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.note = undefined;
    this.gh = this.params.genesishashb64;
    this.txn = {
        "from": from,
        "to": to,
        "fee": this.fee,
        "amount": amount,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.gh,
        "type": "pay"
    };
    stxKmd = await this.kcl.signTransaction(this.handle, this.wallet_pswd, this.txn);
    this.txid = await this.acl.sendRawTransaction(stxKmd);
    this.txid = this.txid.txId;
    await this.acl.statusAfterBlock(this.lastRound + 2);
    info = await this.acl.transactionInformation(from, this.txid);
    assert.deepStrictEqual(true, "type" in info);
    info = await this.acl.transactionById(this.txid);
    assert.deepStrictEqual(true, "type" in info);
});

Given('a split contract with ratio {int} to {int} and minimum payment {int}', function (rat2, rat1, minPay) {
    let owner = this.accounts[0];
    let receivers = [this.accounts[0], this.accounts[1]];
    let expiryRound = 100;
    let maxFee = 5000000;
    this.contractTestFixture.splitRat1 = parseInt(rat1);
    this.contractTestFixture.splitRat2 = parseInt(rat2);
    this.contractTestFixture.splitMin = parseInt(minPay);
    this.contractTestFixture.split = new splitTemplate.Split(owner, receivers[0], receivers[1], this.contractTestFixture.splitRat1, this.contractTestFixture.splitRat2, expiryRound, this.contractTestFixture.splitMin, maxFee)
    this.contractTestFixture.activeAddress = this.contractTestFixture.split.getAddress();
    this.contractTestFixture.contractFundAmount = minPay * (rat1 + rat2) * 10
});


When('I send the split transactions', async function () {
    let contractCode = this.contractTestFixture.split.getProgram();
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    let amount = this.contractTestFixture.splitMin * (this.contractTestFixture.splitRat1 + this.contractTestFixture.splitRat2);
    let txnBytes = splitTemplate.getSplitFundsTransaction(contractCode, amount, this.fv, this.lv, this.fee, this.params.genesishashb64);
    this.txid = await this.acl.sendRawTransaction(txnBytes);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
});

Given('an HTLC contract with hash preimage {string}', function (preimageStringB64) {
    // Write code here that turns the phrase above into concrete actions
    this.contractTestFixture.htlcPreimage = preimageStringB64;
    let preimageBytes = Buffer.from(preimageStringB64, 'base64');
    let hash = sha256.create();
    hash.update(preimageBytes);
    let hashB64String = Buffer.from(hash.hex(), 'hex').toString('base64');
    let hashFn = "sha256";
    let owner = this.accounts[0];
    let receiver = this.accounts[1];
    let expiryRound = 100;
    let maxFee = 1000000;
    this.contractTestFixture.htlc = new htlcTemplate.HTLC(owner, receiver, hashFn, hashB64String, expiryRound, maxFee);
    this.contractTestFixture.activeAddress = this.contractTestFixture.htlc.getAddress();
    this.contractTestFixture.contractFundAmount = 100000000;
});

When('I claim the algos', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    let payTxn = {
        "from": this.contractTestFixture.htlc.getAddress(),
        "to": this.accounts[1],
        "closeRemainderTo": this.accounts[1],
        "fee": this.fee,
        "amount": 0,
        "firstRound": this.fv,
        "lastRound": this.lv,
        "genesisHash": this.params.genesishashb64,
        "type": "pay"
    };
    let txnBytes = htlcTemplate.signTransactionWithHTLCUnlock(this.contractTestFixture.htlc.getProgram(), payTxn, this.contractTestFixture.htlcPreimage);
    this.txid = await this.acl.sendRawTransaction(txnBytes.blob);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
});

Given('a periodic payment contract with withdrawing window {int} and period {int}', function (withdrawWindow, period) {
    let receiver = this.accounts[0];
    let amount = 10000000;
    let expiryRound = 100;
    let maxFee = 1000000000000;
    this.contractTestFixture.periodicPay = new periodicPayTemplate.PeriodicPayment(receiver, amount, parseInt(withdrawWindow), parseInt(period), expiryRound, maxFee, undefined)
    this.contractTestFixture.activeAddress = this.contractTestFixture.periodicPay.getAddress();
    this.contractTestFixture.contractFundAmount = amount * 10;
    this.contractTestFixture.periodicPayPeriod = parseInt(period);
});

When('I claim the periodic payment', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    let remainder = this.fv % this.contractTestFixture.periodicPayPeriod;
    this.fv = this.fv + remainder;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;
    let txnBytes = periodicPayTemplate.getPeriodicPaymentWithdrawalTransaction(this.contractTestFixture.periodicPay.getProgram(), this.fee, this.fv, this.gh);
    this.txid = await this.acl.sendRawTransaction(txnBytes.blob);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
});

Given('a limit order contract with parameters {int} {int} {int}', function (ratn, ratd, minTrade) {
    let maxFee = 100000;
    let expiryRound = 100;
    this.contractTestFixture.limitOrderN = parseInt(ratn);
    this.contractTestFixture.limitOrderD = parseInt(ratd);
    this.contractTestFixture.limitOrderMin = parseInt(minTrade);
    this.contractTestFixture.contractFundAmount = 2 * parseInt(minTrade);
    if (this.contractTestFixture.contractFundAmount < 1000000) {
        this.contractTestFixture.contractFundAmount = 1000000;
    }
    let assetid = parseInt(this.assetTestFixture.index);
    this.contractTestFixture.limitOrder = new limitOrderTemplate.LimitOrder(this.accounts[0], assetid, parseInt(ratn), parseInt(ratd), expiryRound, parseInt(minTrade), maxFee);
    this.contractTestFixture.activeAddress = this.contractTestFixture.limitOrder.getAddress();
});

When('I swap assets for algos', async function () {
    let response = await this.kcl.exportKey(this.handle, this.wallet_pswd, this.accounts[1]);
    let secretKey = response.private_key;
    let microAlgoAmount = this.contractTestFixture.limitOrderMin + 1; // just over the minimum
    let assetAmount = Math.floor(microAlgoAmount * this.contractTestFixture.limitOrderN / this.contractTestFixture.limitOrderD) + 1;
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;
    let txnBytes = limitOrderTemplate.getSwapAssetsTransaction(this.contractTestFixture.limitOrder.getProgram(), assetAmount, microAlgoAmount, secretKey, this.fee, this.fv, this.lv, this.gh);
    this.txid = await this.acl.sendRawTransaction(txnBytes);
    this.txid = this.txid.txId;
    this.pk = this.contractTestFixture.activeAddress;
});

Given('a dynamic fee contract with amount {int}', async function (amount) {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    if (this.fv == 0) {
        this.fv = 1 ;
    }
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;
    this.contractTestFixture.contractFundAmount = parseInt(amount);
    this.contractTestFixture.dynamicFee = new dynamicFeeTemplate.DynamicFee(this.accounts[1], parseInt(amount), this.fv, this.lv); // intentionally leave optional args undefined
    this.contractTestFixture.activeAddress = this.contractTestFixture.dynamicFee.getAddress();
});

Given('I send the dynamic fee transactions', async function () {
    this.params = await this.acl.getTransactionParams();
    this.fee = this.params.fee;
    this.fv = this.params.lastRound;
    if (this.fv == 0) {
        this.fv = 1 ;
    }
    console.log(this.fv);
    this.lv = this.fv + 1000;
    this.lastRound = this.params.lastRound;
    this.gh = this.params.genesishashb64;

    let firstResponse = await this.kcl.exportKey(this.handle, this.wallet_pswd, this.accounts[0]);
    let secretKeyOne = firstResponse.private_key;
    let txnAndLsig = dynamicFeeTemplate.signDynamicFee(this.contractTestFixture.dynamicFee.getProgram(), secretKeyOne, this.gh);
    let secondResponse = await this.kcl.exportKey(this.handle, this.wallet_pswd, this.accounts[1]);
    let secretKeyTwo = secondResponse.private_key;
    let txnBytes = dynamicFeeTemplate.getDynamicFeeTransactions(txnAndLsig.txn, txnAndLsig.lsig, secretKeyTwo, this.fee);
    this.txid = await this.acl.sendRawTransaction(txnBytes);
    this.txid = this.txid.txId;
    this.pk = this.accounts[0];
});