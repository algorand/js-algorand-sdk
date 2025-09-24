import { Address } from './encoding/address.js';
import {
  BoxReference,
  HoldingReference,
  LocalsReference,
  ResourceReference,
} from './types/transactions/base.js';
import { ensureSafeUnsignedInteger } from './utils/utils.js';

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
      const aAddress = a.get('d') as Address | undefined;
      const addressesEqual =
        (!target.address && !aAddress) ||
        (target.address &&
          aAddress &&
          (target.address as Address).equals(aAddress));
      if (
        addressesEqual &&
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
      continue;
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
      continue;
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
      continue;
    }
    if (rr.box) {
      const b = rr.box;
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

export function convertIndicesToResourceReferences(
  accessList: Array<Map<string, unknown>>
): Array<ResourceReference> {
  const references: Array<ResourceReference> = [];
  for (const item of accessList) {
    const address = item.get('d') as Address | undefined;
    const assetIndex = item.get('s') as bigint | undefined;
    const appIndex = item.get('p') as bigint | undefined;
    if (address) {
      references.push({ address });
      continue;
    }
    if (assetIndex) {
      references.push({ assetIndex });
      continue;
    }
    if (appIndex) {
      references.push({ appIndex });
      continue;
    }
    const holding = item.get('h') as Map<string, unknown> | undefined;
    if (holding) {
      const hAddressIndex = ensureSafeUnsignedInteger(holding.get('d') ?? 0);
      const hAssetIndex = ensureSafeUnsignedInteger(holding.get('s'));
      if (!hAssetIndex) {
        throw new Error(`Holding missing asset index: ${holding}`);
      }
      const hAddress =
        hAddressIndex === 0
          ? Address.zeroAddress()
          : (references[hAddressIndex - 1].address as Address);
      const asset = references[hAssetIndex - 1].assetIndex as bigint;
      references.push({ holding: { address: hAddress, assetIndex: asset } });
      continue;
    }
    const locals = item.get('l') as Map<string, unknown> | undefined;
    if (locals) {
      const lAddressIndex = ensureSafeUnsignedInteger(locals.get('d') ?? 0);
      const lAppIndex = ensureSafeUnsignedInteger(locals.get('p') ?? 0);
      const lAddress =
        lAddressIndex === 0
          ? Address.zeroAddress()
          : (references[lAddressIndex - 1].address as Address);
      const app =
        lAppIndex === 0
          ? BigInt(0)
          : (references[lAppIndex - 1].appIndex as bigint);
      references.push({ locals: { address: lAddress, appIndex: app } });
      continue;
    }
    const box = item.get('b') as Map<string, unknown> | undefined;
    if (box) {
      const bAppIndex = ensureSafeUnsignedInteger(box.get('i') ?? 0);
      const name = box.get('n') as Uint8Array;
      if (!name) {
        throw new Error(`Box missing name: ${box}`);
      }
      const app =
        bAppIndex === 0
          ? BigInt(0)
          : (references[bAppIndex - 1].appIndex as number | bigint);
      references.push({ box: { appIndex: app, name } });
    }
  }
  return references;
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
  appIndex,
  accounts,
  foreignAssets,
  foreignApps,
  holdings,
  locals,
  boxes,
}: {
  appIndex: bigint | number;
  accounts?: ReadonlyArray<string | Address>;
  foreignAssets?: ReadonlyArray<number | bigint>;
  foreignApps?: ReadonlyArray<number | bigint>;
  holdings?: ReadonlyArray<HoldingReference>;
  locals?: ReadonlyArray<LocalsReference>;
  boxes?: ReadonlyArray<BoxReference>;
}): Array<ResourceReference> {
  const accessList: Array<ResourceReference> = [];
  function ensureAddress(addr: string | Address) {
    let addr2: Address;
    if (typeof addr === 'string') {
      if (addr === '') {
        return;
      }
      addr2 = Address.fromString(addr);
    } else {
      addr2 = addr;
    }
    if (addr2.equals(Address.zeroAddress())) {
      return;
    }
    let addrFound = false;
    for (const rr of accessList) {
      if (!rr.address) {
        continue;
      }
      let rrAddress = rr.address;
      if (typeof rr.address === 'string') {
        rrAddress = Address.fromString(rr.address);
      }
      if ((rrAddress as Address).equals(addr2)) {
        addrFound = true;
        break;
      }
    }
    if (!addrFound) {
      accessList.push({ address: addr });
    }
  }
  function ensureAsset(asset: number | bigint) {
    let assetFound = false;
    for (const rr of accessList) {
      if (rr.assetIndex === asset) {
        assetFound = true;
        break;
      }
    }
    if (!assetFound) {
      accessList.push({ assetIndex: asset });
    }
  }
  function ensureApp(app: number | bigint) {
    let appFound = false;
    for (const rr of accessList) {
      if (rr.appIndex === app) {
        appFound = true;
        break;
      }
    }
    if (!appFound) {
      accessList.push({ appIndex: app });
    }
  }
  for (const acct of accounts ?? []) {
    ensureAddress(acct);
  }
  for (const asset of foreignAssets ?? []) {
    ensureAsset(asset);
  }
  for (const app of foreignApps ?? []) {
    ensureApp(app);
  }
  for (const holding of holdings ?? []) {
    if (holding.address) {
      ensureAddress(holding.address);
    }
    ensureAsset(holding.assetIndex);
    accessList.push({ holding });
  }
  for (const local of locals ?? []) {
    if (local.address) {
      ensureAddress(local.address);
    }
    if (local.appIndex && BigInt(local.appIndex) !== appIndex) {
      ensureApp(local.appIndex);
    }
    accessList.push({ locals: local });
  }
  for (const box of boxes ?? []) {
    if (box.appIndex && BigInt(box.appIndex) !== appIndex) {
      ensureApp(box.appIndex);
    }
    accessList.push({ box });
  }
  return accessList;
}
