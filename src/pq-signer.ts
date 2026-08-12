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

export interface PQSigningKey {
  pqScheme: Uint8Array;
  pqPublicKey: Uint8Array;
  pqSigner: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

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
