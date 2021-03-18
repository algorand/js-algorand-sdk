import JSONRequest from '../jsonrequest';
import { HTTPClient } from '../../client';
import { IntDecoding } from '../../../types/intDecoding';

export default class LookupAccountTransactions extends JSONRequest {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private account: string
  ) {
    super(c, intDecoding);
    this.account = account;
  }

  path() {
    return `/v2/accounts/${this.account}/transactions`;
  }

  // notePrefix to filter with, as uint8array
  notePrefix(prefix: string) {
    this.query['note-prefix'] = prefix;
    return this;
  }

  // txtype to filter with, as string
  txType(type: string) {
    this.query['tx-type'] = type;
    return this;
  }

  // sigtype to filter with, as string
  sigType(type: string) {
    this.query['sig-type'] = type;
    return this;
  }

  // txid to filter with, as string
  txid(txid: string) {
    this.query.txid = txid;
    return this;
  }

  // round to filter with, as int
  round(round: number) {
    this.query.round = round;
    return this;
  }

  // min round to filter with, as int
  minRound(round: number) {
    this.query['min-round'] = round;
    return this;
  }

  // max round to filter with, as int
  maxRound(round: number) {
    this.query['max-round'] = round;
    return this;
  }

  // asset ID to filter with, as int
  assetID(id: number) {
    this.query['asset-id'] = id;
    return this;
  }

  // limit for filter, as int
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  // before-time to filter with, as rfc3339 string
  beforeTime(before: string) {
    this.query['before-time'] = before;
    return this;
  }

  // after-time to filter with, as rfc3339 string
  afterTime(after: string) {
    this.query['after-time'] = after;
    return this;
  }

  // filtered results should have an amount greater than this value, as int, representing microAlgos, unless an asset-id is provided, in which case units are in the asset's units
  currencyGreaterThan(greater: number) {
    this.query['currency-greater-than'] = greater;
    return this;
  }

  // filtered results should have an amount less than this value, as int, representing microAlgos, unless an asset-id is provided, in which case units are in the asset's units
  currencyLessThan(lesser: number) {
    this.query['currency-less-than'] = lesser;
    return this;
  }

  // used for pagination
  nextToken(nextToken: string) {
    this.query.next = nextToken;
    return this;
  }

  // whether or not to include rekeying transactions
  rekeyTo(rekeyTo: boolean) {
    this.query['rekey-to'] = rekeyTo;
    return this;
  }
}
