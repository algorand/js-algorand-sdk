import {
  NamedMapSchema,
  FixedLengthByteArraySchema,
  Uint64Schema,
  ArraySchema,
  OptionalSchema,
  allOmitEmpty,
} from '../../encoding/schema/index.js';
import { ensureSafeUnsignedInteger } from '../../utils/utils.js';

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

export const ENCODED_SUBSIG_SCHEMA = new NamedMapSchema(
  allOmitEmpty([
    {
      key: 'pk',
      valueSchema: new FixedLengthByteArraySchema(32),
    },
    {
      key: 's',
      valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(64)),
    },
  ])
);

export function encodedSubsigFromEncodingData(data: unknown): EncodedSubsig {
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

export function encodedSubsigToEncodingData(
  subsig: EncodedSubsig
): Map<string, unknown> {
  const data = new Map<string, unknown>([['pk', subsig.pk]]);
  if (subsig.s) {
    data.set('s', subsig.s);
  }
  return data;
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

export const ENCODED_MULTISIG_SCHEMA = new NamedMapSchema(
  allOmitEmpty([
    {
      key: 'v',
      valueSchema: new Uint64Schema(),
    },
    {
      key: 'thr',
      valueSchema: new Uint64Schema(),
    },
    {
      key: 'subsig',
      valueSchema: new ArraySchema(ENCODED_SUBSIG_SCHEMA),
    },
  ])
);

export function encodedMultiSigFromEncodingData(
  data: unknown
): EncodedMultisig {
  if (!(data instanceof Map)) {
    throw new Error(`Invalid decoded EncodedMultiSig: ${data}`);
  }
  return {
    v: ensureSafeUnsignedInteger(data.get('v')),
    thr: ensureSafeUnsignedInteger(data.get('thr')),
    subsig: data.get('subsig').map(encodedSubsigFromEncodingData),
  };
}

export function encodedMultiSigToEncodingData(
  msig: EncodedMultisig
): Map<string, unknown> {
  return new Map<string, unknown>([
    ['v', msig.v],
    ['thr', msig.thr],
    ['subsig', msig.subsig.map(encodedSubsigToEncodingData)],
  ]);
}
