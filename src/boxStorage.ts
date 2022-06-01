import { BoxReference } from './types/transactions/base';

function translateBoxReference(
  reference: BoxReference,
  foreignApps: number[],
  appIndex: number
) {
  const referenceId = reference.appIndex;
  const referenceName = reference.name;
  // Foreign apps start from index 1; index 0 is its own app ID.
  let index = foreignApps.indexOf(referenceId) + 1;
  if (index === 0) {
    // Check if the app referenced is itself after checking the foreign apps array
    if (referenceId === 0 || referenceId === appIndex) {
      index = 0;
    } else {
      throw new Error(`Box ref with appId ${referenceId} not in foreign-apps`);
    }
  }
  return { i: index, n: referenceName };
}

/**
 * translateBoxReferences translates an array of BoxReferences with app IDs
 * into an array of EncodedBoxReferences with foreign indices.
 */
export function translateBoxReferences(
  references: BoxReference[],
  foreignApps: number[],
  appIndex: number
) {
  if (!references) return [];
  return references.map((bx) =>
    translateBoxReference(bx, foreignApps, appIndex)
  );
}
