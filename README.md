# js-algorand-sdk
[![Build Status](https://travis-ci.com/algorand/js-algorand-sdk.svg?branch=master)](https://travis-ci.com/algorand/js-algorand-sdk) [![npm version](https://badge.fury.io/js/algosdk.svg)](https://badge.fury.io/js/algosdk)

AlgoSDK is a javascript library for communicating with the Algorand network for modern browsers and node.js.

## Installation

### node.js
```
$ npm install algosdk
```

### Browser
The `dist` directory contains a minified version of the library - `algosdk.min.js`.
Include this line in your HTML.
```html
<script src="algosdk.min.js"/>
```

## SDK Development

### Building

To build a new version of the library for browsers, run:
```bash
npm build
```

### Testing

We have two test suites: mocha tests in this repo, and the Algorand SDK test suite from https://github.com/algorand/algorand-sdk-testing.

#### Node

To run the mocha tests in Node, run:
```bash
npm test
```

To run the SDK test suite in Node, run:
```bash
make docker-test
```

#### Browsers

The test suites can also run in browsers. To do so, set the environment variable `TEST_BROWSER` to
one of our supported browsers. Currently we support testing in `chrome` and `firefox`. When
`TEST_BROWSER` is set, the mocha and SDK test suites will run in that browser.

For example, to run mocha tests in Chrome:
```bash
TEST_BROWSER=chrome npm test
```

And to run SDK tests in Firefox:
```bash
TEST_BROWSER=firefox make docker-test
```

## Quick Start
```javascript
const token = "Your algod API token";
const server = "http://127.0.0.1";
const port = 8080;
const client = new algosdk.Algod(token, server, port);

(async () => {
    console.log(await client.status());
})().catch(e => {
    console.log(e);
});
```

## Documentation
For detailed information about the different API calls in `client`, visit https://developer.algorand.org
## Usage

#### Generate an Algorand account
```javascript
var keys = algosdk.generateAccount();
```
Example result
```text
{addr: "IB3NJALXLDX5JLYCD4TMTMLVCKDRZNS4JONHMIWD6XM7DSKYR7MWHI6I7U", sk: Uint8Array(64)}
```

#### Secret key to mnemonic
```javascript
var mnemonic = algosdk.secretKeyToMnemonic(keys.sk);
```
Example result
```text
"gorilla fortune learn marble essay uphold defense hover index effort ice atom figure will improve mom indoor mansion people elder hill material donkey abandon gown"
```

#### Mnemonic to secret key
```javascript
var secret_key = algosdk.mnemonicToSecretKey(mnemonic);
```
Example result
```text
{addr: "IB3NJALXLDX5JLYCD4TMTMLVCKDRZNS4JONHMIWD6XM7DSKYR7MWHI6I7U", sk: Uint8Array(64)}
```

#### Check the validity of an Address
```javascript
var isValid = algosdk.isValidAddress("IB3NJALXLDX5JLYCD4TMTMLVCKDRZNS4JONHMIWD6XM7DSKYR7MWHI6I7U");
```
Example result
```text
true
```

#### Encode/decode addresses
These two functions let you convert addresses between their string and binary representations.
```javascript
var decoded = algosdk.decodeAddress("IB3NJALXLDX5JLYCD4TMTMLVCKDRZNS4JONHMIWD6XM7DSKYR7MWHI6I7U");
var encoded = algosdk.encodeAddress(decoded.publicKey);
console.log('Decoded:', decoded);
console.log('Encoded:', encoded);
```
Result
```text
Decoded: {
  publicKey: Uint8Array(32) [
     64, 118, 212, 129, 119,  88, 239, 212,
    175,   2,  31,  38, 201, 177, 117,  18,
    135,  28, 182,  92,  75, 154, 118,  34,
    195, 245, 217, 241, 201,  88, 143, 217
  ],
  checksum: Uint8Array(4) [ 99, 163, 200, 253 ]
}
Encoded: IB3NJALXLDX5JLYCD4TMTMLVCKDRZNS4JONHMIWD6XM7DSKYR7MWHI6I7U
```

#### Sign a transaction 
In order to create and sign a transaction, create first an object with the relevant properties. 
There is no need to specify the `from` address, it is computed directly from the secretKey.  
**Note** -- The fields names must be identical to the following example's.  
**Note 2** -- In order to encode data into the note field, simply encode any JavaScript object using `algosdk.encodeObj(o)`. 
```javascript
var txn = { 
    "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
    "fee": 10,
    "amount": 847,
    "firstRound": 51,
    "lastRound": 61,
    "genesisID": "devnet-v33.0",
    "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
    "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
    "note": new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64"))
};
```

Then, call `signTransaction` and pass the transaction along with relevant private key.

```javascript
var signedTxn = algosdk.signTransaction(txn, keys.sk);
``` 

Now `signedTxn` can be posted to the network via `algod.sendRawTransaction()`. 


#### Master derivation key to mnemonic 
```javascript
var mnemonic = algosdk.masterDerivationKeyToMnemonic(mdk);
```  
Example result
```text
label danger traffic dream path boss runway worry awful abuse stairs spare wasp clock steel impact swear eagle canal diagram nation upon creek abstract pride
```

#### Mnemonic to master derivation key
```javascript
var mdk = algosdk.mnemonicToMasterDerivationKey(mnemonic);
```
Example result
```text
Uint8Array(32)
```


#### Sign a bid
Bids have similar pattern to a transaction.
First, create an object with the bid's information
```javascript
var bid = {
    "bidderKey": "IB3NJALXLDX5JLYCD4TMTMLVCKDRZNS4JONHMIWD6XM7DSKYR7MWHI6I7U",
    "auctionKey": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
    "bidAmount": 1000,
    "maxPrice": 10,
    "bidID": 2,
    "auctionID": 56
};
```
Then, call `signBid` and pass the bid and information along with the private key.

```javascript
var signedBid = algosdk.signBid(bid, keys.sk);
```

In order to send a bid to the network. Embbed the output of `algosdk.signBid` to a transaction `note`'s field.
For example,
```javascript
var txn = {
    "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
    "fee": 10,
    "amount": 0,
    "firstRound": 51,
    "lastRound": 61,
    "note": <signedBid>
};
```

#### Manipulating Multisig Transactions

This SDK also supports manipulating multisignature payment and keyreg transactions.

To create a multisignature transaction, first set up the multisignature identity:

```javascript
const params = {
    version: 1,
    threshold: 2,
    addrs: [
        "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
        "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
        "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
    ],
};
```

With these multisignature parameters, we can now create a (partially) signed multisignature transaction:

```javascript
// sk that matches "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU"
let mnem3 = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
let seed = passphrase.seedFromMnemonic(mnem3);
let sk = nacl.keyPairFromSeed(seed).secretKey;

let txn = {
    "to": "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
    "fee": 10,
    "amount": 10000,
    "firstRound": 1000,
    "lastRound": 1000,
    "genesisID": "devnet-v33.0",
    "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
    "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
    "note": new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64")),
};

let rawSignedTxn = algosdk.signMultisigTransaction(txn, params, sk).blob;
```

Now, we can broadcast this raw partially signed transaction to the network, which is valid if the threhsold is 1. 
We can also write it to a file (in node):

```javascript
const fs = require('fs');
fs.writeFile("/tmp/example_multisig.tx", Buffer.from(rawSignedTxn), function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});
```

We can import multiple files or raw signed transactions, and merge the multisignature transactions:

```javascript
let partialTxn1 = new Uint8Array(fs.readFileSync('/tmp/example_multisig.tx'));
let partialTxn2 = new Uint8Array(fs.readFileSync('/tmp/example_multisig_two.tx'));
let mergedTsigTxn = algosdk.mergeMultisigTransactions([partialTxn1, partialTxn2]);
```

We can also append our own signature, with knowledge of the public identity (params):

```javascript
let partialTxn1 = new Uint8Array(fs.readFileSync('/tmp/example_multisig.tx'));
const params = {
    version: 1,
    threshold: 2,
    addrs: [
        "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
        "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
        "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
    ],
};
// sk corresponding to "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA"
let mnem1 = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
let seed = passphrase.seedFromMnemonic(mnem1);
let sk = nacl.keyPairFromSeed(seed).secretKey;
let appendedMsigTxn = algosdk.appendSignMultisigTransaction(partialTxn1, params, sk).blob;
```

Any transaction blob returned by the multisignature API can be submitted to the network:

```javascript
let algodclient = new algosdk.Algod(atoken, aserver, aport);
//submit the transaction
(async () => {
    let tx = (await algodclient.sendRawTransaction(appendedMsigTxn));
    console.log(tx);
})().catch(e => {
    console.log(e.error);
});
```

#### Transaction group

Example below show how to group and send transactions:

```javascript
let txns = [...];  // array of unsigned transactions (dict or Transaction)
let sks = [...];   // array of appropriate secret keys
assert(txns.length == sks.length);

// assign group id
let txgroup = algosdk.assignGroupID(txns);
assert(txgroup.length == sks.length);

// sign all transactions
let signed = [];
for (let idx in txgroup) {
    signed.push(algosdk.signTransaction(txgroup[idx], sks[idx]));
}
// send array of signed transactions as a group
let algodclient = new algosdk.Algod(atoken, aserver, aport);
algodclient.sendRawTransactions(signed);
```

#### LogicSig Transactions

Demonstrate delegation for a standard account.

```javascript
// recover keys from mnemonic
let mnem = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
let seed = passphrase.seedFromMnemonic(mnem1);
let keys = nacl.keyPairFromSeed(seed);
let sender_pk = address.encode(keys.publicKey)

// create LogicSig object and sign with our secret key
let program = Uint8Array.from([1, 32, 1, 0, 34]);  // int 0 => never transfer money
let lsig = algosdk.makeLogicSig(program);
lsig.sign(keys.secretKey);

assert lsig.verify(sender_pk);

// create transaction
let txn = {
    "to": "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
    "from": sender,
    "fee": 10,
    "amount": 10000,
    "firstRound": 1000,
    "lastRound": 1000,
    "genesisID": "devnet-v33.0",
    "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
    "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
    "note": new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64")),
};

// create logic signed transaction.
let rawSignedTxn = algosdk.signLogicSigTransaction(txn, lsig).blob;

let algodclient = new algosdk.Algod(atoken, aserver, aport);
algodclient.sendRawTransaction(rawSignedTxn);
```

#### Assets

The Algorand protocol allows users to create and trade named assets on layer one. Creating and managing these assets
is done through the issuing of asset transactions. This section details how to make asset transactions, and what they do.

Asset creation: This allows a user to issue a new asset. The user can define the number of assets in circulation,
whether there is an account that can revoke assets, whether there is an account that can freeze user accounts, 
whether there is an account that can be considered the asset reserve, and whether there is an account that can change
the other accounts. The creating user can also do things like specify a name for the asset.
                                                                        
```javascript
let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"; // the account issuing the transaction; the asset creator
let fee = 10; // the number of microAlgos per byte to pay as a transaction fee
let defaultFrozen = false; // whether user accounts will need to be unfrozen before transacting
let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="; // hash of the genesis block of the network to be used
let totalIssuance = 100; // total number of this asset in circulation
let decimals = 0; // hint that the units of this asset are whole-integer amounts
let reserve = addr; // specified address is considered the asset reserve (it has no special privileges, this is only informational)
let freeze = addr; // specified address can freeze or unfreeze user asset holdings
let clawback = addr; // specified address can revoke user asset holdings and send them to other addresses
let manager = addr; // specified address can change reserve, freeze, clawback, and manager
let unitName = "tst"; // used to display asset units to user
let assetName = "testcoin"; // "friendly name" of asset
let genesisID = ""; // like genesisHash this is used to specify network to be used
let firstRound = 322575; // first Algorand round on which this transaction is valid
let lastRound = 322575; // last Algorand round on which this transaction is valid
let note = undefined; // arbitrary data to be stored in the transaction; here, none is stored
let assetURL = "http://someurl"; // optional string pointing to a URL relating to the asset 
let assetMetadataHash = "16efaa3924a6fd9d3a4824799a4ac65d"; // optional hash commitment of some sort relating to the asset. 32 character length.

// signing and sending "txn" allows "addr" to create an asset
let txn = algosdk.makeAssetCreateTxn(addr, fee, firstRound, lastRound, note,
    genesisHash, genesisID, totalIssuance, decimals, defaultFrozen, manager, reserve, freeze, clawback,
    unitName, assetName, assetURL, assetMetadataHash);
```


Asset reconfiguration: This allows the address specified as `manager` to change any of the special addresses for the asset,
such as the reserve address. To keep an address the same, it must be re-specified in each new configuration transaction.
Supplying an empty address is the same as turning the associated feature off for this asset. Once a special address
is set to the empty address, it can never change again. For example, if an asset configuration transaction specifying
`clawback=""` were issued, the associated asset could never be revoked from asset holders, and `clawback=""` would be
true for all time. The optional `strictEmptyAddressChecking` argument can help with this behavior: when set to its default `true`,
`makeAssetConfigTxn` will `throw` if any `undefined` management addresses are passed.                 
                                                                                                    
```javascript
let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
let fee = 10;
let assetIndex = 1234;
let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
let manager = addr;
let reserve = addr;
let freeze = addr;
let clawback = addr;
let genesisID = "";
let firstRound = 322575;
let lastRound = 322575;
let note = undefined;
let strictEmptyAddressChecking = true;

// signing and sending "txn" will allow the asset manager to change:
// asset manager, asset reserve, asset freeze manager, asset revocation manager 
let txn = algosdk.makeAssetConfigTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID,
    assetIndex, manager, reserve, freeze, clawback, strictEmptyAddressChecking);
```

Asset destruction: This allows the creator to remove the asset from the ledger, if all outstanding assets are held
by the creator.
```javascript
let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
let fee = 10;
let assetIndex = 1234;
let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
let genesisID = "";
let firstRound = 322575;
let lastRound = 322575;
let note = undefined;

// if all outstanding assets are held by the asset creator,
// the asset creator can sign and issue "txn" to remove the asset from the ledger. 
let txn = algosdk.makeAssetDestroyTxn(addr, fee, firstRound, lastRound, note, genesisHash, genesisID, assetIndex);
```

Begin accepting an asset: Before a user can begin transacting with an asset, the user must first issue an asset acceptance transaction.
This is a special case of the asset transfer transaction, where the user sends 0 assets to themself. After issuing this transaction,
the user can begin transacting with the asset. Each new accepted asset increases the user's minimum balance.                                                                                                                               
```javascript
let addr = "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU";
let fee = 10;
let sender = addr;
let recipient = sender;
let revocationTarget = undefined;
let closeRemainderTo = undefined;
let assetIndex = 1234;
let amount = 0;
let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
let genesisID = "";
let firstRound = 322575;
let lastRound = 322575;
let note = undefined;

// signing and sending "txn" allows sender to begin accepting asset specified by creator and index
let txn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
    fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex);
```

Transfer an asset: This allows users to transact with assets, after they have issued asset acceptance transactions. The
optional `closeRemainderTo` argument can be used to stop transacting with a particular asset. Note: A frozen account can always close
out to the asset creator.                                                                                                             
```javascript
let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
let fee = 10;
let sender = addr;
let recipient = "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU";
let revocationTarget = undefined;
let closeRemainderTo = undefined; // supply an address to close remaining balance after transfer to supplied address
let assetIndex = 1234;
let amount = 10;
let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
let genesisID = "";
let firstRound = 322575;
let lastRound = 322575;
let note = undefined;

// signing and sending "txn" will send "amount" assets from "sender" to "recipient"
let txn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
    fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex);
```

Revoke an asset: This allows an asset's revocation manager to transfer assets on behalf of another user. It will only work when 
issued by the asset's revocation manager.
```javascript
let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
let fee = 10;
let sender = addr;
let recipient = addr;
let revocationTarget = "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU";
let closeRemainderTo = undefined; 
let assetIndex = 1234;
let amount = 10;
let genesisHash = "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=";
let genesisID = "";
let firstRound = 322575;
let lastRound = 322575;
let note = undefined;

// signing and sending "txn" will send "amount" assets from "revocationTarget" to "recipient",
// if and only if sender == clawback manager for this asset
let txn = algosdk.makeAssetTransferTxn(sender, recipient, closeRemainderTo, revocationTarget,
    fee, amount, firstRound, lastRound, note, genesisHash, genesisID, assetIndex);
```

## Rekeying
To rekey an account to a new address, simply call the `addRekey` function on any transaction.
```javascript
//...
let txn = algosdk.makePaymentTxnWithSuggestedParams(from, to, amount, closeRemainderTo, note, suggestedParams);
// From now, every transaction needs to be sign the SK of the following address
txn.addRekey("47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU")
//...
```

When submitting a transaction from an account that was rekeying, simply use relevant SK. `algosdk.signTransaction`/`transaction.signTxn` will detect 
that the SK corresponding address is different than the sender's and will set the `AuthAddr` accordingly. Alternatively, you can use `kmdclient.signTransactionWithSpecificPublicKey`.

## Application Calls
The Algorand protocol allows users to define stateful TEAL contracts, also known as applications. 

The `makeApplicationCreateTxn` allows you to create an application:
```javascript
let from = "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU"
// suggestedParams received from suggestedParams endpoint
// onComplete is an option from algosdk.OnApplicationComplete, usually NoOpOC if creating
let approvalProgram = getApprovalProgram(); // perhaps stored as a file, or compiled elsewhere in an app using TEAL compile. This is bytecode that will determine if a transaction is approved
let clearProgram = getClearProgram(); // like approvalProgram this is bytecode, it is run when a user clears their state.
// the following four ints define the created application's storage
let numLocalInts = 1; // number of ints in per-user local state
let numLocalByteSlices = 1; // number of byte slices in per-user local state
let numGlobalInts = 1; // number of ints in app's global state
let numGlobalByteSlices = 1; // number of byte slices in app's global state
let createTxn = algosdk.makeApplicationCreateTxn(from, suggestedParams, onComplete, approvalProgram, clearProgram,
                                            numLocalInts, numLocalByteSlices, numGlobalInts, numGlobalByteSlices);
// signing and submission omitted
// can get created app index by querying information about confirmed createTxn, and inspecting txresults
```

Once created, an application can have its approval and clear programs updated with `makeApplicationUpdateTxn`:
```javascript
let updateTxn = algosdk.makeApplicationUpdateTxn(from, suggestedParams, appIndex, newApprovalProgram, newClearProgram);
```

Likewise, the application can later be deleted by its creator: 
```javascript
let deleteTxn = algosdk.makeApplicationDeleteTxn(from, suggestedParams, appIndex);
```

Users have several transaction types for interacting with applications. To begin using an application, a user must first opt in with an opt-in transaction, similar to opting in to an asset:
```javascript
let optInTxn = algosdk.makeApplicationOptInTxn(userAddress, suggestedParams, appIndex);
```

After opting in, a user can call the application with a no-op transaction:
```javascript
let callAppTxn = algosdk.makeApplicationNoOpTxn(userAddress, suggestedParams, appIndex);
```

The user also has two options for opting back out of an application. Closing out is the default way of opting out, clearing the user's state in the application, but it is subject to the `approvalProgram` and so may fail:
```javascript
// this txn may or may not be rejected by the approval program
let closeOutTxn = algosdk.makeApplicationCloseOutTxn(userAddress, suggestedParams, appIndex);
```
For a forced opt-out, the user also has the option of submitting a clear state transaction, guaranteeing the user can reclaim their `minBalance`.
```java
// this txn is not subject to the approval program
let clearStateTxn = algosdk.makeApplicationClearStateTxn(userAddress, suggestedParams, appIndex);
```

These application transaction-making functions also support additional optional fields like the `note` field - see each function's comments for more information.

## License
js-algorand-sdk is licensed under a MIT license. See the [LICENSE](https://github.com/algorand/js-algorand-sdk/blob/master/LICENSE) file for details.
