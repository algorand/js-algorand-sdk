import { Buffer } from 'buffer';
import * as address from './encoding/address';
import * as encoding from './encoding/encoding';
import * as nacl from './nacl/naclWrappers';
import * as utils from './utils/utils';
import { Address } from './types/address';

interface BidStorageStructure {
  bidderKey: Address;
  bidAmount: number;
  bidID: number;
  auctionKey: Address;
  auctionID: number;
  maxPrice: number;
}

export type BidOptions = Omit<
  BidStorageStructure,
  'bidderKey' | 'auctionKey'
> & {
  bidderKey: string;
  auctionKey: string;
};

/**
 * Bid enables construction of Algorand Auctions Bids
 * */
export default class Bid implements BidStorageStructure {
  name = 'Bid';
  tag = Buffer.from([97, 66]); // "aB"

  bidderKey: Address;
  bidAmount: number;
  bidID: number;
  auctionKey: Address;
  auctionID: number;
  maxPrice: number;

  constructor({
    bidderKey,
    bidAmount,
    bidID,
    auctionKey,
    auctionID,
    maxPrice,
  }: BidOptions) {
    const decodedBidderKey = address.decodeAddress(bidderKey);
    const decodedAuctionKey = address.decodeAddress(auctionKey);

    if (!Number.isSafeInteger(bidAmount) || bidAmount < 0)
      throw Error('Bid amount must be positive and 2^53-1');
    if (!Number.isSafeInteger(bidID) || bidID < 0)
      throw Error('BidID must be positive and 2^53-1');
    if (!Number.isSafeInteger(auctionID) || auctionID < 0)
      throw Error('auctionID must be positive');

    Object.assign(this, {
      bidderKey: decodedBidderKey,
      bidAmount,
      bidID,
      auctionKey: decodedAuctionKey,
      auctionID,
      maxPrice,
    });
  }

  // eslint-disable-next-line camelcase
  get_obj_for_encoding() {
    return {
      bidder: Buffer.from(this.bidderKey.publicKey),
      cur: this.bidAmount,
      price: this.maxPrice,
      id: this.bidID,
      auc: Buffer.from(this.auctionKey.publicKey),
      aid: this.auctionID,
    };
  }

  signBid(sk: Uint8Array) {
    const encodedMsg = encoding.encode(this.get_obj_for_encoding());
    const toBeSigned = Buffer.from(utils.concatArrays(this.tag, encodedMsg));
    const sig = nacl.sign(toBeSigned, sk);

    // construct signed message
    const sBid = {
      sig: Buffer.from(sig),
      bid: this.get_obj_for_encoding(),
    };

    const note = {
      t: 'b',
      b: sBid,
    };
    return new Uint8Array(encoding.encode(note));
  }
}
