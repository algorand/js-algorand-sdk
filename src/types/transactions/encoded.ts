import {
  JSONEncodingData,
  MsgpackEncodingData,
} from '../../encoding/encoding.js';
import { base64ToBytes, bytesToBase64 } from '../../encoding/binarydata.js';

/**
 * Interfaces for the encoded transaction object. Every property is labelled with its associated Transaction type property
 */

export interface EncodedAssetParams {
  /**
   * assetTotal
   */
  t?: number | bigint;

  /**
   * assetDefaultFrozen
   */
  df?: boolean;

  /**
   * assetDecimals
   */
  dc?: number | bigint;

  /**
   * assetManager
   */
  m?: Uint8Array;

  /**
   * assetReserve
   */
  r?: Uint8Array;

  /**
   * assetFreeze
   */
  f?: Uint8Array;

  /**
   * assetClawback
   */
  c?: Uint8Array;

  /**
   * assetName
   */
  an?: string;

  /**
   * assetUnitName
   */
  un?: string;

  /**
   * assetURL
   */
  au?: string;

  /**
   * assetMetadataHash
   */
  am?: Uint8Array;
}

export interface EncodedLocalStateSchema {
  /**
   * appLocalInts
   */
  nui?: number | bigint;

  /**
   * appLocalByteSlices
   */
  nbs?: number | bigint;
}

export interface EncodedGlobalStateSchema {
  /**
   * appGlobalInts
   */
  nui?: number | bigint;

  /**
   * appGlobalByteSlices
   */
  nbs?: number | bigint;
}

export interface EncodedBoxReference {
  /**
   * index of the app ID in the foreign apps array
   */
  i?: number | bigint;

  /**
   * box name
   */
  n?: Uint8Array;
}

/**
 * A rough structure for the encoded transaction object. Every property is labelled with its associated Transaction type property
 */
export interface EncodedTransaction {
  /**
   * fee
   */
  fee?: number | bigint;

  /**
   * firstValid
   */
  fv?: number | bigint;

  /**
   * lastValid
   */
  lv: number | bigint;

  /**
   * note
   */
  note?: Uint8Array;

  /**
   * sender
   */
  snd?: Uint8Array;

  /**
   * type
   */
  type: string;

  /**
   * genesisID
   */
  gen?: string;

  /**
   * genesisHash
   */
  gh?: Uint8Array;

  /**
   * lease
   */
  lx?: Uint8Array;

  /**
   * group
   */
  grp?: Uint8Array;

  /**
   * amount
   */
  amt?: number | bigint;

  /**
   * amount (but for asset transfers)
   */
  aamt?: number | bigint;

  /**
   * closeRemainderTo
   */
  close?: Uint8Array;

  /**
   * closeRemainderTo (but for asset transfers)
   */
  aclose?: Uint8Array;

  /**
   * rekeyTo
   */
  rekey?: Uint8Array;

  /**
   * receiver
   */
  rcv?: Uint8Array;

  /**
   * receiver (but for asset transfers)
   */
  arcv?: Uint8Array;

  /**
   * voteKey
   */
  votekey?: Uint8Array;

  /**
   * selectionKey
   */
  selkey?: Uint8Array;

  /**
   * stateProofKey
   */
  sprfkey?: Uint8Array;

  /**
   * voteFirst
   */
  votefst?: number | bigint;

  /**
   * voteLast
   */
  votelst?: number | bigint;

  /**
   * voteKeyDilution
   */
  votekd?: number | bigint;

  /**
   * nonParticipation
   */
  nonpart?: boolean;

  /**
   * assetIndex
   */
  caid?: number | bigint;

  /**
   * assetIndex (but for asset transfers)
   */
  xaid?: number | bigint;

  /**
   * assetIndex (but for asset freezing/unfreezing)
   */
  faid?: number | bigint;

  /**
   * frozen
   */
  afrz?: boolean;

  /**
   * freezeAccount
   */
  fadd?: Uint8Array;

  /**
   * assetSender
   */
  asnd?: Uint8Array;

  /**
   * See EncodedAssetParams type
   */
  apar?: EncodedAssetParams;

  /**
   * appIndex
   */
  apid?: number | bigint;

  /**
   * appOnComplete
   */
  apan?: number | bigint;

  /**
   * See EncodedLocalStateSchema type
   */
  apls?: EncodedLocalStateSchema;

  /**
   * See EncodedGlobalStateSchema type
   */
  apgs?: EncodedGlobalStateSchema;

  /**
   * appForeignApps
   */
  apfa?: Array<number | bigint>;

  /**
   * appForeignAssets
   */
  apas?: Array<number | bigint>;

  /**
   * appApprovalProgram
   */
  apap?: Uint8Array;

  /**
   * appClearProgram
   */
  apsu?: Uint8Array;

  /**
   * appArgs
   */
  apaa?: Uint8Array[];

  /**
   * appAccounts
   */
  apat?: Uint8Array[];

  /**
   * extraPages
   */
  apep?: number | bigint;

  /**
   * boxes
   */
  apbx?: EncodedBoxReference[];

  /*
   * stateProofType
   */
  sptype?: number | bigint;

  /**
   * stateProof
   */
  sp?: Uint8Array;

  /**
   * stateProofMessage
   */
  spmsg?: Uint8Array;
}

export interface EncodedSubsig {
  /**
   *  The public key
   */
  pk: Uint8Array;

  /**
   * The signature provided by the public key, if any
   */
  s?: Uint8Array;
}

export function encodedSubsigFromDecodedMsgpack(data: unknown): EncodedSubsig {
  if (!(data instanceof Map)) {
    throw new Error(`Invalid decoded EncodedSubsig: ${data}`);
  }
  const subsig: EncodedSubsig = {
    pk: data.get('pk'),
  };
  if (data.get('s')) {
    subsig.s = data.get('s');
  }
  return subsig;
}

export function encodedSubsigMsgpackPrepare(
  subsig: EncodedSubsig
): MsgpackEncodingData {
  const data = new Map<string, MsgpackEncodingData>([['pk', subsig.pk]]);
  if (subsig.s) {
    data.set('s', subsig.s);
  }
  return data;
}

export function encodedSubsigFromDecodedJSON(data: unknown): EncodedSubsig {
  if (data === null || typeof data !== 'object') {
    throw new Error(`Invalid decoded EncodedSubsig: ${data}`);
  }
  const obj = data as Record<string, any>;
  const subsig: EncodedSubsig = {
    pk: base64ToBytes(obj.pk),
  };
  if (obj.s) {
    subsig.s = base64ToBytes(obj.s);
  }
  return subsig;
}

export function encodedSubsigJSONPrepare(
  subsig: EncodedSubsig
): JSONEncodingData {
  const prepared: Record<string, string> = {
    pk: bytesToBase64(subsig.pk),
  };
  if (subsig.s) {
    prepared.s = bytesToBase64(subsig.s);
  }
  return prepared;
}

/**
 * A rough structure for the encoded multi signature transaction object.
 * Every property is labelled with its associated `MultisigMetadata` type property
 */
export interface EncodedMultisig {
  /**
   * version
   */
  v: number;

  /**
   * threshold
   */
  thr: number;

  /**
   * Subset of signatures. A threshold of `thr` signors is required.
   */
  subsig: EncodedSubsig[];
}

export function encodedMultiSigFromDecodedMsgpack(
  data: unknown
): EncodedMultisig {
  if (!(data instanceof Map)) {
    throw new Error(`Invalid decoded EncodedMultiSig: ${data}`);
  }
  return {
    v: data.get('v'),
    thr: data.get('thr'),
    subsig: data.get('subsig').map(encodedSubsigFromDecodedMsgpack),
  };
}

export function encodedMultiSigMsgpackPrepare(
  msig: EncodedMultisig
): MsgpackEncodingData {
  return new Map<string, MsgpackEncodingData>([
    ['v', msig.v],
    ['thr', msig.thr],
    ['subsig', msig.subsig.map(encodedSubsigMsgpackPrepare)],
  ]);
}

export function encodedMultiSigFromDecodedJSON(data: unknown): EncodedMultisig {
  if (data === null || typeof data !== 'object') {
    throw new Error(`Invalid decoded EncodedSubsig: ${data}`);
  }
  const obj = data as Record<string, any>;
  return {
    v: obj.v,
    thr: obj.thr,
    subsig: obj.subsig.map(encodedSubsigFromDecodedJSON),
  };
}

export function encodedMultiSigJSONPrepare(
  msig: EncodedMultisig
): JSONEncodingData {
  return {
    v: msig.v,
    thr: msig.thr,
    subsig: msig.subsig.map(encodedSubsigJSONPrepare),
  };
}

export interface EncodedLogicSig {
  l: Uint8Array;
  arg?: Uint8Array[];
  sig?: Uint8Array;
  msig?: EncodedMultisig;
}

export interface EncodedLogicSigAccount {
  lsig: EncodedLogicSig;
  sigkey?: Uint8Array;
}

/**
 * A structure for an encoded signed transaction object
 */
export interface EncodedSignedTransaction {
  /**
   * Transaction signature
   */
  sig?: Uint8Array;

  /**
   * The transaction that was signed
   */
  txn: EncodedTransaction;

  /**
   * Multisig structure
   */
  msig?: EncodedMultisig;

  /**
   * Logic signature
   */
  lsig?: EncodedLogicSig;

  /**
   * The signer, if signing with a different key than the Transaction type `sender` property indicates
   */
  sgnr?: Uint8Array;
}
