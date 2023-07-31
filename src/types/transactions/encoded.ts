/**
 * Interfaces for the encoded transaction object. Every property is labelled with its associated Transaction type property
 */

export interface EncodedAssetParams {
  /**
   * assetTotal
   */
  t: number | bigint;

  /**
   * assetDefaultFrozen
   */
  df: boolean;

  /**
   * assetDecimals
   */
  dc: number;

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
  nui: number;

  /**
   * appLocalByteSlices
   */
  nbs: number;
}

export interface EncodedGlobalStateSchema {
  /**
   * appGlobalInts
   */
  nui: number;

  /**
   * appGlobalByteSlices
   */
  nbs: number;
}

export interface EncodedBoxReference {
  /**
   * index of the app ID in the foreign apps array
   */
  i: number;

  /**
   * box name
   */
  n: Uint8Array;
}

/**
 * A rough structure for the encoded transaction object. Every property is labelled with its associated Transaction type property
 */
export interface EncodedTransaction {
  /**
   * fee
   */
  fee?: number;

  /**
   * firstValid
   */
  fv?: number;

  /**
   * lastValid
   */
  lv: number;

  /**
   * note
   */
  note?: Uint8Array;

  /**
   * from
   */
  snd: Uint8Array;

  /**
   * type
   */
  type: string;

  /**
   * genesisID
   */
  gen: string;

  /**
   * genesisHash
   */
  gh: Uint8Array;

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
   * reKeyTo
   */
  rekey?: Uint8Array;

  /**
   * to
   */
  rcv?: Uint8Array;

  /**
   * to (but for asset transfers)
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
  votefst?: number;

  /**
   * voteLast
   */
  votelst?: number;

  /**
   * voteKeyDilution
   */
  votekd?: number;

  /**
   * nonParticipation
   */
  nonpart?: boolean;

  /**
   * assetIndex
   */
  caid?: number;

  /**
   * assetIndex (but for asset transfers)
   */
  xaid?: number;

  /**
   * assetIndex (but for asset freezing/unfreezing)
   */
  faid?: number;

  /**
   * assetFrozen
   */
  afrz?: boolean;

  /**
   * freezeAccount
   */
  fadd?: Uint8Array;

  /**
   * assetRevocationTarget
   */
  asnd?: Uint8Array;

  /**
   * See EncodedAssetParams type
   */
  apar?: EncodedAssetParams;

  /**
   * appIndex
   */
  apid?: number;

  /**
   * appOnComplete
   */
  apan?: number;

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
  apfa?: number[];

  /**
   * appForeignAssets
   */
  apas?: number[];

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
  apep?: number;

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
   * The signer, if signing with a different key than the Transaction type `from` property indicates
   */
  sgnr?: Uint8Array;
}
