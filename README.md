# js-algorand-sdk
[![Build Status](https://travis-ci.com/algorand/js-algorand-sdk.svg?token=25XP72ADqbCQJ3TJVC9S&branch=master)](https://travis-ci.com/algorand/js-algorand-sdk)

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
```javascript
var txn = { 
    "to": "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q",
    "fee": 10,
    "amount": 847,
    "firstRound": 51,
    "lastRound": 61,
    "note": new Uint8Array(0)
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

## Contributing
For information on how to contribute, please refer to our contribution guide.

## License
js-algorand-sdk is licensed under a MIT license. See the [LICENSE](https://github.com/algorand/js-algorand-sdk/blob/master/LICENSE) file for details.