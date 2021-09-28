import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class LookupApplicationLogs extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private appID: number) {
    super(c, intDecoding);
    this.appID = appID;
  }

  path() {
    return `/v2/applications/${this.appID}/logs`;
  }

  /** limit for filter, as int */
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  /** min round to filter with, as int */
  minRound(round: number) {
    this.query['min-round'] = round;
    return this;
  }

  /** max round to filter with, as int */
  maxRound(round: number) {
    this.query['max-round'] = round;
    return this;
  }

  /** used for pagination */
  nextToken(nextToken: string) {
    this.query.next = nextToken;
    return this;
  }

  /** only include transactions with this sender address */
  sender(senderAddress: string) {
    this.query['sender-address'] = senderAddress;
    return this;
  }

  /** txid to filter with, as string */
  txid(txid: string) {
    this.query.txid = txid;
    return this;
  }
}
