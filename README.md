# js-algorand-sdk
[![Build Status](https://travis-ci.com/algorand/js-algorand-sdk.svg?token=25XP72ADqbCQJ3TJVC9S&branch=master)](https://travis-ci.com/algorand/js-algorand-sdk) [![npm version](https://badge.fury.io/js/algosdk.svg)](https://badge.fury.io/js/algosdk)

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

#### Mnemonic to secret sey
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


## License
js-algorand-sdk is licensed under a MIT license. See the [LICENSE](https://github.com/algorand/js-algorand-sdk/blob/master/LICENSE) file for details.
