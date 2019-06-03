let assert = require('assert');
let algosdk = require("../src/main");
let address = require("../src/encoding/address");
let passphrase = require("../src/mnemonic/mnemonic");
let nacl = require("../src/nacl/naclWrappers");

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

    describe('Key pair', function() {
        it('should generate a key pair from a seed', function () {
            const keyPair = algosdk.generateAccount();
            const seed = keyPair.sk.slice(0, nacl.SEED_BYTES_LENGTH);
            const regeneratedKeyPair = algosdk.generateAccountFromSeed(seed);
            assert.equal(keyPair.addr, regeneratedKeyPair.addr);
            assert.deepStrictEqual(keyPair.sk, regeneratedKeyPair.sk);
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
});
