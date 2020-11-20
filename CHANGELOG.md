# 1.8.1
## Added
- Added `toString` and print methods to Transaction ([#243](https://github.com/algorand/js-algorand-sdk/pull/243)).
- Added functions to create Transactions from objects ([#246](https://github.com/algorand/js-algorand-sdk/pull/246)).
## Fixed
- Fixed issues using the library with webpack, including switching dependencies from `keccak` to `js-sha3` ([#247](https://github.com/algorand/js-algorand-sdk/pull/247)).
# 1.8.0
## Added
- Add `encodeAddress` and `decodeAddress` to convert between the binary and text form of Algorand
  addresses ([#216](https://github.com/algorand/js-algorand-sdk/pull/216)).
- Add `encodeUnsignedTransaction`, `decodeUnsignedTransaction`, `decodeSignedTransaction` to convert
  between binary transactions and transaction objects ([#218](https://github.com/algorand/js-algorand-sdk/pull/218)).
- Add optional `rekeyTo` parameter to transaction builder functions ([#221](https://github.com/algorand/js-algorand-sdk/pull/221)).
- Support testing on Chrome and Firefox in addition to Node ([#228](https://github.com/algorand/js-algorand-sdk/pull/228) and [#235](https://github.com/algorand/js-algorand-sdk/pull/235)).
## Fixed
- Update [keccak](https://www.npmjs.com/package/keccak) to 3.0.1, which fixes a build error that
  would occur every time the package was installed ([#151](https://github.com/algorand/js-algorand-sdk/pull/151)).
- Allow `assignGroupID` to accept raw transaction objects and instances of the `Transaction` class
  ([#236](https://github.com/algorand/js-algorand-sdk/pull/236)).
- Allow `signTransaction` to accept instances of the `Transaction` class ([#233](https://github.com/algorand/js-algorand-sdk/pull/233)).
- Improve type checking and documentation ([#233](https://github.com/algorand/js-algorand-sdk/pull/233) and [#231](https://github.com/algorand/js-algorand-sdk/pull/231)).
## Changed
- Switch to using [algo-msgpack-with-bigint](https://www.npmjs.com/package/algo-msgpack-with-bigint),
  which is a fork of [@msgpack/msgpack](https://www.npmjs.com/package/@msgpack/msgpack) with support
  for encoding and decoding BigInts ([#229](https://github.com/algorand/js-algorand-sdk/pull/229)).
- Update dependencies ([#237](https://github.com/algorand/js-algorand-sdk/pull/237)).
# 1.7.2
## Fixed
- Fixed msgpack endpoints returning undefined in browsers ([#210](https://github.com/algorand/js-algorand-sdk/pull/210) and [#215](https://github.com/algorand/js-algorand-sdk/pull/215)).
- Removed use of class properties ([#213](https://github.com/algorand/js-algorand-sdk/pull/213)).
## Changed
- Remove unneeded dependency js-yaml and changed mock-http-server to a dev dependency ([#214](https://github.com/algorand/js-algorand-sdk/pull/214) and [#212](https://github.com/algorand/js-algorand-sdk/pull/212)).
# 1.7.1
## Fixed
- Fixed set Accept on GET calls
## Changed
- Change algosdk.signMultisigTransaction to accept either a built Transaction or a dict of constructor args
# 1.7.0
## Added
- Support for Application Call Transactions, also known as Stateful TEAL
- Support for TEAL Compile and Dryrun
- Support for Rekeying Transactions
## Fixed
- An encoding failure due to an empty field will now indicate which field was empty
- Browserify can now handle newly exported modelsv2 package
# 1.6.2
## Fixed
- Fixed bug where submitting an array of transactions to v2 client's sendRawTransaction would cause an error. 
# 1.6.1
## Fixed
- Fixed bug where Indexer and algod V2 clients were omitted from module exports.
# 1.6.0
# Added
- Clients for Indexer and algod V2
# 1.5.0
# Added
-  additional Algorand Smart Contracts (ASC)
    -  support for Dynamic Fee contract
    -  support for Limit Order contract
    -  support for Periodic Payment contract
- support for Suggested Params
# 1.4.1
# Added
- Added asset decimals field. 
# 1.4.0
# Added
- Added support for Algorand Standardized Assets (ASA)
- Added support for Algorand Smart Contracts (ASC) 
    - Added support for Hashed Time Lock Contract (HTLC) 
    - Added support for Split contract
- Added support for Group Transactions
- Added support for leases
# 1.3.1
## Changed 
- msgpack lib was replaced with the official https://github.com/msgpack/msgpack-javascript
## Fixed 
- algod.transactionById returns the note as Uint8Array and not as base64   
# 1.3.0
## Added 
- Support for key registration transactions
- Support for flat fees
- Signing and verifying bytes
## Fixed 
- deleteMultisig uses post instead of get
- "MultiSig" standardized to "Multisig"
# 1.2.2
## Added 
- Support for Optional Parameters for GetTransactionsByAddress
# 1.2.1
## Added 
- Support for GetTransactionByID 
- Handle the case of undeclared noteField
# 1.2.0
## Added 
- Support of GenesisHash and Close Remainder To fields 
# 1.1.1
## Fixed
- Bug Fix for Suggested Fee
# 1.1.0
## Added
- Support for multisignatures
# 1.0.9
## Fixed
- kmd can now sign transactions
# 1.0.8
## Added
- Support in more than one token for algodClient
# 1.0.7
## Added
- Support in new Suggested Fee scheme
## Fixed
- Now the client handles empty transactions list
# 1.0.6
- Bug Fix
# 1.0.5
## Added
- Update to a newer msgpack version (Support 64bit numbers) 
- Update algod client to convert b64 to buffer 
# 1.0.4
## Added
- Support for arbitrary encoding and decoding of javascript objects 
# 1.0.3
## Added
- Support for transaction information in algodClient
# 1.0.2
## Added
- Support for "genesis ID" field in transactions
