# v1.21.0

## What's Changed

### Enhancements

- Enhancement: Removing more unused steps by @tzaffi in https://github.com/algorand/js-algorand-sdk/pull/637
- Enhancement: Add deprecation tag to algod v1 client by @algochoi in https://github.com/algorand/js-algorand-sdk/pull/642
- enhancement: add unit test for ParticipationUpdates field by @shiqizng in https://github.com/algorand/js-algorand-sdk/pull/652

**Full Changelog**: https://github.com/algorand/js-algorand-sdk/compare/v1.20.0...v1.21.0

# v1.20.0

## What's Changed

### Bugfixes

- Bug-Fix: Pass verbosity to the harness and sandbox by @tzaffi in https://github.com/algorand/js-algorand-sdk/pull/630

### Enhancements

- Enhancement: Use sandbox for SDK Testing and remove Indexer v1 steps by @algochoi in https://github.com/algorand/js-algorand-sdk/pull/623
- Tidy: Ignore algorand-sdk-testing test-harness dir by @michaeldiamant in https://github.com/algorand/js-algorand-sdk/pull/634
- Enhancement: Deprecating use of langspec by @ahangsu in https://github.com/algorand/js-algorand-sdk/pull/632
- enhancement: Initial stateproofs support by @Eric-Warehime in https://github.com/algorand/js-algorand-sdk/pull/629

**Full Changelog**: https://github.com/algorand/js-algorand-sdk/compare/v1.19.1...v1.20.0

# v1.20.0-beta.1

## What's Changed

### Bugfixes

- Bug-Fix: Pass verbosity to the harness and sandbox by @tzaffi in https://github.com/algorand/js-algorand-sdk/pull/630

### Enhancements

- Enhancement: Use sandbox for SDK Testing and remove Indexer v1 steps by @algochoi in https://github.com/algorand/js-algorand-sdk/pull/623
- Tidy: Ignore algorand-sdk-testing test-harness dir by @michaeldiamant in https://github.com/algorand/js-algorand-sdk/pull/634
- Enhancement: Deprecating use of langspec by @ahangsu in https://github.com/algorand/js-algorand-sdk/pull/632
- enhancement: Initial stateproofs support by @Eric-Warehime in https://github.com/algorand/js-algorand-sdk/pull/629

## New Contributors

- @ahangsu made their first contribution in https://github.com/algorand/js-algorand-sdk/pull/632

**Full Changelog**: https://github.com/algorand/js-algorand-sdk/compare/v1.19.1...v1.20.0-beta.1

# v1.19.1

### Enhancements

- API: Support attaching signatures to standard and multisig transactions by @jdtzmn in https://github.com/algorand/js-algorand-sdk/pull/595
- AVM: Consolidate TEAL and AVM versions by @michaeldiamant in https://github.com/algorand/js-algorand-sdk/pull/609
- Testing: Use Dev mode network for cucumber tests by @algochoi in https://github.com/algorand/js-algorand-sdk/pull/614

# v1.19.0

## What's Changed

### Bugfixes

- tech-debt: Remove unused/unmaintained templates by @Eric-Warehime in https://github.com/algorand/js-algorand-sdk/pull/607

### New Features

- Dev Tools: Source map decoder by @barnjamin in https://github.com/algorand/js-algorand-sdk/pull/590
- Enhancement: Upgrade typedoc and plugins by @fionnachan in https://github.com/algorand/js-algorand-sdk/pull/605

### Enhancements

- Github-Actions: Adding PR title and label checks by @algojack in https://github.com/algorand/js-algorand-sdk/pull/600
- docs: tealSign by @AlgoDoggo in https://github.com/algorand/js-algorand-sdk/pull/610

# v1.18.1

## What's Changed

- Properly set maxWidth in trace by @joe-p in https://github.com/algorand/js-algorand-sdk/pull/593
- fix: safe intDecoding by @AlgoDoggo in https://github.com/algorand/js-algorand-sdk/pull/599
- Remove code that relies on node's path module by @bmdelacruz in https://github.com/algorand/js-algorand-sdk/pull/598

## New Contributors

- @AlgoDoggo made their first contribution in https://github.com/algorand/js-algorand-sdk/pull/599
- @bmdelacruz made their first contribution in https://github.com/algorand/js-algorand-sdk/pull/598

# v1.18.0

## What's Changed

- Add method to abi results by @barnjamin in https://github.com/algorand/js-algorand-sdk/pull/578
- Add getMethodByName function to Contract and Interface by @barnjamin in https://github.com/algorand/js-algorand-sdk/pull/583

# v1.17.0

## What's Changed

- Allow Uint8Arrays public keys for kmd signing by @vividn in https://github.com/algorand/js-algorand-sdk/pull/549
- Update generated files by @Eric-Warehime in https://github.com/algorand/js-algorand-sdk/pull/569
- Build: Add SDK code generation workflow by @Eric-Warehime in https://github.com/algorand/js-algorand-sdk/pull/570
- Update codegen.yml by @Eric-Warehime in https://github.com/algorand/js-algorand-sdk/pull/574
- Generate updated client API code by @algoidurovic in https://github.com/algorand/js-algorand-sdk/pull/566

## New Contributors

- @vividn made their first contribution in https://github.com/algorand/js-algorand-sdk/pull/549
- @Eric-Warehime made their first contribution in https://github.com/algorand/js-algorand-sdk/pull/569
- @algoidurovic made their first contribution in https://github.com/algorand/js-algorand-sdk/pull/566

# v1.16.0

## Added

- Dryrun stack printer
- Document more Indexer methods

## Fixed

- Corrected type of KMD keys
- Include foreign app addr in dryrun requests

# v1.15.0

## Added

- Support unlimited assets REST API changes. (#527)

## Fixed

- Fix app creation createDryrun error (#539)
- Fix cucumber tests for asset lookup step (#540)
- Fix searchForApplications filter by creator parameter type. (#546)

# v1.15.0-beta.1

## Added

- Support unlimited assets REST API changes. (#527)

## Fixed

- Fix app creation createDryrun error (#539)
- Fix cucumber tests for asset lookup step (#540)

# v1.14.0

## Added

- Add stateproof keyreg field (#463)

## Changed

- Implement C2C tests (#498)
- Moving from travis to circleci (#507)
- Add installation instructions for vite users (#512)
- Update langspec for TEAL 6 (#518)
- Docs for `lookupAssetByID` and `lookupAccountTransactions` (#516)
- Make FromObject parameter IntelliSense human readable (#528)
- Bump url-parse from 1.5.1 to 1.5.8 (#529)

## Fixed

- Use HTTP request format arg to determine response type (#532)
- Update chromedriver (#535)

# v1.14.0-beta.1

## Added

- Add stateproof keyreg field (#463)

## Changed

- Implement C2C tests (#498)
- Moving from travis to circleci (#507)
- Add installation instructions for vite users (#512)
- Update langspec for TEAL 6 (#518)

# 1.13.1

## Added:

- Add app creator to dryrun request (#499)

## Changed:

- Adding note to use bigint (#501)

## Fixed:

- Fix JSON decoding (#502)

# 1.13.0

## Added:

- Create dryrun (#478)
- Support ABI reference types and other improvements (#482)
- Improve HTTP error messages (#485)
- Enabling a custom client for Algod and Indexer (#477)
- Export sdk subclasses to typedoc (#479)
- ABI Support for JS library (#454)
- ABI interaction support (#466)
- Wait for confirmation function (#469)
- Add freezeAccount encoding in display method (#460)
- Regenerate code from specification file (#456)

## Changed:

- Document Indexer methods (#491)
- Document Algodv2 methods (#486)
- Update chromedriver (#492)

## Fixed:

- Fix wait for confirmation function (#480)
- Fix type for foreignAssets (#472)

# 1.13.0-beta.2

## Added

- Support ABI reference types and other improvements (#482)
- Improve HTTP error messages (#485)
- Enabling a custom client for Algod and Indexer (#477)
- Export sdk subclasses to typedoc (#479)

## Fixed

- Fix wait for confirmation function (#480)

# 1.13.0-beta.1

## Added

- ABI Support for JS library (#454)
- ABI interaction support (#466)
- Wait for confirmation function (#469)
- Add freezeAccount encoding in display method (#460)
- Regenerate code from specification file (#456)

## Fixed

- Fix type for foreignAssets (#472)

# 1.12.0

## Added

- Support AVM 1.0
- Support deserializing nonparticipating and offline keyreg
- Support deserializing nonparticipating transaction

## Fixed

- Key registration transaction with nonParticipation=true

# 1.11.1

## Fixed

- Properly decode transaction extra pages field (#419)

# 1.11.0

## Added

- Signing support for rekeying to LogicSig/MultiSig account

# 1.10.1

## Added

- Add missing fields `msig` and `lsig` to `EncodedSignedTransaction` type
- Add the missing type `SignedTransaction`, which helped fix the `any` return value for `Transaction.from_obj_for_encoding`
- More internal types are now exported
- Support the new base64 asset fields in algod models
- Add ability to install the package from a git URL with npm

## Fixed

- Remove BigInt literals from package
- Support encoding transactions with a first round of zero
- Fix msgpack encoding of dryrun objects

# 1.10.0

## Added

- Support for dynamic opcode accounting, backward jumps, loops, callsub, retsub
- Ability to pool fees
- Ability to pay for extra pages

## Changed

- Add link to docs in readme
- Update examples on getting `suggestedParams`
- Grammatical fixes

## Fixed

- Fix asset creation transaction types that should be optional
- Remove synthetic default imports
- Use DryrunRequest instead of DryrunSource in constructor

# 1.9.1

## Changed

- Changed our browser bundle from webpack's `window` type to `UMD`, which fixes issues when using
  the library from React ([#352](https://github.com/algorand/js-algorand-sdk/issues/352)).

# 1.9.0

## Added

- TypeScript support ([#302](https://github.com/algorand/js-algorand-sdk/pull/302), [#314](https://github.com/algorand/js-algorand-sdk/pull/314), [#315](https://github.com/algorand/js-algorand-sdk/pull/315), [#317](https://github.com/algorand/js-algorand-sdk/pull/317), [#313](https://github.com/algorand/js-algorand-sdk/pull/313), [#319](https://github.com/algorand/js-algorand-sdk/pull/319), [#323](https://github.com/algorand/js-algorand-sdk/pull/323), [#318](https://github.com/algorand/js-algorand-sdk/pull/318), [#331](https://github.com/algorand/js-algorand-sdk/pull/331), [#325](https://github.com/algorand/js-algorand-sdk/pull/325), [#337](https://github.com/algorand/js-algorand-sdk/pull/337)).
- Allow BigInts to be used to construct Transactions ([#263](https://github.com/algorand/js-algorand-sdk/pull/263)).
- `decodeAddress` now verifies the address checksum ([#269](https://github.com/algorand/js-algorand-sdk/pull/269)).
- Add support for nonparticipating key registration transactions ([#271](https://github.com/algorand/js-algorand-sdk/pull/271)).
- Allow LogicSigs to sign transactions with a different AuthAddr ([#268](https://github.com/algorand/js-algorand-sdk/pull/268)).
- Support for decoding BigInts from API calls ([#260](https://github.com/algorand/js-algorand-sdk/pull/260)).
- Add helper functions to encode and decode integers ([#281](https://github.com/algorand/js-algorand-sdk/pull/281)).
- Support new features from indexer v2.3.2 ([#296](https://github.com/algorand/js-algorand-sdk/pull/296)).
- Support TEAL 3 programs ([#294](https://github.com/algorand/js-algorand-sdk/pull/294)).

## Fixed

- Properly validate `assetMetadataHash` and `lease` ([#253](https://github.com/algorand/js-algorand-sdk/pull/253), [#280](https://github.com/algorand/js-algorand-sdk/pull/280)).
- Fix the `Algodv2.versionsCheck().do()` method ([#258](https://github.com/algorand/js-algorand-sdk/pull/258)).
- Fix an issue using `mergeMultisigTransactions` in React ([#259](https://github.com/algorand/js-algorand-sdk/pull/259)).
- Fix the inability to specify rekey addresses in several makeTransaction functions ([#267](https://github.com/algorand/js-algorand-sdk/pull/267)).
- Stop the Transaction constructor from modifying input arrays ([#279](https://github.com/algorand/js-algorand-sdk/pull/279)).
- Allow `signLogicSigTransaction` to accept Transaction objects ([#290](https://github.com/algorand/js-algorand-sdk/pull/290)).

## Changed

- Update examples to use v2 endpoints ([#289](https://github.com/algorand/js-algorand-sdk/pull/289)).
- Improve error trace reporting ([#291](https://github.com/algorand/js-algorand-sdk/pull/291)).
- Establish consistent code style ([#299](https://github.com/algorand/js-algorand-sdk/pull/299)).
- Remove `dist` folder from repo ([#326](https://github.com/algorand/js-algorand-sdk/pull/326)).

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

- additional Algorand Smart Contracts (ASC)
  - support for Dynamic Fee contract
  - support for Limit Order contract
  - support for Periodic Payment contract
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
