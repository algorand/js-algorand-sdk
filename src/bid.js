const address = require("./encoding/address");
const encoding = require("./encoding/encoding");
const nacl = require("./nacl/naclWrappers");
const utils = require("./utils/utils");

/**
 * Bid enables construction of Algorand Auctions Bids
 * */
class Bid {
    constructor({bidderKey, bidAmount, maxPrice, bidID, auctionKey, auctionID}) {
        this.name = "Bid";
        this.tag = Buffer.from([97, 66]); // "aB"

        bidderKey = address.decode(bidderKey);
        auctionKey = address.decode(auctionKey);

        if (!Number.isSafeInteger(bidAmount) || bidAmount < 0) throw Error("Bid amount must be positive and 2^53-1");
        if (!Number.isSafeInteger(bidID) || bidID < 0) throw Error("BidID must be positive and 2^53-1");
        if (!Number.isSafeInteger(auctionID) || auctionID < 0) throw Error("auctionID must be positive");

        Object.assign(this, {
            bidderKey, auctionKey, bidAmount, maxPrice, bidID, auctionID,
        });
    }

    get_obj_for_encoding() {
        return {
            "bidder": Buffer.from(this.bidderKey.publicKey),
            "cur": this.bidAmount,
            "price": this.maxPrice,
            "id": this.bidID,
            "auc": Buffer.from(this.auctionKey.publicKey),
            "aid": this.auctionID,
        };
    }

    signBid(sk) {
        const encodedMsg = encoding.encode(this.get_obj_for_encoding());
        const toBeSigned = Buffer.from(utils.concatArrays(this.tag, encodedMsg));
        const sig = nacl.sign(toBeSigned, sk);

        // construct signed message
        let sBid = {
            "sig": Buffer.from(sig),
            "bid": this.get_obj_for_encoding(),

        };

        let note = {
            "t": "b",
            "b": sBid
        };
        return new Uint8Array(encoding.encode(note));
    }


}

module.exports = {Bid};