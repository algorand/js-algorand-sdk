import { Address } from './encoding/address.js';
import {
  BoxReference,
  HoldingReference,
  LocalsReference,
  ResourceReference,
} from './types/transactions/base.js';

/**
 * resourceReferencesToEncodingData translates an array of ResourceReferences into an array of encoding data
 * maps.
 */
export function resourceReferencesToEncodingData(
  appIndex: bigint,
  references: ReadonlyArray<ResourceReference>
): Array<Map<string, unknown>> {
  const accessList: Array<Map<string, unknown>> = [];

  function ensure(target: ResourceReference): number {
    for (let idx = 0; idx < accessList.length; idx++) {
      const a = accessList[idx];
      if (
        a.get('d') === target.address &&
        a.get('s') === target.assetIndex &&
        a.get('p') === target.appIndex
      ) {
        return idx + 1; // 1-based index
      }
    }
    if (target.address) {
      accessList.push(new Map<string, unknown>([['d', target.address]]));
    }
    if (target.assetIndex) {
      accessList.push(new Map<string, unknown>([['s', target.assetIndex]]));
    }
    if (target.appIndex) {
      accessList.push(new Map<string, unknown>([['p', target.appIndex]]));
    }
    return accessList.length; // length is 1-based position of new element
  }

  const zeroAddr = Address.zeroAddress();

  for (const rr of references) {
    if (rr.address || rr.assetIndex || rr.appIndex) {
      ensure(rr);
    }

    if (rr.holding) {
      const h = rr.holding;
      let addrIdx = 0;
      if (h.address && !(h.address as Address).equals(zeroAddr)) {
        addrIdx = ensure({ address: h.address });
      }
      const assetIdx = ensure({ assetIndex: h.assetIndex });
      accessList.push(
        new Map<string, unknown>([
          [
            'h',
            new Map<string, unknown>([
              ['d', addrIdx],
              ['s', assetIdx],
            ]),
          ],
        ])
      );
    }
    if (rr.locals) {
      const l = rr.locals;
      let addrIdx = 0;
      if (l.address && !(l.address as Address).equals(zeroAddr)) {
        addrIdx = ensure({ address: l.address });
      }
      let appIdx = 0;
      if (l.appIndex && BigInt(l.appIndex) !== appIndex) {
        appIdx = ensure({ appIndex: l.appIndex });
      }
      accessList.push(
        new Map<string, unknown>([
          [
            'l',
            new Map<string, unknown>([
              ['d', addrIdx],
              ['p', appIdx],
            ]),
          ],
        ])
      );
    }
    if (rr.boxes) {
      const b = rr.boxes;
      let appIdx = 0;
      if (b.appIndex && BigInt(b.appIndex) !== appIndex) {
        appIdx = ensure({ appIndex: b.appIndex });
      }
      accessList.push(
        new Map<string, unknown>([
          [
            'b',
            new Map<string, unknown>([
              ['i', appIdx],
              ['n', b.name],
            ]),
          ],
        ])
      );
    }
  }
  return accessList;
}

/**
 * foreignArraysToResourceReferences makes a single array of ResourceReferences from various foreign resource arrays.
 * Note, runtime representation of ResourceReference uses addresses, app and asset identifiers, not indexes.
 *
 * @param accounts - optional array of accounts
 * @param foreignAssets - optional array of foreign assets
 * @param foreignApps - optional array of foreign apps
 * @param holdings - optional array of holdings
 * @param locals - optional array of locals
 * @param boxes - optional array of boxes
 */
export function foreignArraysToResourceReferences({
  accounts,
  foreignAssets,
  foreignApps,
  holdings,
  locals,
  boxes,
}: {
  accounts?: ReadonlyArray<string | Address>;
  foreignAssets?: ReadonlyArray<number | bigint>;
  foreignApps?: ReadonlyArray<number | bigint>;
  holdings?: ReadonlyArray<HoldingReference>;
  locals?: ReadonlyArray<LocalsReference>;
  boxes?: ReadonlyArray<BoxReference>;
}): Array<ResourceReference> {
  const accessList: Array<ResourceReference> = [];
  for (const acct of accounts ?? []) {
    accessList.push({ address: acct });
  }
  for (const asset of foreignAssets ?? []) {
    accessList.push({ assetIndex: asset });
  }
  for (const app of foreignApps ?? []) {
    accessList.push({ appIndex: app });
  }
  for (const holding of holdings ?? []) {
    accessList.push({ holding });
  }
  for (const local of locals ?? []) {
    accessList.push({ locals: local });
  }
  for (const box of boxes ?? []) {
    accessList.push({ boxes: box });
  }
  return accessList;
}
