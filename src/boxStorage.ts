import { EncodedBoxReference } from './types';
import { BoxReference } from './types/transactions/base';

function translateBoxReference(
  reference: BoxReference,
  foreignApps: number[],
  appIndex: number
): EncodedBoxReference {
  const referenceId = reference.appIndex;
  const referenceName = reference.name;
  let index = 0;
  // Foreign apps start from index 1; index 0 is its own app ID.
  try {
    index = foreignApps.indexOf(referenceId) + 1;
  } catch (err) {
    // Foreign app array cannot be empty unless the reference ID is itself.
    if (referenceId !== 0 && referenceId !== appIndex) {
      throw new Error(`Box ref with appId ${referenceId} not in foreign-apps`);
    }
  }
  // Check if the app referenced is itself after checking the foreign apps array.
  if (index === 0 && referenceId !== 0 && referenceId !== appIndex) {
    throw new Error(`Box ref with appId ${referenceId} not in foreign-apps`);
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
  if (references == null || !Array.isArray(references)) return [];
  return references.map((bx) =>
    translateBoxReference(bx, foreignApps, appIndex)
  );
}
