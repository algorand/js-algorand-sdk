import { Address, addressFromPQKey } from './encoding/address.js';
import { encodeMsgpack } from './encoding/encoding.js';
import { LogicSig, PQ_PROGRAM_TAG } from './logicsig.js';
import { MultisigMetadata } from './multisig.js';
import { SignedTransaction } from './signedTransaction.js';
import {
  AddressWithDelegatedLsigSigner,
  AddressWithEmptyTransactionSigner,
  AddressWithTransactionSigner,
  DelegatedLsigSigner,
  TransactionSigner,
} from './signer.js';
import { Transaction } from './transaction.js';
import { EncodedPQSig } from './types/transactions/encoded.js';
import { concatArrays } from './utils/utils.js';

/**
 * A post-quantum public key, its scheme identifier, and a function that signs
 * raw bytes with the corresponding secret key.
 *
 * @remarks
 * `pqSigner` receives the exact bytes to sign, with every domain-separation
 * prefix already applied, so it can be backed by a key that never leaves a
 * wallet, HSM or hardware device.
 */
export interface PQSigningKey {
  /** The 2-byte ASCII PQ scheme identifier (e.g. "f1" for Falcon-1024). */
  pqScheme: Uint8Array;
  /** The scheme's canonical public key. */
  pqPublicKey: Uint8Array;
  /** Signs the given bytes verbatim with the corresponding secret key. */
  pqSigner: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

/**
 * Build the full set of signers for a post-quantum key from a function that
 * signs raw bytes with it.
 *
 * @remarks
 * The account address is derived from the scheme and public key via
 * {@link addressFromPQKey}, so it does not have to be supplied. Every signature
 * produced carries the scheme, canonical salt and public key alongside the
 * signature bytes, which is what lets the network recover the authorizing
 * address from the signature alone.
 *
 * PQ schemes cannot participate in multisig, so `delegatedLsigSigner` throws if
 * given an `msig` argument, and no `mxBytesSigner` or `programDataSigner` is
 * returned — signing arbitrary bytes and program data are ed25519-only
 * operations.
 *
 * @param signingKey - The scheme, public key and raw signing function to build the signers from
 * @param sendingAddress - The address transactions are sent from. Defaults to
 *   the derived PQ address; supply it when the PQ key is the auth address of a
 *   rekeyed account, in which case the produced transactions carry the derived
 *   address in their `sgnr` field.
 * @returns An address bundled with transaction, empty transaction and delegated
 *   LogicSig signers
 * @throws If `pqScheme` is not exactly 2 bytes
 */
export function addressWithSignersFromRawPQSigner(
  signingKey: PQSigningKey,
  sendingAddress?: Address
): AddressWithTransactionSigner &
  AddressWithDelegatedLsigSigner &
  AddressWithEmptyTransactionSigner {
  const { pqPublicKey, pqSigner: rawSigner, pqScheme } = signingKey;
  const { address: authAddress, salt } = addressFromPQKey(
    pqScheme,
    pqPublicKey
  );

  const txnSigner: TransactionSigner = async (
    txnGroup: Transaction[],
    indexesToSign: number[]
  ) => {
    const stxns: SignedTransaction[] = [];
    for (const index of indexesToSign) {
      const txn = txnGroup[index];
      // eslint-disable-next-line no-await-in-loop
      const sig = await rawSigner(txn.bytesToSign());
      const pqsig: EncodedPQSig = {
        sch: pqScheme,
        slt: salt,
        pk: pqPublicKey,
        sig,
      };
      const stxn = new SignedTransaction({
        txn,
        pqsig,
        sgnr: txn.sender.equals(authAddress) ? undefined : authAddress,
      });

      stxns.push(stxn);
    }

    return stxns.map((stxn) => encodeMsgpack(stxn));
  };

  // A TransactionSigner that attaches a placeholder PQ envelope rather than a
  // real signature. The scheme, salt, and public key are populated but the
  // signature bytes are left empty. When simulated with `allowEmptySignatures`,
  // algod derives the authorizer from this envelope and charges the post-quantum
  // fee surcharge, so the reported fee usage matches a genuinely signed group -
  // all without paying the cost of producing a (large, slow) Falcon signature.
  const emptyTxnSigner: TransactionSigner = (
    txnGroup: Transaction[],
    indexesToSign: number[]
  ) => {
    const stxns: Uint8Array[] = [];
    for (const index of indexesToSign) {
      const txn = txnGroup[index];
      const pqsig: EncodedPQSig = {
        sch: pqScheme,
        slt: salt,
        pk: pqPublicKey,
        sig: new Uint8Array(),
      };
      const stxn = new SignedTransaction({
        txn,
        pqsig,
        sgnr: txn.sender.equals(authAddress) ? undefined : authAddress,
      });
      stxns.push(encodeMsgpack(stxn));
    }
    return Promise.resolve(stxns);
  };

  const delegatedLsigSigner: DelegatedLsigSigner = async (
    lsig: LogicSig,
    msig?: MultisigMetadata
  ) => {
    if (msig) {
      throw Error(
        `post-quantum scheme ${new TextDecoder().decode(pqScheme)} does not support multisig signing`
      );
    }

    const toBeSigned = new Uint8Array(
      concatArrays(PQ_PROGRAM_TAG, authAddress.publicKey, lsig.logic)
    );

    const sig = await rawSigner(toBeSigned);

    const pqsig: EncodedPQSig = {
      sch: pqScheme,
      slt: salt,
      pk: pqPublicKey,
      sig,
    };

    return { address: authAddress, pqsig };
  };

  return {
    address: sendingAddress ?? authAddress,
    txnSigner,
    emptyTxnSigner,
    delegatedLsigSigner,
  };
}
