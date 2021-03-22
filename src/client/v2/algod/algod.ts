import HTTPClient, { TokenHeader } from '../../client';
import modelsv2 from './models/types';
import AccountInformation from './accountInformation';
import Block from './block';
import Compile from './compile';
import Dryrun from './dryrun';
import GetAssetByID from './getAssetByID';
import GetApplicationByID from './getApplicationByID';
import HealthCheck from './healthCheck';
import PendingTransactionInformation from './pendingTransactionInformation';
import PendingTransactions from './pendingTransactions';
import PendingTransactionsByAddress from './pendingTransactionsByAddress';
import SendRawTransaction from './sendRawTransaction';
import Status from './status';
import StatusAfterBlock from './statusAfterBlock';
import SuggestedParams from './suggestedParams';
import Supply from './supply';
import Versions from './versions';
import Genesis from './genesis';
import Proof from './proof';

export default class AlgodClient extends HTTPClient {
  constructor(
    token: string | TokenHeader,
    baseServer = 'http://r2.algorand.network',
    port = 4180,
    headers = {}
  ) {
    super(token, baseServer, port, headers);
  }

  healthCheck() {
    return new HealthCheck(this);
  }

  versionsCheck() {
    return new Versions(this);
  }

  sendRawTransaction(stxOrStxs: Uint8Array | Uint8Array[]) {
    return new SendRawTransaction(this, stxOrStxs);
  }

  /**
   * Returns the given account's information.
   * @param {string} account The address of the account to look up.
   */
  accountInformation(account: string) {
    return new AccountInformation(this, this.intDecoding, account);
  }

  /**
   * Gets the block info for the given round.
   * @param {number} roundNumber The round number of the block to get.
   */
  block(roundNumber: number) {
    return new Block(this, roundNumber);
  }

  /**
   * Returns the transaction information for a specific pending transaction.
   * @param {string} txid The TxID string of the pending transaction to look up.
   */
  pendingTransactionInformation(txid: string) {
    return new PendingTransactionInformation(this, txid);
  }

  /**
   * Returns transactions that are pending in the pool.
   */
  pendingTransactionsInformation() {
    return new PendingTransactions(this);
  }

  /**
   * Returns transactions that are pending in the pool sent by a specific sender.
   * @param {string} address The address of the sender.
   */
  pendingTransactionByAddress(address: string) {
    return new PendingTransactionsByAddress(this, address);
  }

  /**
   * Retrieves the StatusResponse from the running node.
   */
  status() {
    return new Status(this, this.intDecoding);
  }

  /**
   * Waits for a specific round to occur then returns the StatusResponse for that round.
   * @param {number} round The number of the round to wait for.
   */
  statusAfterBlock(round: number) {
    return new StatusAfterBlock(this, this.intDecoding, round);
  }

  /**
   * Returns the common needed parameters for a new transaction.
   */
  getTransactionParams() {
    return new SuggestedParams(this);
  }

  /**
   * Gets the supply details for the specified node's ledger.
   */
  supply() {
    return new Supply(this, this.intDecoding);
  }

  compile(source: string) {
    return new Compile(this, source);
  }

  dryrun(dr: modelsv2.DryrunSource) {
    return new Dryrun(this, dr);
  }

  /**
   * Given an asset ID, return asset information including creator, name, total supply and
   * special addresses.
   * @param {number} index The asset ID to look up.
   */
  getAssetByID(index: number) {
    return new GetAssetByID(this, this.intDecoding, index);
  }

  /**
   * Given an application ID, it returns application information including creator, approval
   * and clear programs, global and local schemas, and global state.
   * @param {number} index The application ID to look up.
   */
  getApplicationByID(index: number) {
    return new GetApplicationByID(this, this.intDecoding, index);
  }

  /**
   * Returns the entire genesis file.
   */
  genesis() {
    return new Genesis(this, this.intDecoding);
  }

  /**
   * Get the proof for a given transaction in a round.
   * @param {number} round The round in which the transaction appears.
   * @param {string} txID The transaction ID for which to generate a proof.
   */
  getProof(round: number, txID: string) {
    return new Proof(this, this.intDecoding, round, txID);
  }
}
