let assert = require('assert');
let algosdk = require("../src/main");
let address = require("../src/encoding/address");
let encoding = require("../src/encoding/encoding");
let passphrase = require("../src/mnemonic/mnemonic");
let nacl = require("../src/nacl/naclWrappers");
let transaction = require("../src/transaction");
let logicsig = require("../src/logicsig");
let v2client = require("../src/client/v2/algod/algod");

describe('Algosdk (AKA end to end)', function () {
    describe('#mnemonic', function () {
        it('should export and import', function () {
            for (let i=0 ; i<50 ; i++) {
                let keys = algosdk.generateAccount();
                let mn = algosdk.secretKeyToMnemonic(keys.sk);
                let recovered = algosdk.mnemonicToSecretKey(mn);
                assert.deepStrictEqual(keys.sk, recovered.sk);
                assert.deepStrictEqual(keys.addr, recovered.addr);
            }
        });
    });

    describe('#encoding', function () {
        it('should encode and decode', function () {
            let o = {"a": [1, 2, 3, 4, 5], "b": 3486, "c": "skfg"};
            assert.deepStrictEqual(o, algosdk.decodeObj(algosdk.encodeObj(o)));
        });

        it('should encode and decode strings', function () {
            let o = "Hi there";
            assert.deepStrictEqual(o, algosdk.decodeObj(algosdk.encodeObj(o)));
        });
    });

    describe('Sign', function () {
        it('should return a blob that matches the go code', function () {
            let sk = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            let golden = "gqNzaWfEQPhUAZ3xkDDcc8FvOVo6UinzmKBCqs0woYSfodlmBMfQvGbeUx3Srxy3dyJDzv7rLm26BRv9FnL2/AuT7NYfiAWjdHhui6NhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0EmKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqRub3RlxAjqABVHQ2y/lqNyY3bEIHts4k/rW6zAsWTinCIsV/X2PcOH1DkEglhBHF/hD3wCo3NuZMQg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGkdHlwZaNwYXk=";
            let o = {
                "to": "PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI",
                "fee": 4,
                "amount": 1000,
                "firstRound": 12466,
                "lastRound": 13466,
                "genesisID": "devnet-v33.0",
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
                "note": new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64")),
            };

            sk = algosdk.mnemonicToSecretKey(sk);

            let js_dec = algosdk.signTransaction(o, sk.sk);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), Buffer.from(golden, "base64"));

            // // Check txid
            let tx_golden = "5FJDJD5LMZC3EHUYYJNH5I23U4X6H2KXABNDGPIL557ZMJ33GZHQ";
            assert.deepStrictEqual(js_dec.txID, tx_golden);
        });

        it('should return a blob that matches the go code when using a flat fee', function () {
            let sk = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            let golden = "gqNzaWfEQPhUAZ3xkDDcc8FvOVo6UinzmKBCqs0woYSfodlmBMfQvGbeUx3Srxy3dyJDzv7rLm26BRv9FnL2/AuT7NYfiAWjdHhui6NhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0EmKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqRub3RlxAjqABVHQ2y/lqNyY3bEIHts4k/rW6zAsWTinCIsV/X2PcOH1DkEglhBHF/hD3wCo3NuZMQg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGkdHlwZaNwYXk=";
            let o = {
                "to": "PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI",
                "fee": 1176,
                "amount": 1000,
                "firstRound": 12466,
                "lastRound": 13466,
                "genesisID": "devnet-v33.0",
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
                "note": new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64")),
                "flatFee": true
            };

            sk = algosdk.mnemonicToSecretKey(sk);

            let js_dec = algosdk.signTransaction(o, sk.sk);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), Buffer.from(golden, "base64"));

            // // Check txid
            let tx_golden = "5FJDJD5LMZC3EHUYYJNH5I23U4X6H2KXABNDGPIL557ZMJ33GZHQ";
            assert.deepStrictEqual(js_dec.txID, tx_golden);
        });

        it('should return a blob that matches the go code when constructing with a lease', function () {
            let sk = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            let golden = "gqNzaWfEQOMmFSIKsZvpW0txwzhmbgQjxv6IyN7BbV5sZ2aNgFbVcrWUnqPpQQxfPhV/wdu9jzEPUU1jAujYtcNCxJ7ONgejdHhujKNhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0FLKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqJseMQgAQIDBAECAwQBAgMEAQIDBAECAwQBAgMEAQIDBAECAwSkbm90ZcQI6gAVR0Nsv5ajcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihpHR5cGWjcGF5";
            let lease = new Uint8Array([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
            let o = {
                "to": "PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI",
                "fee": 4,
                "amount": 1000,
                "firstRound": 12466,
                "lastRound": 13466,
                "genesisID": "devnet-v33.0",
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
                "note": new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64")),
                "lease": lease
            };

            sk = algosdk.mnemonicToSecretKey(sk);

            let js_dec = algosdk.signTransaction(o, sk.sk);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), Buffer.from(golden, "base64"));

            // Check txid
            let tx_golden = "7BG6COBZKF6I6W5XY72ZE4HXV6LLZ6ENSR6DASEGSTXYXR4XJOOQ";
            assert.deepStrictEqual(js_dec.txID, tx_golden);
        });

        it('should return a blob that matches the go code when adding a lease', function () {
            let sk = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            let golden = "gqNzaWfEQOMmFSIKsZvpW0txwzhmbgQjxv6IyN7BbV5sZ2aNgFbVcrWUnqPpQQxfPhV/wdu9jzEPUU1jAujYtcNCxJ7ONgejdHhujKNhbXTNA+ilY2xvc2XEIEDpNJKIJWTLzpxZpptnVCaJ6aHDoqnqW2Wm6KRCH/xXo2ZlZc0FLKJmds0wsqNnZW6sZGV2bmV0LXYzMy4womdoxCAmCyAJoJOohot5WHIvpeVG7eftF+TYXEx4r7BFJpDt0qJsds00mqJseMQgAQIDBAECAwQBAgMEAQIDBAECAwQBAgMEAQIDBAECAwSkbm90ZcQI6gAVR0Nsv5ajcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihpHR5cGWjcGF5";
            let lease = new Uint8Array([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
            let to = "PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI";
            let fee = 4;
            let amount = 1000;
            let firstRound = 12466;
            let lastRound = 13466;
            let genesisID = "devnet-v33.0";
            let genesisHash = "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=";
            let closeRemainderTo = "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA";
            let note = new Uint8Array(Buffer.from("6gAVR0Nsv5Y=", "base64"))
            sk = algosdk.mnemonicToSecretKey(sk);
            let key = nacl.keyPairFromSecretKey(sk.sk);
            let from = address.encode(key.publicKey);
            let txn = algosdk.makePaymentTxn(from, to, fee, amount, closeRemainderTo, firstRound, lastRound, note, genesisHash, genesisID);
            txn.addLease(lease, fee);

            let txnBytes = txn.signTxn(sk.sk);
            assert.deepStrictEqual(Buffer.from(txnBytes), Buffer.from(golden, "base64"));

            // Check txid
            let tx_golden = "7BG6COBZKF6I6W5XY72ZE4HXV6LLZ6ENSR6DASEGSTXYXR4XJOOQ";
            assert.deepStrictEqual(txn.txID().toString(), tx_golden);
        });
    });

    describe('Sign and verify bytes', function () {
        it('should verify a correct signature', function () {
            let account = algosdk.generateAccount();
            let toSign = new Uint8Array(Buffer.from([1, 9, 25, 49]));
            let signed = algosdk.signBytes(toSign, account.sk);
            assert.equal(true, algosdk.verifyBytes(toSign, signed, account.addr))
        });
        it('should not verify a corrupted signature', function () {
            let account = algosdk.generateAccount();
            let toSign = Buffer.from([1, 9, 25, 49]);
            let signed = algosdk.signBytes(toSign, account.sk);
            signed[0] = (signed[0] + 1)%256;
            assert.equal(false, algosdk.verifyBytes(toSign, signed, account.addr))
        });
    });

    describe('Multisig Sign', function () {
        it('should return a blob that matches the go code', function () {
            const params = {
                version: 1,
                threshold: 2,
                addrs: [
                    "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
                    "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
                    "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
                ],
            }; // msig address - RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM

            let mnem3 = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            let seed = passphrase.seedFromMnemonic(mnem3);
            let keys = nacl.keyPairFromSeed(seed);
            let sk = keys.secretKey;

            let o = {
                "to": "PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI",
                "fee": 4,
                "amount": 1000,
                "firstRound": 12466,
                "lastRound": 13466,
                "genesisID": "devnet-v33.0",
                "genesisHash": "JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=",
                "closeRemainderTo": "IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA",
                "note": new Uint8Array(Buffer.from("X4Bl4wQ9rCo=", "base64")),
            };

            let js_dec = algosdk.signMultisigTransaction(o, params, sk);
            // this golden also contains the correct multisig address
            let golden = Buffer.from("gqRtc2lng6ZzdWJzaWeTgaJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXiBonBrxCAJYzIJU3OJ8HVnEXc5kcfQPhtzyMT1K/av8BqiXPnCcYKicGvEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihoXPEQF6nXZ7CgInd1h7NVspIPFZNhkPL+vGFpTNwH3Eh9gwPM8pf1EPTHfPvjf14sS7xN7mTK+wrz7Odhp4rdWBNUASjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQSYomZ2zTCyo2dlbqxkZXZuZXQtdjMzLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zTSapG5vdGXECF+AZeMEPawqo3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ==", "base64");
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);

            // Check txid
            let tx_golden = "TDIO6RJWJIVDDJZELMSX5CPJW7MUNM3QR4YAHYAKHF3W2CFRTI7A";
            assert.deepStrictEqual(js_dec.txID, tx_golden);
        });
    });


    describe('Multisig Append', function () {
        it('should return a blob that matches the go code', function () {
            const params = {
                version: 1,
                threshold: 2,
                addrs: [
                    "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
                    "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
                    "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
                ],
            };
            let mnem1 = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
            let seed = passphrase.seedFromMnemonic(mnem1);
            let sk = nacl.keyPairFromSeed(seed).secretKey;

            // this is a multisig transaction with an existing signature
            let o = Buffer.from("gqRtc2lng6ZzdWJzaWeTgaJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXiBonBrxCAJYzIJU3OJ8HVnEXc5kcfQPhtzyMT1K/av8BqiXPnCcYKicGvEIOfw+E0GgR358xyNh4sRVfRnHVGhhcIAkIZn9ElYcGihoXPEQF6nXZ7CgInd1h7NVspIPFZNhkPL+vGFpTNwH3Eh9gwPM8pf1EPTHfPvjf14sS7xN7mTK+wrz7Odhp4rdWBNUASjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQSYomZ2zTCyo2dlbqxkZXZuZXQtdjMzLjCiZ2jEICYLIAmgk6iGi3lYci+l5Ubt5+0X5NhcTHivsEUmkO3Somx2zTSapG5vdGXECF+AZeMEPawqo3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ==", "base64");

            let js_dec = algosdk.appendSignMultisigTransaction(o, params, sk);
            let golden = Buffer.from("gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAjmG2MILQVLoKg8q7jAYpu0r42zu9edYHrkkuSAikJAnDPplY1Pq90/ssyFhpKLrmvDDcSwNAwTGBjqtSOFYUAIGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgqJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGhc8RAXqddnsKAid3WHs1Wykg8Vk2GQ8v68YWlM3AfcSH2DA8zyl/UQ9Md8++N/XixLvE3uZMr7CvPs52Gnit1YE1QBKN0aHICoXYBo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNBJiiZnbNMLKjZ2VurGRldm5ldC12MzMuMKJnaMQgJgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dKibHbNNJqkbm90ZcQIX4Bl4wQ9rCqjcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5", "base64");
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);

            // Check txid
            let tx_golden = "TDIO6RJWJIVDDJZELMSX5CPJW7MUNM3QR4YAHYAKHF3W2CFRTI7A";
            assert.deepStrictEqual(js_dec.txID, tx_golden);
        });
    });

    describe('Multisig Address', function () {
        it('should return the correct address from preimage', function () {
            const params = {
                version: 1,
                threshold: 2,
                addrs: [
                    "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
                    "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
                    "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
                ],
            };
            let outAddr = algosdk.multisigAddress(params);
            assert.deepStrictEqual(outAddr, "RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM");
        });
    });

    describe('Group operations', function () {
        it('should return a blob that matches the go code', function () {

            const address = "UPYAFLHSIPMJOHVXU2MPLQ46GXJKSDCEMZ6RLCQ7GWB5PRDKJUWKKXECXI";
            const [fromAddress, toAddress] = [address, address];
            const fee = 1000;
            const amount = 2000;
            const genesisID = "devnet-v1.0";
            const genesisHash = "sC3P7e2SdbqKJK0tbiCdK9tdSpbe6XeCGKdoNzmlj0E";
            const firstRound1 = 710399;
            const note1 = new Uint8Array(Buffer.from("wRKw5cJ0CMo=", "base64"));
            let o1 = {
                "to": toAddress,
                "from": fromAddress,
                "fee": fee,
                "amount": amount,
                "firstRound": firstRound1,
                "lastRound": firstRound1 + 1000,
                "genesisID": genesisID,
                "genesisHash": genesisHash,
                "note": note1,
                flatFee: true,
            };


            const firstRound2 = 710515
            const note2 = new Uint8Array(Buffer.from("dBlHI6BdrIg=", "base64"));

            let o2 = {
                "to": toAddress,
                "from": fromAddress,
                "fee": fee,
                "amount": amount,
                "firstRound": firstRound2,
                "lastRound": firstRound2 + 1000,
                "genesisID": genesisID,
                "genesisHash": genesisHash,
                "note": note2,
                flatFee: true,
            };

            const goldenTx1 = "gaN0eG6Ko2FtdM0H0KNmZWXNA+iiZnbOAArW/6NnZW6rZGV2bmV0LXYxLjCiZ2jEILAtz+3tknW6iiStLW4gnSvbXUqW3ul3ghinaDc5pY9Bomx2zgAK2uekbm90ZcQIwRKw5cJ0CMqjcmN2xCCj8AKs8kPYlx63ppj1w5410qkMRGZ9FYofNYPXxGpNLKNzbmTEIKPwAqzyQ9iXHremmPXDnjXSqQxEZn0Vih81g9fEak0spHR5cGWjcGF5";
            const goldenTx2 = "gaN0eG6Ko2FtdM0H0KNmZWXNA+iiZnbOAArXc6NnZW6rZGV2bmV0LXYxLjCiZ2jEILAtz+3tknW6iiStLW4gnSvbXUqW3ul3ghinaDc5pY9Bomx2zgAK21ukbm90ZcQIdBlHI6BdrIijcmN2xCCj8AKs8kPYlx63ppj1w5410qkMRGZ9FYofNYPXxGpNLKNzbmTEIKPwAqzyQ9iXHremmPXDnjXSqQxEZn0Vih81g9fEak0spHR5cGWjcGF5";

            let tx1 = new transaction.Transaction(o1);
            let tx2 = new transaction.Transaction(o2);

            // goal clerk send dumps unsigned transaction as signed with empty signature in order to save tx type
            let stx1 = Buffer.from(encoding.encode({txn: tx1.get_obj_for_encoding()}));
            let stx2 = Buffer.from(encoding.encode({txn: tx2.get_obj_for_encoding()}));
            assert.deepStrictEqual(stx1, Buffer.from(goldenTx1, "base64"));
            assert.deepStrictEqual(stx2, Buffer.from(goldenTx2, "base64"));


            // goal clerk group sets Group to every transaction and concatenate them in output file
            // simulating that behavior here
            const goldenTxg = "gaN0eG6Lo2FtdM0H0KNmZWXNA+iiZnbOAArW/6NnZW6rZGV2bmV0LXYxLjCiZ2jEILAtz+3tknW6iiStLW4gnSvbXUqW3ul3ghinaDc5pY9Bo2dycMQgLiQ9OBup9H/bZLSfQUH2S6iHUM6FQ3PLuv9FNKyt09SibHbOAAra56Rub3RlxAjBErDlwnQIyqNyY3bEIKPwAqzyQ9iXHremmPXDnjXSqQxEZn0Vih81g9fEak0so3NuZMQgo/ACrPJD2Jcet6aY9cOeNdKpDERmfRWKHzWD18RqTSykdHlwZaNwYXmBo3R4boujYW10zQfQo2ZlZc0D6KJmds4ACtdzo2dlbqtkZXZuZXQtdjEuMKJnaMQgsC3P7e2SdbqKJK0tbiCdK9tdSpbe6XeCGKdoNzmlj0GjZ3JwxCAuJD04G6n0f9tktJ9BQfZLqIdQzoVDc8u6/0U0rK3T1KJsds4ACttbpG5vdGXECHQZRyOgXayIo3JjdsQgo/ACrPJD2Jcet6aY9cOeNdKpDERmfRWKHzWD18RqTSyjc25kxCCj8AKs8kPYlx63ppj1w5410qkMRGZ9FYofNYPXxGpNLKR0eXBlo3BheQ==";
            {
                const gid = algosdk.computeGroupID([tx1, tx2]);
                tx1.group = gid;
                tx2.group = gid;
                stx1 = encoding.encode({txn: tx1.get_obj_for_encoding()});
                stx2 = encoding.encode({txn: tx2.get_obj_for_encoding()});
                const concat = Buffer.concat([stx1, stx2]);
                assert.deepStrictEqual(concat, Buffer.from(goldenTxg, "base64"));
            }

            // check computeGroupID for list of dicts (not Transaction objects)
            {
                const gid = algosdk.computeGroupID([o1, o2]);
                tx1.group = gid;
                tx2.group = gid;
                stx1 = encoding.encode({txn: tx1.get_obj_for_encoding()});
                stx2 = encoding.encode({txn: tx2.get_obj_for_encoding()});
                const concat = Buffer.concat([stx1, stx2]);
                assert.deepStrictEqual(concat, Buffer.from(goldenTxg, "base64"));
            }

            // check filtering by address in assignGroupID
            let result;
            result = algosdk.assignGroupID([tx1, tx2]);
            assert.equal(result.length, 2);

            result = algosdk.assignGroupID([tx1, tx2], "");
            assert.equal(result.length, 2);

            result = algosdk.assignGroupID([tx1, tx2], address);
            assert.equal(result.length, 2);

            result = algosdk.assignGroupID([tx1, tx2], "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA");
            assert.ok(result instanceof Array);
            assert.equal(result.length, 0);
        });
    });

    describe('assets', function () {
        it('should return a blob that matches the go code for asset create', function() {
            let address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let golden = "gqNzaWfEQEDd1OMRoQI/rzNlU4iiF50XQXmup3k5czI9hEsNqHT7K4KsfmA/0DUVkbzOwtJdRsHS8trm3Arjpy9r7AXlbAujdHhuh6RhcGFyiaJhbcQgZkFDUE80blJnTzU1ajFuZEFLM1c2U2djNEFQa2N5RmiiYW6odGVzdGNvaW6iYXWnd2Vic2l0ZaFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFmxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFtxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFyxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aF0ZKJ1bqN0c3SjZmVlzQ+0omZ2zgAE7A+iZ2jEIEhjtRiks8hOyBDyLU8QgcsPcfBZp6wg3sYvf3DlCToiomx2zgAE7/ejc25kxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aR0eXBlpGFjZmc=";
            let sk = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let createTxn = {
                "from": address,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetTotal": 100,
                "assetDefaultFrozen": false,
                "assetManager": address,
                "assetReserve": address,
                "assetFreeze": address,
                "assetClawback": address,
                "assetUnitName": "tst",
                "assetName": "testcoin",
                "assetURL": "website",
                "assetMetadataHash": "fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh",
                "type": "acfg"
            };
            sk = algosdk.mnemonicToSecretKey(sk);
            let js_dec_create = algosdk.signTransaction(createTxn, sk.sk);
            assert.deepStrictEqual(Buffer.from(js_dec_create.blob), Buffer.from(golden, "base64"));
        });

        it('should return a blob that matches the go code for asset create with decimals', function() {
            let address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let golden = "gqNzaWfEQCj5xLqNozR5ahB+LNBlTG+d0gl0vWBrGdAXj1ibsCkvAwOsXs5KHZK1YdLgkdJecQiWm4oiZ+pm5Yg0m3KFqgqjdHhuh6RhcGFyiqJhbcQgZkFDUE80blJnTzU1ajFuZEFLM1c2U2djNEFQa2N5RmiiYW6odGVzdGNvaW6iYXWnd2Vic2l0ZaFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aJkYwGhZsQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2hbcQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2hcsQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2hdGSidW6jdHN0o2ZlZc0P3KJmds4ABOwPomdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds4ABO/3o3NuZMQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2kdHlwZaRhY2Zn";
            let sk = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let createTxn = {
                "from": address,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetTotal": 100,
                "assetDecimals": 1,
                "assetDefaultFrozen": false,
                "assetManager": address,
                "assetReserve": address,
                "assetFreeze": address,
                "assetClawback": address,
                "assetUnitName": "tst",
                "assetName": "testcoin",
                "assetURL": "website",
                "assetMetadataHash": "fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh",
                "type": "acfg"
            };
            sk = algosdk.mnemonicToSecretKey(sk);
            let js_dec_create = algosdk.signTransaction(createTxn, sk.sk);
            assert.deepStrictEqual(Buffer.from(js_dec_create.blob), Buffer.from(golden, "base64"));
        });

        it('should return a blob that matches the go code for asset configuration', function() {
            let address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let golden = "gqNzaWfEQBBkfw5n6UevuIMDo2lHyU4dS80JCCQ/vTRUcTx5m0ivX68zTKyuVRrHaTbxbRRc3YpJ4zeVEnC9Fiw3Wf4REwejdHhuiKRhcGFyhKFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFmxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFtxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFyxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aRjYWlkzQTSo2ZlZc0NSKJmds4ABOwPomdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds4ABO/3o3NuZMQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2kdHlwZaRhY2Zn";
            let sk = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let o = {
                "from": address,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetIndex": 1234,
                "assetManager": address,
                "assetReserve": address,
                "assetFreeze": address,
                "assetClawback": address,
                "type": "acfg"
            };
            sk = algosdk.mnemonicToSecretKey(sk);
            let js_dec = algosdk.signTransaction(o, sk.sk);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), Buffer.from(golden, "base64"));
        });

        it('should return a blob that matches the go code for asset destroy', function() {
            let address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let golden = "gqNzaWfEQBSP7HtzD/Lvn4aVvaNpeR4T93dQgo4LvywEwcZgDEoc/WVl3aKsZGcZkcRFoiWk8AidhfOZzZYutckkccB8RgGjdHhuh6RjYWlkAaNmZWXNB1iiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv96NzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWkYWNmZw==";
            let sk = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let o = {
                "from": address,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetIndex": 1,
                "type": "acfg"
            };
            sk = algosdk.mnemonicToSecretKey(sk);
            let js_dec = algosdk.signTransaction(o, sk.sk);
            assert.deepStrictEqual(Buffer.from(js_dec.blob), Buffer.from(golden, "base64"));
        });
        it('should return a blob that matches the go code for asset freeze', function () {

            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";
            let o = {
                "from": addr,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323576,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "type": "afrz",
                "freezeAccount": addr,
                "assetIndex": 1,
                "freezeState" : true
            };

            let mnem = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let seed = passphrase.seedFromMnemonic(mnem);
            let keys = nacl.keyPairFromSeed(seed);
            let sk = keys.secretKey;
            let js_dec = algosdk.signTransaction(o, sk);
            let golden = Buffer.from("gqNzaWfEQAhru5V2Xvr19s4pGnI0aslqwY4lA2skzpYtDTAN9DKSH5+qsfQQhm4oq+9VHVj7e1rQC49S28vQZmzDTVnYDQGjdHhuiaRhZnJ6w6RmYWRkxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aRmYWlkAaNmZWXNCRqiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv+KNzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWkYWZyeg==", "base64");
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);
        });
        it('should return a blob that matches the go code for asset transfer', function () {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";

            let o = {
                "type": "axfer",
                "from": addr,
                "to": addr,
                "amount": 1,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323576,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetIndex": 1,
                "closeRemainderTo": addr
            };

            let mnem = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let seed = passphrase.seedFromMnemonic(mnem);
            let keys = nacl.keyPairFromSeed(seed);
            let sk = keys.secretKey;
            let js_dec = algosdk.signTransaction(o, sk);
            let golden = Buffer.from("gqNzaWfEQNkEs3WdfFq6IQKJdF1n0/hbV9waLsvojy9pM1T4fvwfMNdjGQDy+LeesuQUfQVTneJD4VfMP7zKx4OUlItbrwSjdHhuiqRhYW10AaZhY2xvc2XEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pGFyY3bEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9o2ZlZc0KvqJmds4ABOwPomdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds4ABO/4o3NuZMQgCfvSdiwI+Gxa5r9t16epAd5mdddQ4H6MXHaYZH224f2kdHlwZaVheGZlcqR4YWlkAQ==", "base64");
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);
        });
        it('should return a blob that matches the go code for asset accept', function () {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";

            let o = {
                "type": "axfer",
                "from": addr,
                "to": addr,
                "amount": 0,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetIndex": 1
            };

            let mnem = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let seed = passphrase.seedFromMnemonic(mnem);
            let keys = nacl.keyPairFromSeed(seed);
            let sk = keys.secretKey;
            let js_dec = algosdk.signTransaction(o, sk);
            let golden = Buffer.from("gqNzaWfEQJ7q2rOT8Sb/wB0F87ld+1zMprxVlYqbUbe+oz0WM63FctIi+K9eYFSqT26XBZ4Rr3+VTJpBE+JLKs8nctl9hgijdHhuiKRhcmN2xCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aNmZWXNCOiiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv96NzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWlYXhmZXKkeGFpZAE=", "base64");
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);
        });
        it('should return a blob that matches the go code for asset revoke', function () {
            let addr = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4";

            let o = {
                "type": "axfer",
                "from": addr,
                "to": addr,
                "assetRevocationTarget": addr,
                "amount": 1,
                "fee": 10,
                "firstRound": 322575,
                "lastRound": 323575,
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
                "assetIndex": 1
            };

            let mnem = "awful drop leaf tennis indoor begin mandate discover uncle seven only coil atom any hospital uncover make any climb actor armed measure need above hundred";
            let seed = passphrase.seedFromMnemonic(mnem);
            let keys = nacl.keyPairFromSeed(seed);
            let sk = keys.secretKey;
            let js_dec = algosdk.signTransaction(o, sk);
            let golden = Buffer.from("gqNzaWfEQHsgfEAmEHUxLLLR9s+Y/yq5WeoGo/jAArCbany+7ZYwExMySzAhmV7M7S8+LBtJalB4EhzEUMKmt3kNKk6+vAWjdHhuiqRhYW10AaRhcmN2xCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aRhc25kxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aNmZWXNCqqiZnbOAATsD6JnaMQgSGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiKibHbOAATv96NzbmTEIAn70nYsCPhsWua/bdenqQHeZnXXUOB+jFx2mGR9tuH9pHR5cGWlYXhmZXKkeGFpZAE=", "base64");
            assert.deepStrictEqual(Buffer.from(js_dec.blob), golden);
        });
    });

    describe('LogicSig', function () {
        it('should return valid logic sig object', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);  // int 1
            let lsig = algosdk.makeLogicSig(program);
            assert.equal(lsig.logic, program);
            assert.equal(lsig.args, undefined);
            assert.equal(lsig.sig, undefined);
            assert.equal(lsig.msig, undefined);

            let args = [
                Uint8Array.from("123"),
                Uint8Array.from("456")
            ];
            lsig = algosdk.makeLogicSig(program, args);
            assert.equal(lsig.logic, program);
            assert.equal(lsig.args, args);
        });
        it('should throw on invalid program', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            program[0] = 128;
            assert.throws(
                () => algosdk.makeLogicSig(program)
            );
        });
    });
    describe('Single logic sig', function () {
        it('should work on valid program', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            let keys = algosdk.generateAccount();
            let lsig = algosdk.makeLogicSig(program);
            lsig.sign(keys.sk);
            let verified = lsig.verify(address.decode(keys.addr).publicKey);
            assert.equal(verified, true);

            // check serialization
            let encoded = lsig.toByte();
            let obj = encoding.decode(encoded);
            let decoded = logicsig.LogicSig.from_obj_for_encoding(obj);
            assert.deepStrictEqual(decoded, lsig);
        });
    });
    describe('Multisig logic sig', function () {
        it('should work on valid program', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            let lsig = algosdk.makeLogicSig(program);

            let keys = algosdk.generateAccount();
            assert.throws(
                () => lsig.appendToMultisig(keys.sk),
                "empty msig"
            );

            const params = {
                version: 1,
                threshold: 2,
                addrs: [
                    "DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA",
                    "BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM",
                    "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU",
                ],
            };
            const outAddr = algosdk.multisigAddress(params);
            const msig_pk = address.decode(outAddr).publicKey;
            const mn1 = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
            const mn2 = "since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left";
            const sk1 = algosdk.mnemonicToSecretKey(mn1);
            const sk2 = algosdk.mnemonicToSecretKey(mn2);

            lsig.sign(sk1.sk, params);

            // fails on wrong key
            assert.throws(
                () => lsig.appendToMultisig(keys.sk)
            );

            lsig.appendToMultisig(sk2.sk);
            let verified = lsig.verify(msig_pk);
            assert.equal(verified, true);

            // combine sig and msig
            let lsigf = algosdk.makeLogicSig(program);
            lsigf.sign(keys.sk)
            lsig.sig = lsigf.sig;
            verified = lsig.verify(msig_pk);
            assert.equal(verified, false);

            lsig.sig = undefined;
            verified = lsig.verify(msig_pk);
            assert.equal(verified, true);

            // check serialization
            let encoded = lsig.toByte();
            let decoded = logicsig.LogicSig.fromByte(encoded);
            assert.deepStrictEqual(decoded, lsig);
        });
    });

    describe('LogicSig Transaction', function () {
        it('should match to goal-produced logic signed tx', function () {
            const fromAddress = "47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU";
            const toAddress = "PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI";
            const mn = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            const fee = 1000;
            const amount = 2000;
            const firstRound = 2063137;
            const genesisID = "devnet-v1.0";
            const genesisHash = "sC3P7e2SdbqKJK0tbiCdK9tdSpbe6XeCGKdoNzmlj0E=";
            const note = new Uint8Array(Buffer.from("8xMCTuLQ810=", "base64"));

            let txn = {
                "to": toAddress,
                "from": fromAddress,
                "fee": fee,
                "amount": amount,
                "firstRound": firstRound,
                "lastRound": firstRound + 1000,
                "genesisID": genesisID,
                "genesisHash": genesisHash,
                "note": note,
                flatFee: true,
            };

            let program = Uint8Array.from([1, 32, 1, 1, 34]);  // int 1
            let args = [
                Uint8Array.from([49, 50, 51]),
                Uint8Array.from([52, 53, 54])
            ];
            let lsig = algosdk.makeLogicSig(program, args);
            let sk = algosdk.mnemonicToSecretKey(mn);
            lsig.sign(sk.sk);

            let js_dec = algosdk.signLogicSigTransaction(txn, lsig);

            // goal clerk send -o tx3 -a 2000 --fee 1000 -d ~/.algorand -w test -L sig.lsig --argb64 MTIz --argb64 NDU2 \
            // -f 47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU \
            // -t PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI
            const golden = "gqRsc2lng6NhcmeSxAMxMjPEAzQ1NqFsxAUBIAEBIqNzaWfEQE6HXaI5K0lcq50o/y3bWOYsyw9TLi/oorZB4xaNdn1Z14351u2f6JTON478fl+JhIP4HNRRAIh/I8EWXBPpJQ2jdHhuiqNhbXTNB9CjZmVlzQPoomZ2zgAfeyGjZ2Vuq2Rldm5ldC12MS4womdoxCCwLc/t7ZJ1uookrS1uIJ0r211Klt7pd4IYp2g3OaWPQaJsds4AH38JpG5vdGXECPMTAk7i0PNdo3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaR0eXBlo3BheQ=="

            assert.deepStrictEqual(Buffer.from(js_dec.blob), Buffer.from(golden, "base64"));
            let sender_pk = address.decode(fromAddress).publicKey;
            let verified = lsig.verify(sender_pk);
            assert.equal(verified, true);
        });
    });});