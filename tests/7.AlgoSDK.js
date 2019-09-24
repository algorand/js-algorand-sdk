let assert = require('assert');
let algosdk = require("../src/main");
let address = require("../src/encoding/address");
let encoding = require("../src/encoding/encoding");
let passphrase = require("../src/mnemonic/mnemonic");
let nacl = require("../src/nacl/naclWrappers");
let transaction = require("../src/transaction");

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
    });

    it('should return a blob that matches the go code for an asset configuration transaction', function() {
        let address = "BH55E5RMBD4GYWXGX5W5PJ5JAHPGM5OXKDQH5DC4O2MGI7NW4H6VOE4CP4"
        let golden = "gqNzaWfEQCRiqooONBncRNNplEiW0aKkcOn64MdOlHiRNN81GDQx0SqUYKL1q//4Yi5ziFdmtFOC7Iu/I8qbCkSlYPUVRAWjdHhuiKRhcGFyhKFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFmxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFtxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFyxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aRjYWlkgqFjxCAJ+9J2LAj4bFrmv23Xp6kB3mZ111Dgfoxcdphkfbbh/aFpzQTSo2ZlZc0OzqJmds4ABOwPomdoxCBIY7UYpLPITsgQ8i1PEIHLD3HwWaesIN7GL39w5Qk6IqJsds4ABO/3o3NuZMQg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGkdHlwZaRhY2Zn"
        let sk = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
        let o = {
            "from": address,
            "fee": 10,
            "firstRound": 322575,
            "lastRound": 323575,
            "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=",
            "creator": address,
            "index": 1234,
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
});