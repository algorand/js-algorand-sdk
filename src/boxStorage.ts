import { BoxReference } from './types/transactions/base.js';

function boxReferenceToEncodingData(
  reference: BoxReference,
  foreignApps: bigint[],
  appIndex: bigint
): Map<string, unknown> {
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

  return new Map<string, number | Uint8Array>([
    ['i', index],
    ['n', referenceName],
  ]);
}

/**
 * boxReferencesToEncodingData translates an array of BoxReferences into an array of encoding data
 * maps.
 */
export function boxReferencesToEncodingData(
  references: ReadonlyArray<BoxReference>,
  foreignApps: ReadonlyArray<number | bigint>,
  appIndex: number | bigint
): Array<Map<string, unknown>> {
  const appIndexBigInt = BigInt(appIndex);
  const foreignAppsBigInt = foreignApps.map(BigInt);
  return references.map((bx) =>
    boxReferenceToEncodingData(bx, foreignAppsBigInt, appIndexBigInt)
  );
}
