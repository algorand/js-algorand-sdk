let assert = require('assert');
let multisig = require("../src/multisig");
let nacl = require("../src/nacl/naclWrappers");
let address = require("../src/encoding/address");
let passphrase = require("../src/mnemonic/mnemonic");
let encoding = require('../src/encoding/encoding');

describe('Multisig Functionality', function () {

    describe('should generate correct partial signature', function () {
        it('first partial sig should match golden main repo result', function () {

            // Multisig Golden Params
            const params = {
                version: 1,
                threshold: 2,
                pks: [
                    address.decode("DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA").publicKey,
                    address.decode("BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM").publicKey,
                    address.decode("47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU").publicKey
                ],
            };
            const multisigAddr = "RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM";
            let mnem1 = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
            let mnem2 = "since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left";
            let mnem3 = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";

            let o = {
                "snd": Buffer.from(address.decode("RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM").publicKey),
                "rcv": Buffer.from(address.decode("PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI").publicKey),
                "fee": 1000,
                "amt": 1000,
                "close": Buffer.from(address.decode("IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA").publicKey),
                "gh": Buffer.from("/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0=", "base64"),
                "fv": 62229,
                "lv": 63229,
                "gen": 'devnet-v38.0',
                "type": 'pay',
                "note": Buffer.from("RSYiABhShvs=", "base64")
            };

            let msigTxn = multisig.MultiSigTransaction.from_obj_for_encoding(o);
            let seed = passphrase.seedFromMnemonic(mnem1);
            let sk = nacl.keyPairFromSeed(seed).secretKey;
            let msigBlob = msigTxn.partialSignTxn(params, sk);

            const goldenExpected = Buffer.from("gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ==", "base64");
            assert.deepStrictEqual(Buffer.from(msigBlob), goldenExpected);
        });

        it('second partial sig should match golden main repo result', function () {
            // Multisig Golden Params
            const oneSigTxn = Buffer.from("gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ==", "base64");
            const params = {
                version: 1,
                threshold: 2,
                pks: [
                    address.decode("DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA").publicKey,
                    address.decode("BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM").publicKey,
                    address.decode("47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU").publicKey
                ],
            };
            const multisigAddr = "RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM";
            let mnem1 = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
            let mnem2 = "since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left";
            let mnem3 = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";

            let o = {
                "snd": Buffer.from(address.decode("RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM").publicKey),
                "rcv": Buffer.from(address.decode("PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI").publicKey),
                "fee": 1000,
                "amt": 1000,
                "close": Buffer.from(address.decode("IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA").publicKey),
                "gh": Buffer.from("/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0=", "base64"),
                "fv": 62229,
                "lv": 63229,
                "gen": 'devnet-v38.0',
                "type": 'pay',
                "note": Buffer.from("RSYiABhShvs=", "base64")
            };

            let msigTxn = multisig.MultiSigTransaction.from_obj_for_encoding(o);
            let seed = passphrase.seedFromMnemonic(mnem2);
            let sk = nacl.keyPairFromSeed(seed).secretKey;
            let msigBlob = msigTxn.partialSignTxn(params, sk);

            let finMsigBlob = multisig.mergeMultisigTransactions([msigBlob, oneSigTxn]);
            const goldenExpected = Buffer.from("gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQBAhuyRjsOrnHp3s/xI+iMKiL7QPsh8iJZ22YOJJP0aFUwedMr+a6wfdBXk1OefyrAN1wqJ9rq6O+DrWV1fH0ASBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNA+iiZnbN8xWjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbN9v2kbm90ZcQIRSYiABhShvujcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5", "base64");
            assert.deepStrictEqual(Buffer.from(finMsigBlob), goldenExpected);
        });
    });

    describe('should sign keyreg transaction types', function () {
        it('first partial sig should match golden main repo result', function () {
            const rawTxBlob = Buffer.from([129, 163, 116, 120, 110, 137, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
            const oneSigTxBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 186, 52, 94, 163, 20, 123, 21, 228, 212, 78, 168, 14, 159, 234, 210, 219, 69, 206, 23, 113, 13, 3, 226, 107, 74, 6, 121, 202, 250, 195, 62, 13, 205, 64, 12, 208, 205, 69, 221, 116, 29, 15, 86, 243, 209, 159, 143, 116, 161, 84, 144, 104, 113, 8, 99, 78, 68, 12, 149, 213, 4, 83, 201, 15, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 129, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 137, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
            const params = {
                version: 1,
                threshold: 2,
                pks: [
                    address.decode("DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA").publicKey,
                    address.decode("BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM").publicKey,
                    address.decode("47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU").publicKey
                ],
            };
            const decRawTx = encoding.decode(rawTxBlob).txn;
            let msigTxn = multisig.MultiSigTransaction.from_obj_for_encoding(decRawTx);
            let mnem1 = "auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch";
            let seed = passphrase.seedFromMnemonic(mnem1);
            let sk = nacl.keyPairFromSeed(seed).secretKey;
            let msigBlob = msigTxn.partialSignTxn(params, sk);

            assert.deepStrictEqual(Buffer.from(msigBlob), oneSigTxBlob);
        });

        it('second partial sig with 3rd pk should match golden main repo result', function () {
            const rawOneSigTxBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 186, 52, 94, 163, 20, 123, 21, 228, 212, 78, 168, 14, 159, 234, 210, 219, 69, 206, 23, 113, 13, 3, 226, 107, 74, 6, 121, 202, 250, 195, 62, 13, 205, 64, 12, 208, 205, 69, 221, 116, 29, 15, 86, 243, 209, 159, 143, 116, 161, 84, 144, 104, 113, 8, 99, 78, 68, 12, 149, 213, 4, 83, 201, 15, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 129, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 137, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
            const twoSigTxBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 186, 52, 94, 163, 20, 123, 21, 228, 212, 78, 168, 14, 159, 234, 210, 219, 69, 206, 23, 113, 13, 3, 226, 107, 74, 6, 121, 202, 250, 195, 62, 13, 205, 64, 12, 208, 205, 69, 221, 116, 29, 15, 86, 243, 209, 159, 143, 116, 161, 84, 144, 104, 113, 8, 99, 78, 68, 12, 149, 213, 4, 83, 201, 15, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 172, 133, 89, 89, 172, 158, 161, 188, 202, 74, 255, 179, 164, 146, 102, 110, 184, 236, 130, 86, 57, 39, 79, 127, 212, 165, 55, 237, 62, 92, 74, 94, 125, 230, 99, 40, 182, 163, 187, 107, 97, 230, 207, 69, 218, 71, 26, 18, 234, 149, 97, 177, 205, 152, 74, 67, 34, 83, 246, 33, 28, 144, 156, 3, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 137, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
            const params = {
                version: 1,
                threshold: 2,
                pks: [
                    address.decode("DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA").publicKey,
                    address.decode("BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM").publicKey,
                    address.decode("47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU").publicKey
                ],
            };
            const decRawTx = encoding.decode(rawOneSigTxBlob).txn;
            let msigTxn = multisig.MultiSigTransaction.from_obj_for_encoding(decRawTx);
            let mnem3 = "advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor";
            let seed = passphrase.seedFromMnemonic(mnem3);
            let sk = nacl.keyPairFromSeed(seed).secretKey;
            let msigBlob = msigTxn.partialSignTxn(params, sk);

            let finMsigBlob = multisig.mergeMultisigTransactions([msigBlob, new Uint8Array(rawOneSigTxBlob)]);
            assert.deepStrictEqual(Buffer.from(finMsigBlob), twoSigTxBlob);
        });

        it('merging should be symmetric and match golden main repo result', function() {
            const oneAndThreeBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 186, 52, 94, 163, 20, 123, 21, 228, 212, 78, 168, 14, 159, 234, 210, 219, 69, 206, 23, 113, 13, 3, 226, 107, 74, 6, 121, 202, 250, 195, 62, 13, 205, 64, 12, 208, 205, 69, 221, 116, 29, 15, 86, 243, 209, 159, 143, 116, 161, 84, 144, 104, 113, 8, 99, 78, 68, 12, 149, 213, 4, 83, 201, 15, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 172, 133, 89, 89, 172, 158, 161, 188, 202, 74, 255, 179, 164, 146, 102, 110, 184, 236, 130, 86, 57, 39, 79, 127, 212, 165, 55, 237, 62, 92, 74, 94, 125, 230, 99, 40, 182, 163, 187, 107, 97, 230, 207, 69, 218, 71, 26, 18, 234, 149, 97, 177, 205, 152, 74, 67, 34, 83, 246, 33, 28, 144, 156, 3, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 137, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
            const twoAndThreeBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 129, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 191, 142, 166, 135, 208, 59, 232, 220, 86, 180, 101, 85, 236, 64, 3, 252, 51, 149, 11, 247, 226, 113, 205, 104, 169, 14, 112, 53, 194, 96, 41, 170, 89, 114, 185, 145, 228, 100, 220, 6, 209, 228, 152, 248, 176, 202, 48, 26, 1, 217, 102, 152, 112, 147, 86, 202, 146, 98, 226, 93, 95, 233, 162, 15, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 172, 133, 89, 89, 172, 158, 161, 188, 202, 74, 255, 179, 164, 146, 102, 110, 184, 236, 130, 86, 57, 39, 79, 127, 212, 165, 55, 237, 62, 92, 74, 94, 125, 230, 99, 40, 182, 163, 187, 107, 97, 230, 207, 69, 218, 71, 26, 18, 234, 149, 97, 177, 205, 152, 74, 67, 34, 83, 246, 33, 28, 144, 156, 3, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 137, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
            const allThreeBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 186, 52, 94, 163, 20, 123, 21, 228, 212, 78, 168, 14, 159, 234, 210, 219, 69, 206, 23, 113, 13, 3, 226, 107, 74, 6, 121, 202, 250, 195, 62, 13, 205, 64, 12, 208, 205, 69, 221, 116, 29, 15, 86, 243, 209, 159, 143, 116, 161, 84, 144, 104, 113, 8, 99, 78, 68, 12, 149, 213, 4, 83, 201, 15, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 191, 142, 166, 135, 208, 59, 232, 220, 86, 180, 101, 85, 236, 64, 3, 252, 51, 149, 11, 247, 226, 113, 205, 104, 169, 14, 112, 53, 194, 96, 41, 170, 89, 114, 185, 145, 228, 100, 220, 6, 209, 228, 152, 248, 176, 202, 48, 26, 1, 217, 102, 152, 112, 147, 86, 202, 146, 98, 226, 93, 95, 233, 162, 15, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 172, 133, 89, 89, 172, 158, 161, 188, 202, 74, 255, 179, 164, 146, 102, 110, 184, 236, 130, 86, 57, 39, 79, 127, 212, 165, 55, 237, 62, 92, 74, 94, 125, 230, 99, 40, 182, 163, 187, 107, 97, 230, 207, 69, 218, 71, 26, 18, 234, 149, 97, 177, 205, 152, 74, 67, 34, 83, 246, 33, 28, 144, 156, 3, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 137, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
            let finMsigBlob = multisig.mergeMultisigTransactions(
                [new Uint8Array(twoAndThreeBlob), new Uint8Array(oneAndThreeBlob)]
            );
            let finMsigBlobTwo = multisig.mergeMultisigTransactions(
                [new Uint8Array(oneAndThreeBlob), new Uint8Array(twoAndThreeBlob)]
            );
            assert.deepStrictEqual(Buffer.from(finMsigBlob), allThreeBlob);
            assert.deepStrictEqual(Buffer.from(finMsigBlobTwo), allThreeBlob);
        });
    });

});