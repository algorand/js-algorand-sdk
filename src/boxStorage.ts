import { BoxReference } from './types/transactions/base.js';
import { MsgpackEncodingData, JSONEncodingData } from './encoding/encoding.js';
import { bytesToBase64 } from './encoding/binarydata.js';

function jsonPrepareBoxReference(
  reference: BoxReference,
  foreignApps: bigint[],
  appIndex: bigint
): JSONEncodingData {
  const referenceId = BigInt(reference.appIndex);
  const referenceName = reference.name;
  const isOwnReference = referenceId === BigInt(0) || referenceId === appIndex;

  // Foreign apps start from index 1; index 0 is its own app ID.
  const index = foreignApps.indexOf(referenceId) + 1;

  // Check if the app referenced is itself after checking the foreign apps array.
  // If index is zero, then the app ID was not found in the foreign apps array
  // or the foreign apps array was null.
  if (index === 0 && !isOwnReference) {
    // Error if the app is trying to reference a foreign app that was not in
    // its own foreign apps array.
    throw new Error(`Box ref with appId ${referenceId} not in foreign-apps`);
  }

  const encodedReference: Record<string, number | string> = {};
  if (index !== 0) {
    encodedReference.i = index;
  }
  if (referenceName.length) {
    encodedReference.n = bytesToBase64(referenceName);
  }
  return encodedReference;
}

/**
 * translateBoxReferences translates an array of BoxReferences with app IDs
 * into an array of EncodedBoxReferences with foreign indices.
 */
export function jsonPrepareBoxReferences(
  references: ReadonlyArray<BoxReference>,
  foreignApps: ReadonlyArray<number | bigint>,
  appIndex: number | bigint
): JSONEncodingData[] {
  const appIndexBigInt = BigInt(appIndex);
  const foreignAppsBigInt = foreignApps.map(BigInt);
  return references.map((bx) =>
    jsonPrepareBoxReference(bx, foreignAppsBigInt, appIndexBigInt)
  );
}

function msgpackPrepareBoxReference(
  reference: BoxReference,
  foreignApps: bigint[],
  appIndex: bigint
): MsgpackEncodingData {
  const referenceId = BigInt(reference.appIndex);
  const referenceName = reference.name;
  const isOwnReference = referenceId === BigInt(0) || referenceId === appIndex;

  // Foreign apps start from index 1; index 0 is its own app ID.
  const index = foreignApps.indexOf(referenceId) + 1;

  // Check if the app referenced is itself after checking the foreign apps array.
  // If index is zero, then the app ID was not found in the foreign apps array
  // or the foreign apps array was null.
  if (index === 0 && !isOwnReference) {
    // Error if the app is trying to reference a foreign app that was not in
    // its own foreign apps array.
    throw new Error(`Box ref with appId ${referenceId} not in foreign-apps`);
  }

  const prepared = new Map<string, number | Uint8Array>();
  if (index !== 0) {
    prepared.set('i', index);
  }
  if (referenceName.length) {
    prepared.set('n', referenceName);
  }
  return prepared;
}

/**
 * translateBoxReferences translates an array of BoxReferences with app IDs
 * into an array of EncodedBoxReferences with foreign indices.
 */
export function msgpackPrepareBoxReferences(
  references: ReadonlyArray<BoxReference>,
  foreignApps: ReadonlyArray<number | bigint>,
  appIndex: number | bigint
): MsgpackEncodingData[] {
  const appIndexBigInt = BigInt(appIndex);
  const foreignAppsBigInt = foreignApps.map(BigInt);
  return references.map((bx) =>
    msgpackPrepareBoxReference(bx, foreignAppsBigInt, appIndexBigInt)
  );
}
