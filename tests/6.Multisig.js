const assert = require('assert');
const { Buffer } = require('buffer');
const algosdk = require('../index');
const multisig = require('../src/multisig');

describe('Multisig Functionality', () => {
  describe('should generate correct partial signature', () => {
    it('first partial sig should match golden main repo result', () => {
      // Multisig Golden Params
      const params = {
        version: 1,
        threshold: 2,
        pks: [
          algosdk.decodeAddress(
            'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA'
          ).publicKey,
          algosdk.decodeAddress(
            'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM'
          ).publicKey,
          algosdk.decodeAddress(
            '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU'
          ).publicKey,
        ],
      };
      /* eslint-disable no-unused-vars */
      const multisigAddr =
        'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM';
      const mnem1 =
        'auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch';
      const mnem2 =
        'since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left';
      const mnem3 =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      /* eslint-enable no-unused-vars */

      const o = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        rcv: Buffer.from(
          algosdk.decodeAddress(
            'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI'
          ).publicKey
        ),
        fee: 1000,
        amt: 1000,
        close: Buffer.from(
          algosdk.decodeAddress(
            'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA'
          ).publicKey
        ),
        gh: Buffer.from(
          '/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0=',
          'base64'
        ),
        fv: 62229,
        lv: 63229,
        gen: 'devnet-v38.0',
        type: 'pay',
        note: Buffer.from('RSYiABhShvs=', 'base64'),
      };

      const msigTxn = multisig.MultisigTransaction.from_obj_for_encoding(o);
      const { sk } = algosdk.mnemonicToSecretKey(mnem1);
      const msigBlob = msigTxn.partialSignTxn(params, sk);

      const goldenExpected = Buffer.from(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ==',
        'base64'
      );
      assert.deepStrictEqual(Buffer.from(msigBlob), goldenExpected);
    });

    it('second partial sig should match golden main repo result', () => {
      // Multisig Golden Params
      const oneSigTxn = Buffer.from(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYGicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxgaJwa8Qg5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKGjdGhyAqF2AaN0eG6Lo2FtdM0D6KVjbG9zZcQgQOk0koglZMvOnFmmm2dUJonpocOiqepbZabopEIf/FejZmVlzQPoomZ2zfMVo2dlbqxkZXZuZXQtdjM4LjCiZ2jEIP6zbDkQFDkAw9pVQsoYNrAP0vgZWRJXzSP2BC+YyDadomx2zfb9pG5vdGXECEUmIgAYUob7o3JjdsQge2ziT+tbrMCxZOKcIixX9fY9w4fUOQSCWEEcX+EPfAKjc25kxCCNkrSJkAFzoE36Q1mjZmpq/OosQqBd2cH3PuulR4A36aR0eXBlo3BheQ==',
        'base64'
      );
      const params = {
        version: 1,
        threshold: 2,
        pks: [
          algosdk.decodeAddress(
            'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA'
          ).publicKey,
          algosdk.decodeAddress(
            'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM'
          ).publicKey,
          algosdk.decodeAddress(
            '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU'
          ).publicKey,
        ],
      };
      /* eslint-disable no-unused-vars */
      const multisigAddr =
        'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM';
      const mnem1 =
        'auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch';
      const mnem2 =
        'since during average anxiety protect cherry club long lawsuit loan expand embark forum theory winter park twenty ball kangaroo cram burst board host ability left';
      const mnem3 =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      /* eslint-enable no-unused-vars */

      const o = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        rcv: Buffer.from(
          algosdk.decodeAddress(
            'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI'
          ).publicKey
        ),
        fee: 1000,
        amt: 1000,
        close: Buffer.from(
          algosdk.decodeAddress(
            'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA'
          ).publicKey
        ),
        gh: Buffer.from(
          '/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0=',
          'base64'
        ),
        fv: 62229,
        lv: 63229,
        gen: 'devnet-v38.0',
        type: 'pay',
        note: Buffer.from('RSYiABhShvs=', 'base64'),
      };

      const msigTxn = multisig.MultisigTransaction.from_obj_for_encoding(o);
      const { sk } = algosdk.mnemonicToSecretKey(mnem2);
      const msigBlob = msigTxn.partialSignTxn(params, sk);

      const finMsigBlob = multisig.mergeMultisigTransactions([
        msigBlob,
        oneSigTxn,
      ]);
      const goldenExpected = Buffer.from(
        'gqRtc2lng6ZzdWJzaWeTgqJwa8QgG37AsEvqYbeWkJfmy/QH4QinBTUdC8mKvrEiCairgXihc8RAuLAFE0oma0skOoAmOzEwfPuLYpEWl4LINtsiLrUqWQkDxh4WHb29//YCpj4MFbiSgD2jKYt0XKRD86zKCF4RDYKicGvEIAljMglTc4nwdWcRdzmRx9A+G3PIxPUr9q/wGqJc+cJxoXPEQBAhuyRjsOrnHp3s/xI+iMKiL7QPsh8iJZ22YOJJP0aFUwedMr+a6wfdBXk1OefyrAN1wqJ9rq6O+DrWV1fH0ASBonBrxCDn8PhNBoEd+fMcjYeLEVX0Zx1RoYXCAJCGZ/RJWHBooaN0aHICoXYBo3R4boujYW10zQPopWNsb3NlxCBA6TSSiCVky86cWaabZ1Qmiemhw6Kp6ltlpuikQh/8V6NmZWXNA+iiZnbN8xWjZ2VurGRldm5ldC12MzguMKJnaMQg/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp2ibHbN9v2kbm90ZcQIRSYiABhShvujcmN2xCB7bOJP61uswLFk4pwiLFf19j3Dh9Q5BIJYQRxf4Q98AqNzbmTEII2StImQAXOgTfpDWaNmamr86ixCoF3Zwfc+66VHgDfppHR5cGWjcGF5',
        'base64'
      );
      assert.deepStrictEqual(Buffer.from(finMsigBlob), goldenExpected);
    });
  });

  describe('should sign keyreg transaction types', () => {
    it('first partial sig should match golden main repo result', () => {
      // prettier-ignore
      const rawTxBlob = Buffer.from([129, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      // prettier-ignore
      const oneSigTxBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 129, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      const params = {
        version: 1,
        threshold: 2,
        pks: [
          algosdk.decodeAddress(
            'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA'
          ).publicKey,
          algosdk.decodeAddress(
            'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM'
          ).publicKey,
          algosdk.decodeAddress(
            '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU'
          ).publicKey,
        ],
      };
      const decRawTx = algosdk.decodeObj(rawTxBlob).txn;
      const msigTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        decRawTx
      );
      const mnem1 =
        'auction inquiry lava second expand liberty glass involve ginger illness length room item discover ahead table doctor term tackle cement bonus profit right above catch';
      const { sk } = algosdk.mnemonicToSecretKey(mnem1);
      const msigBlob = msigTxn.partialSignTxn(params, sk);

      assert.deepStrictEqual(Buffer.from(msigBlob), oneSigTxBlob);
    });

    it('second partial sig with 3rd pk should match golden main repo result', () => {
      // prettier-ignore
      const rawOneSigTxBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 129, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      // prettier-ignore
      const twoSigTxBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      const params = {
        version: 1,
        threshold: 2,
        pks: [
          algosdk.decodeAddress(
            'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA'
          ).publicKey,
          algosdk.decodeAddress(
            'BFRTECKTOOE7A5LHCF3TTEOH2A7BW46IYT2SX5VP6ANKEXHZYJY77SJTVM'
          ).publicKey,
          algosdk.decodeAddress(
            '47YPQTIGQEO7T4Y4RWDYWEKV6RTR2UNBQXBABEEGM72ESWDQNCQ52OPASU'
          ).publicKey,
        ],
      };
      const decRawTx = algosdk.decodeObj(rawOneSigTxBlob).txn;
      const msigTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        decRawTx
      );
      const mnem3 =
        'advice pudding treat near rule blouse same whisper inner electric quit surface sunny dismiss leader blood seat clown cost exist hospital century reform able sponsor';
      const { sk } = algosdk.mnemonicToSecretKey(mnem3);
      const msigBlob = msigTxn.partialSignTxn(params, sk);

      const finMsigBlob = multisig.mergeMultisigTransactions([
        msigBlob,
        new Uint8Array(rawOneSigTxBlob),
      ]);
      assert.deepStrictEqual(Buffer.from(finMsigBlob), twoSigTxBlob);
    });

    it('merging should be symmetric and match golden main repo result', () => {
      // prettier-ignore
      const oneAndThreeBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 129, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      // prettier-ignore
      const twoAndThreeBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 129, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 227, 199, 17, 26, 50, 149, 36, 250, 241, 222, 56, 188, 127, 140, 131, 144, 167, 224, 18, 230, 61, 37, 113, 136, 156, 116, 104, 237, 140, 138, 121, 215, 140, 159, 38, 64, 106, 111, 177, 108, 51, 233, 152, 250, 233, 207, 138, 116, 61, 55, 89, 204, 6, 164, 2, 114, 128, 230, 199, 130, 136, 25, 207, 1, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);
      // prettier-ignore
      const allThreeBlob = Buffer.from([130, 164, 109, 115, 105, 103, 131, 166, 115, 117, 98, 115, 105, 103, 147, 130, 162, 112, 107, 196, 32, 27, 126, 192, 176, 75, 234, 97, 183, 150, 144, 151, 230, 203, 244, 7, 225, 8, 167, 5, 53, 29, 11, 201, 138, 190, 177, 34, 9, 168, 171, 129, 120, 161, 115, 196, 64, 113, 61, 44, 215, 188, 9, 110, 249, 243, 107, 227, 105, 200, 124, 12, 209, 21, 155, 67, 225, 240, 42, 107, 19, 212, 242, 236, 251, 14, 157, 232, 202, 93, 76, 125, 237, 173, 175, 178, 41, 145, 52, 43, 74, 132, 202, 20, 132, 237, 142, 122, 248, 31, 104, 105, 253, 168, 172, 70, 227, 115, 249, 227, 13, 130, 162, 112, 107, 196, 32, 9, 99, 50, 9, 83, 115, 137, 240, 117, 103, 17, 119, 57, 145, 199, 208, 62, 27, 115, 200, 196, 245, 43, 246, 175, 240, 26, 162, 92, 249, 194, 113, 161, 115, 196, 64, 227, 199, 17, 26, 50, 149, 36, 250, 241, 222, 56, 188, 127, 140, 131, 144, 167, 224, 18, 230, 61, 37, 113, 136, 156, 116, 104, 237, 140, 138, 121, 215, 140, 159, 38, 64, 106, 111, 177, 108, 51, 233, 152, 250, 233, 207, 138, 116, 61, 55, 89, 204, 6, 164, 2, 114, 128, 230, 199, 130, 136, 25, 207, 1, 130, 162, 112, 107, 196, 32, 231, 240, 248, 77, 6, 129, 29, 249, 243, 28, 141, 135, 139, 17, 85, 244, 103, 29, 81, 161, 133, 194, 0, 144, 134, 103, 244, 73, 88, 112, 104, 161, 161, 115, 196, 64, 125, 39, 23, 127, 48, 75, 104, 78, 54, 53, 177, 125, 33, 29, 42, 49, 173, 205, 5, 9, 225, 99, 169, 16, 177, 95, 186, 134, 218, 129, 179, 15, 219, 90, 103, 54, 188, 25, 90, 235, 144, 137, 45, 35, 66, 53, 45, 183, 232, 27, 20, 50, 91, 219, 194, 187, 55, 146, 113, 126, 233, 186, 161, 15, 163, 116, 104, 114, 2, 161, 118, 1, 163, 116, 120, 110, 140, 163, 102, 101, 101, 206, 0, 3, 200, 192, 162, 102, 118, 206, 0, 14, 249, 218, 163, 103, 101, 110, 172, 100, 101, 118, 110, 101, 116, 45, 118, 51, 56, 46, 48, 162, 103, 104, 196, 32, 254, 179, 108, 57, 16, 20, 57, 0, 195, 218, 85, 66, 202, 24, 54, 176, 15, 210, 248, 25, 89, 18, 87, 205, 35, 246, 4, 47, 152, 200, 54, 157, 162, 108, 118, 206, 0, 14, 253, 194, 166, 115, 101, 108, 107, 101, 121, 196, 32, 50, 18, 43, 43, 214, 61, 220, 83, 49, 150, 23, 165, 170, 83, 196, 177, 194, 111, 227, 220, 202, 242, 141, 54, 34, 181, 105, 119, 161, 64, 92, 134, 163, 115, 110, 100, 196, 32, 141, 146, 180, 137, 144, 1, 115, 160, 77, 250, 67, 89, 163, 102, 106, 106, 252, 234, 44, 66, 160, 93, 217, 193, 247, 62, 235, 165, 71, 128, 55, 233, 164, 116, 121, 112, 101, 166, 107, 101, 121, 114, 101, 103, 167, 118, 111, 116, 101, 102, 115, 116, 206, 0, 13, 187, 160, 166, 118, 111, 116, 101, 107, 100, 205, 39, 16, 167, 118, 111, 116, 101, 107, 101, 121, 196, 32, 112, 27, 215, 251, 145, 43, 7, 179, 8, 17, 255, 40, 29, 159, 238, 149, 99, 229, 128, 46, 32, 38, 137, 35, 25, 37, 143, 119, 250, 147, 30, 136, 167, 118, 111, 116, 101, 108, 115, 116, 206, 0, 15, 66, 64]);

      const finMsigBlob = multisig.mergeMultisigTransactions([
        new Uint8Array(twoAndThreeBlob),
        new Uint8Array(oneAndThreeBlob),
      ]);
      const finMsigBlobTwo = multisig.mergeMultisigTransactions([
        new Uint8Array(oneAndThreeBlob),
        new Uint8Array(twoAndThreeBlob),
      ]);
      assert.deepStrictEqual(Buffer.from(finMsigBlob), allThreeBlob);
      assert.deepStrictEqual(Buffer.from(finMsigBlobTwo), allThreeBlob);
    });
  });

  describe('read-only transaction methods should work as expected on multisig transactions', () => {
    let stdPaymentTxn;
    let msigPaymentTxn;

    let stdKeyregTxn;
    let msigKeyregTxn;

    // Create a multisig transaction to use for each test
    beforeEach(() => {
      const paymentTxnObj = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        rcv: Buffer.from(
          algosdk.decodeAddress(
            'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI'
          ).publicKey
        ),
        fee: 1000,
        amt: 1000,
        close: Buffer.from(
          algosdk.decodeAddress(
            'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA'
          ).publicKey
        ),
        gh: Buffer.from(
          '/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0=',
          'base64'
        ),
        fv: 62229,
        lv: 63229,
        gen: 'devnet-v38.0',
        type: 'pay',
        note: Buffer.from('RSYiABhShvs=', 'base64'),
      };

      stdPaymentTxn = algosdk.Transaction.from_obj_for_encoding(paymentTxnObj);
      msigPaymentTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        paymentTxnObj
      );

      const keyregTxnObj = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        fee: 10,
        fv: 51,
        lv: 61,
        note: Buffer.from([123, 12, 200]),
        gh: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        votekey: '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=',
        selkey: 'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=',
        votefst: 123,
        votelst: 456,
        votekd: 1234,
        gen: 'devnet-v38.0',
        type: 'keyreg',
      };

      stdKeyregTxn = algosdk.Transaction.from_obj_for_encoding(keyregTxnObj);
      msigKeyregTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        keyregTxnObj
      );
    });

    it('`estimateSize` method should match expected result', () => {
      assert.strictEqual(
        stdPaymentTxn.estimateSize(),
        msigPaymentTxn.estimateSize()
      );
      assert.strictEqual(
        stdKeyregTxn.estimateSize(),
        msigKeyregTxn.estimateSize()
      );
    });

    it('`txID` method should match expected result', () => {
      assert.strictEqual(stdPaymentTxn.txID(), msigPaymentTxn.txID());
      assert.strictEqual(stdKeyregTxn.txID(), msigKeyregTxn.txID());
    });

    it('`toString` method should match expected result', () => {
      assert.strictEqual(stdPaymentTxn.toString(), msigPaymentTxn.toString());
      assert.strictEqual(stdKeyregTxn.toString(), msigKeyregTxn.toString());
    });
  });

  describe('inherited MultisigTransaction methods that mutate transactions should throw errors', () => {
    let msigPaymentTxn;
    let msigKeyregTxn;

    // Create a multisig transaction to use for each test
    beforeEach(() => {
      const paymentTxnObj = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        rcv: Buffer.from(
          algosdk.decodeAddress(
            'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI'
          ).publicKey
        ),
        fee: 1000,
        amt: 1000,
        close: Buffer.from(
          algosdk.decodeAddress(
            'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA'
          ).publicKey
        ),
        gh: Buffer.from(
          '/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0=',
          'base64'
        ),
        fv: 62229,
        lv: 63229,
        gen: 'devnet-v38.0',
        type: 'pay',
        note: Buffer.from('RSYiABhShvs=', 'base64'),
      };

      const keyregTxnObj = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        fee: 10,
        fv: 51,
        lv: 61,
        note: Buffer.from([123, 12, 200]),
        gh: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        votekey: '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=',
        selkey: 'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=',
        votefst: 123,
        votelst: 456,
        votekd: 1234,
        gen: 'devnet-v38.0',
        type: 'keyreg',
      };

      msigPaymentTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        paymentTxnObj
      );
      msigKeyregTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        keyregTxnObj
      );
    });

    it('error should be thrown when attempting to add a lease to a transaction', () => {
      assert.throws(
        msigPaymentTxn.addLease,
        (err) => err.message === multisig.MULTISIG_NO_MUTATE_ERROR_MSG
      );
      assert.throws(
        msigKeyregTxn.addLease,
        (err) => err.message === multisig.MULTISIG_NO_MUTATE_ERROR_MSG
      );
    });

    it('error should be thrown when attempting to add a rekey to a transaction', () => {
      assert.throws(
        msigPaymentTxn.addRekey,
        (err) => err.message === multisig.MULTISIG_NO_MUTATE_ERROR_MSG
      );
      assert.throws(
        msigKeyregTxn.addRekey,
        (err) => err.message === multisig.MULTISIG_NO_MUTATE_ERROR_MSG
      );
    });
  });

  describe('error should be thrown when attempting to sign a transaction', () => {
    let msigPaymentTxn;
    let msigKeyregTxn;

    // Create a multisig transaction to use for each test
    beforeEach(() => {
      const paymentTxnObj = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        rcv: Buffer.from(
          algosdk.decodeAddress(
            'PNWOET7LLOWMBMLE4KOCELCX6X3D3Q4H2Q4QJASYIEOF7YIPPQBG3YQ5YI'
          ).publicKey
        ),
        fee: 1000,
        amt: 1000,
        close: Buffer.from(
          algosdk.decodeAddress(
            'IDUTJEUIEVSMXTU4LGTJWZ2UE2E6TIODUKU6UW3FU3UKIQQ77RLUBBBFLA'
          ).publicKey
        ),
        gh: Buffer.from(
          '/rNsORAUOQDD2lVCyhg2sA/S+BlZElfNI/YEL5jINp0=',
          'base64'
        ),
        fv: 62229,
        lv: 63229,
        gen: 'devnet-v38.0',
        type: 'pay',
        note: Buffer.from('RSYiABhShvs=', 'base64'),
      };

      const keyregTxnObj = {
        snd: Buffer.from(
          algosdk.decodeAddress(
            'RWJLJCMQAFZ2ATP2INM2GZTKNL6OULCCUBO5TQPXH3V2KR4AG7U5UA5JNM'
          ).publicKey
        ),
        fee: 10,
        fv: 51,
        lv: 61,
        note: Buffer.from([123, 12, 200]),
        gh: 'JgsgCaCTqIaLeVhyL6XlRu3n7Rfk2FxMeK+wRSaQ7dI=',
        votekey: '5/D4TQaBHfnzHI2HixFV9GcdUaGFwgCQhmf0SVhwaKE=',
        selkey: 'oImqaSLjuZj63/bNSAjd+eAh5JROOJ6j1cY4eGaJGX4=',
        votefst: 123,
        votelst: 456,
        votekd: 1234,
        gen: 'devnet-v38.0',
        type: 'keyreg',
      };

      msigPaymentTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        paymentTxnObj
      );
      msigKeyregTxn = multisig.MultisigTransaction.from_obj_for_encoding(
        keyregTxnObj
      );
    });

    it('signTxn method should throw an error', () => {
      assert.throws(
        msigPaymentTxn.signTxn,
        (err) => err.message === multisig.MULTISIG_USE_PARTIAL_SIGN_ERROR_MSG
      );
      assert.throws(
        msigKeyregTxn.signTxn,
        (err) => err.message === multisig.MULTISIG_USE_PARTIAL_SIGN_ERROR_MSG
      );
    });
  });
});
