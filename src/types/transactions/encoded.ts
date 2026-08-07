import {
  NamedMapSchema,
  FixedLengthByteArraySchema,
  ByteArraySchema,
  Uint64Schema,
  ArraySchema,
  OptionalSchema,
  allOmitEmpty,
} from '../../encoding/schema/index.js';
import { ensureSafeUnsignedInteger } from '../../utils/utils.js';
import { PQ_SALT_MAX, PQ_SCHEME_SIZE } from '../../encoding/address.js';

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

/**
 * A structure for the encoded post-quantum signature transaction authorization
 * proof. Mirrors the `PQSig` struct from go-algorand.
 */
export interface EncodedPQSig {
  /**
   * The 2-byte identifier of the post-quantum signature scheme (e.g. "f1"
   * for Falcon-1024).
   */
  sch: Uint8Array;

  /**
   * The 1-byte salt used when deriving the post-quantum account address from the
   * public key.
   */
  slt: number;

  /**
   * The post-quantum public key.
   */
  pk: Uint8Array;

  /**
   * The post-quantum signature over the transaction.
   */
  sig: Uint8Array;
}

export const ENCODED_PQSIG_SCHEMA = new NamedMapSchema(
  allOmitEmpty([
    {
      key: 'sch',
      valueSchema: new ByteArraySchema(),
    },
    {
      key: 'slt',
      valueSchema: new Uint64Schema(),
    },
    {
      key: 'pk',
      valueSchema: new ByteArraySchema(),
    },
    {
      key: 'sig',
      valueSchema: new ByteArraySchema(),
    },
  ])
);

export function encodedPQSigFromEncodingData(data: unknown): EncodedPQSig {
  if (!(data instanceof Map)) {
    throw new Error(`Invalid decoded EncodedPQSig: ${data}`);
  }
  const sch = data.get('sch') as Uint8Array;
  if (sch.length !== PQ_SCHEME_SIZE) {
    throw new Error(
      `Invalid decoded EncodedPQSig: expected a ${PQ_SCHEME_SIZE}-byte scheme, got ${sch.length} bytes`
    );
  }
  // The salt occupies a single byte of the address preimage, so anything wider
  // could never have produced a valid address.
  const slt = ensureSafeUnsignedInteger(data.get('slt'));
  if (slt > PQ_SALT_MAX) {
    throw new Error(
      `Invalid decoded EncodedPQSig: salt ${slt} exceeds the maximum of ${PQ_SALT_MAX}`
    );
  }
  return {
    sch,
    slt,
    pk: data.get('pk'),
    sig: data.get('sig'),
  };
}

export function encodedPQSigToEncodingData(
  pqsig: EncodedPQSig
): Map<string, unknown> {
  return new Map<string, unknown>([
    ['sch', pqsig.sch],
    ['slt', pqsig.slt],
    ['pk', pqsig.pk],
    ['sig', pqsig.sig],
  ]);
}
