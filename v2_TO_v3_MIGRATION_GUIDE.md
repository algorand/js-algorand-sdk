# Migration guide from v2 to v3

In 2024 we will release version 3 of the JavaScript Algorand SDK. This version includes a number of changes and improvements over the previous version. This guide is intended to help you migrate your existing code from version 2 to version 3.

## API Changes

### Addresses

The v2 `Address` interface has been upgraded to a class in v3.

In v2, you would use the `decodeAddress` and `encodeAddress` functions to convert between a 32-byte public key and an address string. These functions still exist in v3, but `decodeAddress` now returns an instance of the `Address` class.

For new code, it's probably more natural to use the `Address` class directly, rather than the `decodeAddress` and `encodeAddress` functions. The static method `Address.fromString` can be used to create an `Address` instance from a string, and the `toString` method can be used to convert an `Address` instance to a string.

```typescript
// v2
const address = algosdk.decodeAddress(
  'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
);
console.log('Address 32-byte public key component:', address.publicKey);
console.log('Address checksum:', address.checksum);
console.log('Address string:', algosdk.encodeAddress(address.publicKey));

// v3
const address = algosdk.Address.fromString(
  'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
);
console.log('Address 32-byte public key component:', address.publicKey);
console.log('Address checksum:', address.checksum());
console.log('Address string:', address.toString());
```

In most places where you passed addresses as strings in v2, you can now choose to pass either a string or an instance of the `Address` class in v3. Internally, the SDK will convert the string to an `Address` instance if necessary.

### Transactions

In v3, the `Transaction` class underwent a significant internal refactor. For the most part, this class will behave the same as it did in v2, but there are a few changes to be aware of.

#### Construction

First, we will focus on the changes to the `make*` functions, which remain the recommended way to construct a `Transaction` instance in v3.

Since v1.8.1 was released in 2020, this library has supported two general ways of creating transactions:

```typescript
// Warning: This is v2 code. Code for v3 is shown later in this section.
const suggestedParams = await client.getTransactionParams().do();

// Method 1: Using the "standard" version of the maker function for a specific transaction type.
// This standard version passes parameters as individual arguments.
const txn = algosdk.makePaymentTxnWithSuggestedParams(
  'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI',
  '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
  1000,
  undefined,
  Uint8Array.from([1, 2, 3]),
  suggestedParams,
  undefined
);

// Method 2: Using the "FromObject" variant of the function, which takes a single parameter object.
const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  from: 'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI',
  to: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
  amount: 1000,
  note: Uint8Array.from([1, 2, 3]),
  suggestedParams,
});
```

We believe the second method, using the `FromObject` variant which takes a parameter object, is significantly more readable and maintainable, so we have removed the other variants in v3.

Specifically, these functions were removed in v3:

| v2 Function                                 | v3 Replacement                                        |
| ------------------------------------------- | ----------------------------------------------------- |
| `makePaymentTxnWithSuggestedParams`         | `makePaymentTxnWithSuggestedParamsFromObject`         |
| `makeKeyRegistrationTxnWithSuggestedParams` | `makeKeyRegistrationTxnWithSuggestedParamsFromObject` |
| `makeAssetCreateTxnWithSuggestedParams`     | `makeAssetCreateTxnWithSuggestedParamsFromObject`     |
| `makeAssetConfigTxnWithSuggestedParams`     | `makeAssetConfigTxnWithSuggestedParamsFromObject`     |
| `makeAssetDestroyTxnWithSuggestedParams`    | `makeAssetDestroyTxnWithSuggestedParamsFromObject`    |
| `makeAssetFreezeTxnWithSuggestedParams`     | `makeAssetFreezeTxnWithSuggestedParamsFromObject`     |
| `makeAssetTransferTxnWithSuggestedParams`   | `makeAssetTransferTxnWithSuggestedParamsFromObject`   |
| `makeApplicationCreateTxn`                  | `makeApplicationCreateTxnFromObject`                  |
| `makeApplicationUpdateTxn`                  | `makeApplicationUpdateTxnFromObject`                  |
| `makeApplicationDeleteTxn`                  | `makeApplicationDeleteTxnFromObject`                  |
| `makeApplicationOptInTxn`                   | `makeApplicationOptInTxnFromObject`                   |
| `makeApplicationCloseOutTxn`                | `makeApplicationCloseOutTxnFromObject`                |
| `makeApplicationClearStateTxn`              | `makeApplicationClearStateTxnFromObject`              |
| `makeApplicationNoOpTxn`                    | `makeApplicationNoOpTxnFromObject`                    |

In addition to removing these functions, we have also changed some inputs to the remaining functions. In v2, the argument types of the `make*FromObject` functions were a rather complicated union of many derived types. In the interest of simplicity and ease of use, we have greatly simplified these types in v3. Specifically, these types and interfaces were removed in v2:

- `PaymentTxn`
- `KeyRegistrationTxn`
- `AssetCreateTxn`
- `AssetConfigTxn`
- `AssetDestroyTxn`
- `AssetFreezeTxn`
- `AssetTransferTxn`
- `AppCreateTxn`
- `AppUpdateTxn`
- `AppDeleteTxn`
- `AppOptInTxn`
- `AppCloseOutTxn`
- `AppClearStateTxn`
- `AppNoOpTxn`
- `StateProofTxn`
- `AnyTransaction`
- `MustHaveSuggestedParams`
- `MustHaveSuggestedParamsInline`

To replace them, these interfaces are introduced in v3:

- `CommonTransactionParams`: Contains parameters common to every transaction type
- `PaymentTransactionParams`: Contains payment transaction parameters
- `KeyRegistrationTransactionParams`: Contains key registration transaction parameters
- `AssetConfigurationTransactionParams`: Contains asset configuration transaction parameters
- `AssetTransferTransactionParams`: Contains asset transfer transaction parameters
- `AssetFreezeTransactionParams`: Contains asset freeze transaction parameters
- `ApplicationCallTransactionParams`: Contains application call transaction parameters
- `TransactionParams`: Contains all necessary parameters to construct a transaction of any type

Every transaction type has a base `make*` function whose single parameter object is a union of its specific transaction parameter type outlined above, and `CommonTransactionParams`. For example, the `makePaymentTxnWithSuggestedParamsFromObject` function takes a parameter object of type `PaymentTransactionParams & CommonTransactionParams`.

These interfaces differ slightly from the v2 types. Some field names have changed in order to be more consistent with their usage in other contexts, and some types have changed as well. The table below covers all name changes and cases where types become more restrictive. Fields where the only change was a type becoming less restrictive (e.g. `string` to `string | Address`) are not covered here.

| Transaction Type | v2 Parameter        | v2 Parameter Type      | v2 Parameter        | v3 Parameter Type   | Notes                                      |
| ---------------- | ------------------- | ---------------------- | ------------------- | ------------------- | ------------------------------------------ |
| All              | `from`              | `string`               | `sender`            | `string \| Address` |                                            |
| Payment          | `to`                | `string`               | `receiver`          | `string \| Address` |                                            |
| Key Registration | `voteKey`           | `string \| Uint8Array` | `voteKey`           | `Uint8Array`        | Base64 encoded value is no longer accepted |
| "                | `selectionKey`      | `string \| Uint8Array` | `selectionKey`      | `Uint8Array`        | Base64 encoded value is no longer accepted |
| "                | `stateProofKey`     | `string \| Uint8Array` | `stateProofKey`     | `Uint8Array`        | Base64 encoded value is no longer accepted |
| Asset Config     | `assetMetadataHash` | `string \| Uint8Array` | `assetMetadataHash` | `Uint8Array`        | Base64 encoded value is no longer accepted |
| Asset Freeze     | `freezeState`       | `boolean`              | `frozen`            | `boolean`           |                                            |
| Asset Transfer   | `to`                | `string`               | `receiver`          | `string \| Address` |                                            |
| "                | `revocationTarget`  | `string`               | `assetSender`       | `string \| Address` |                                            |

Given these changes, the earlier v2 example would be equivalent to the following in v3:

```typescript
const suggestedParams = await client.getTransactionParams().do();

const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  sender: 'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI',
  receiver: '7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q',
  amount: 1000,
  note: Uint8Array.from([1, 2, 3]),
  suggestedParams,
});
```

Similar to the input types from the `make*` functions, the input type to the `Transaction` constructor has changed. This type is now the `TransactionParams` interface, which contains each of the above type-specific transaction parameter types as optional fields. For example, it has a field called `paymentParams` with the type `PaymentTransactionParams`. The same changes to field names and types that affected the `make*` functions also affect the `Transaction` constructor.

#### Fields

The following table shows the correspondence between v2 and v3 fields in the `Transaction` class. The most significant change is that fields specific to a transaction type are now nested under an object corresponding to that transaction type. For example, the `amount` field is now `payment.amount` or `assetTransfer.amount`, depending on the transaction type. The object for that transaction type will only exist if the transaction is that type, otherwise it will be undefined.

| v2 Field                | v2 Field Type           | v3 Field                              | v3 Field Type               | Notes                                     |
| ----------------------- | ----------------------- | ------------------------------------- | --------------------------- | ----------------------------------------- |
| `type`                  | `TransactionType`       | `type`                                | `TransactionType`           |                                           |
| `fee`                   | `number`                | `fee`                                 | `bigint`                    |                                           |
| `flatFee`               | `boolean`               |                                       |                             | No longer exists                          |
| `firstRound`            | `number`                | `firstValid`                          | `bigint`                    |                                           |
| `lastRound`             | `number`                | `lastValid`                           | `bigint`                    |                                           |
| `genesisID`             | `string`                | `genesisID`                           | `string`                    | Field is now optional                     |
| `genesisHash`           | `Buffer`                | `genesisHash`                         | `Uint8Array`                | Field is now optional                     |
| `note`                  | `Uint8Array`            | `note`                                | `Uint8Array`                |                                           |
| `reKeyTo`               | `Address`               | `rekeyTo`                             | `Address`                   |                                           |
| `lease`                 | `Uint8Array`            | `lease`                               | `Uint8Array`                |                                           |
| `group`                 | `Buffer`                | `group`                               | `Uint8Array`                |                                           |
| `from`                  | `Address`               | `sender`                              | `Address`                   |                                           |
| `to`                    | `Address`               | `payment.receiver`                    | `Address`                   | If the transaction type is payment        |
| "                       | "                       | `assetTransfer.receiver`              | `Address`                   | If the transaction type is asset transfer |
| `amount`                | `number \| bigint`      | `payment.amount`                      | `bigint`                    | If the transaction type is payment        |
| "                       | "                       | `assetTransfer.amount`                | `bigint`                    | If the transaction type is asset transfer |
| `closeRemainderTo`      | `Address`               | `payment.closeRemainderTo`            | `Address`                   | If the transaction type is payment        |
| "                       | "                       | `assetTransfer.closeRemainderTo`      | `Address`                   | If the transaction type is asset transfer |
| `voteKey`               | `Buffer`                | `keyreg.voteKey`                      | `Uint8Array`                |                                           |
| `selectionKey`          | `Buffer`                | `keyreg.selectionKey`                 | `Uint8Array`                |                                           |
| `stateProofKey`         | `Buffer`                | `keyreg.stateProofKey`                | `Uint8Array`                |                                           |
| `voteFirst`             | `number`                | `keyreg.voteFirst`                    | `bigint`                    |                                           |
| `voteLast`              | `number`                | `keyreg.voteLast`                     | `bigint`                    |                                           |
| `voteKeyDilution`       | `number`                | `keyreg.voteKeyDilution`              | `bigint`                    |                                           |
| `nonParticipation`      | `boolean`               | `keyreg.nonParticipation`             | `boolean`                   |                                           |
| `assetIndex`            | `number`                | `assetConfig.assetIndex`              | `bigint`                    | If the transaction type is asset config   |
| "                       | "                       | `assetTransfer.assetIndex`            | `bigint`                    | If the transaction type is asset transfer |
| "                       | "                       | `assetFreeze.assetIndex`              | `bigint`                    | If the transaction type is asset freeze   |
| `assetTotal`            | `number \| bigint`      | `assetConfig.total`                   | `bigint`                    |                                           |
| `assetDecimals`         | `number`                | `assetConfig.decimals`                | `number`                    |                                           |
| `assetDefaultFrozen`    | `boolean`               | `assetConfig.defaultFrozen`           | `boolean`                   |                                           |
| `assetManager`          | `Address`               | `assetConfig.manager`                 | `Address`                   |                                           |
| `assetReserve`          | `Address`               | `assetConfig.reserve`                 | `Address`                   |                                           |
| `assetFreeze`           | `Address`               | `assetConfig.freeze`                  | `Address`                   |                                           |
| `assetClawback`         | `Address`               | `assetConfig.clawback`                | `Address`                   |                                           |
| `assetUnitName`         | `string`                | `assetConfig.unitName`                | `string`                    |                                           |
| `assetName`             | `string`                | `assetConfig.assetName`               | `string`                    |                                           |
| `assetURL`              | `string`                | `assetConfig.assetURL`                | `string`                    |                                           |
| `assetMetadataHash`     | `Uint8Array`            | `assetConfig.assetMetadataHash`       | `Uint8Array`                |                                           |
| `freezeAccount`         | `Address`               | `assetFreeze.freezeAccount`           | `Address`                   |                                           |
| `freezeState`           | `boolean`               | `assetFreeze.frozen`                  | `boolean`                   |                                           |
| `assetRevocationTarget` | `Address`               | `assetTransfer.assetSender`           | `Address`                   |                                           |
| `appIndex`              | `number`                | `applicationCall.appIndex`            | `bigint`                    |                                           |
| `appOnComplete`         | `OnApplicationComplete` | `applicationCall.onComplete`          | `OnApplicationComplete`     |                                           |
| `appLocalInts`          | `number`                | `applicationCall.numLocalInts`        | `number`                    |                                           |
| `appLocalByteSlices`    | `number`                | `applicationCall.numLocalByteSlices`  | `number`                    |                                           |
| `appGlobalInts`         | `number`                | `applicationCall.numGlobalInts`       | `number`                    |                                           |
| `appGlobalByteSlices`   | `number`                | `applicationCall.numGlobalByteSlices` | `number`                    |                                           |
| `extraPages`            | `number`                | `applicationCall.extraPages`          | `number`                    |                                           |
| `appApprovalProgram`    | `Uint8Array`            | `applicationCall.approvalProgram`     | `Uint8Array`                |                                           |
| `appClearProgram`       | `Uint8Array`            | `applicationCall.clearProgram`        | `Uint8Array`                |                                           |
| `appArgs`               | `Uint8Array[]`          | `applicationCall.appArgs`             | `Uint8Array[]`              |                                           |
| `appAccounts`           | `Address[]`             | `applicationCall.accounts`            | `Address[]`                 |                                           |
| `appForeignApps`        | `number[]`              | `applicationCall.foreignApps`         | `bigint[]`                  |                                           |
| `appForeignAssets`      | `number[]`              | `applicationCall.foreignAssets`       | `bigint[]`                  |                                           |
| `boxes`                 | `BoxReference[]`        | `applicationCall.boxes`               | `TransactionBoxReference[]` |                                           |
| `stateProofType`        | `number \| bigint`      | `stateProof.stateProofType`           | `number`                    |                                           |
| `stateProof`            | `Uint8Array`            | `stateProof.stateProof`               | `Uint8Array`                |                                           |
| `stateProofMessage`     | `Uint8Array`            | `stateProof.stateProofMessage`        | `Uint8Array`                |                                           |
| `name`                  | `string`                |                                       |                             | No longer exists                          |
| `tag`                   | `Buffer`                |                                       |                             | No longer exists                          |

Note that for v2, the `Address` type indicates the v2 `Address` interface, while for v3, the `Address` type indicates the v3 `Address` class. See the [Addresses](#addresses) section for more information.

#### Methods

The following methods have been removed from the public `Transaction` class API in v3:

- `_getDictForDisplay`
- `toString`
- `prettyPrint`
- `addLease`
- `addRekey`
- `estimateSize`

We believe these methods were not useful to most users, and we have removed them to simplify the API. Specifically, the `addLease` and `addRekey` options are no longer necessary, since it's possible to include these fields in the transaction parameter object when creating the transaction.

#### Passing Transactions to Functions

In v2, it was possible to pass a raw object with the same properties that the `Transaction` constructor would accept to many functions that expected a `Transaction` instance. This was made possible with the `TransactionLike` type.

That type has been removed and this behavior is no longer possible in v3. Instead, you must explicitly construct `Transaction` instances, preferably using the `make*` functions.

#### Multisig Transaction Class

The `MultisigTransaction` class have been removed, as it was unnecessary.

#### Transaction Group Class

The `TxGroup` class has been removed, as it was unnecessary.

### Suggested Transaction Parameters

The `SuggestedParams` interface plays an important role in creating new transactions. In v2, there were `SuggestedParams` and `SuggestedParamsWithMinFee` interfaces, but the `minFee` field was never used by the transaction construction functions; instead, they used the hardcoded constant `ALGORAND_MIN_TX_FEE`, which was 1000 microAlgos.

In v3, we've removed the need for `SuggestedParamsWithMinFee` and added the `minFee` field to the `SuggestedParams` interface. This field is now required, and the `ALGORAND_MIN_TX_FEE` constant has been removed.

This allows the SDK to use the min fee information provided by the node, which has the potential to change over time or for different networks.

In total, these changes were made to the `SuggestedParams` fields:

| Field         | v2 Field Type | v3 Field Type      | Notes                                           |
| ------------- | ------------- | ------------------ | ----------------------------------------------- |
| `minFee`      | Did not exist | `number \| bigint` | Introduced new required field                   |
| `genesisID`   | `string`      | `string`           | Field is now optional                           |
| `genesisHash` | `string`      | `Uint8Array`       | Field is now optional, and must be a Uint8Array |

If you manually constructed `SuggestedParams` objects in v2, you will need to add a `minFee` field to those objects in v3, and you will need to convert your `genesisHash` string to a `Uint8Array`. Consider using the new `base64ToBytes` function to do this.

We expect most users to not be affected by this, since if you use Algod to get suggested parameters, it will include all parameters in the correct format.

### Auction Bids

Auction bids have been removed from the library in v3, as they were only relevant to the launch of MainNet.
