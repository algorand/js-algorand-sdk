"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const client = require('./client');

const txn = require("../transaction");

function Kmd(token, baseServer = "http://127.0.0.1", port = 7833) {
  // Get client
  let c = new client.HTTPClient({
    'X-KMD-API-Token': token
  }, baseServer, port);
  /**
   * version returns a VersionResponse containing a list of kmd API versions supported by this running kmd instance.
   * @returns {Promise<*>}
   */

  this.versions =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/versions");
    return res.body;
  });
  /**
   * listWallets returns a ListWalletsResponse containing the list of wallets known to kmd. Using a wallet ID
   * returned from this endpoint, you can initialize a wallet handle with client.InitWalletHandle
   * @returns {Promise<*>}
   */

  this.listWallets =
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    let res = yield c.get("/v1/wallets");
    return res.body;
  });
  /**
   * createWallet creates a wallet with the specified name, password, driver,
   * and master derivation key. If the master derivation key is blank, one is
   * generated internally to kmd. CreateWallet returns a CreateWalletResponse
   * containing information about the new wallet.
   * @param walletName
   * @param walletPassword
   * @param walletDriverName
   * @param walletMDK
   * @returns {Promise<*>}
   */

  this.createWallet =
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(function* (walletName, walletPassword, walletMDK = "", walletDriverName = "sqlite") {
      let req = {
        "wallet_name": walletName,
        "wallet_driver_name": walletDriverName,
        "wallet_password": walletPassword,
        "master_derivation_key": Buffer.from(walletMDK).toString('base64')
      };
      let res = yield c.post("/v1/wallet", req);
      return res.body;
    });

    return function (_x, _x2) {
      return _ref3.apply(this, arguments);
    };
  }();
  /**
   * initWalletHandle accepts a wallet ID and a wallet password, and returns an
   * initWalletHandleResponse containing a wallet handle token. This wallet
   * handle token can be used for subsequent operations on this wallet, like key
   * generation, transaction signing, etc.. WalletHandleTokens expire after a
   * configurable number of seconds, and must be renewed periodically with
   * RenewWalletHandle. It is good practice to call ReleaseWalletHandle when
   * you're done interacting with this wallet.
   * @param walletID
   * @param walletPassword
   * @returns {Promise<*>}
   */


  this.initWalletHandle =
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(function* (walletID, walletPassword) {
      let req = {
        "wallet_id": walletID,
        "wallet_password": walletPassword
      };
      let res = yield c.post("/v1/wallet/init", req);
      return res.body;
    });

    return function (_x3, _x4) {
      return _ref4.apply(this, arguments);
    };
  }();
  /**
   * releaseWalletHandle invalidates the passed wallet handle token, making
   * it unusuable for subsequent wallet operations.
   * @param walletHandle
   * @returns {Promise<*>}
   */


  this.releaseWalletHandle =
  /*#__PURE__*/
  function () {
    var _ref5 = _asyncToGenerator(function* (walletHandle) {
      let req = {
        "wallet_handle_token": walletHandle
      };
      let res = yield c.post("/v1/wallet/release", req);
      return res.body;
    });

    return function (_x5) {
      return _ref5.apply(this, arguments);
    };
  }();
  /**
   * renewWalletHandle accepts a wallet handle and attempts to renew it, moving
   * the expiration time to some number of seconds in the future. It returns a
   * RenewWalletHandleResponse containing the walletHandle and the number of
   * seconds until expiration
   * @param walletHandle
   * @returns {Promise<*>}
   */


  this.renewWalletHandle =
  /*#__PURE__*/
  function () {
    var _ref6 = _asyncToGenerator(function* (walletHandle) {
      let req = {
        "wallet_handle_token": walletHandle
      };
      let res = yield c.post("/v1/wallet/renew", req);
      return res.body;
    });

    return function (_x6) {
      return _ref6.apply(this, arguments);
    };
  }();
  /**
   * renameWallet accepts a wallet ID, wallet password, and a new wallet name,
   * and renames the underlying wallet.
   * @param walletID
   * @param walletPassword
   * @param newWalletName
   * @returns {Promise<*>}
   */


  this.renameWallet =
  /*#__PURE__*/
  function () {
    var _ref7 = _asyncToGenerator(function* (walletID, walletPassword, newWalletName) {
      let req = {
        "wallet_id": walletID,
        "wallet_password": walletPassword,
        "wallet_name": newWalletName
      };
      let res = yield c.post("/v1/wallet/rename", req);
      return res.body;
    });

    return function (_x7, _x8, _x9) {
      return _ref7.apply(this, arguments);
    };
  }();
  /**
   * getWallet accepts a wallet handle and returns high level information about
   * this wallet in a GetWalletResponse.
   * @param walletHandle
   * @returns {Promise<*>}
   */


  this.getWallet =
  /*#__PURE__*/
  function () {
    var _ref8 = _asyncToGenerator(function* (walletHandle) {
      let req = {
        "wallet_handle_token": walletHandle
      };
      let res = yield c.post("/v1/wallet/info", req);
      return res.body;
    });

    return function (_x10) {
      return _ref8.apply(this, arguments);
    };
  }();
  /**
   * exportMasterDerivationKey accepts a wallet handle and a wallet password, and
   * returns an ExportMasterDerivationKeyResponse containing the master
   * derivation key. This key can be used as an argument to CreateWallet in
   * order to recover the keys generated by this wallet. The master derivation
   * key can be encoded as a sequence of words using the mnemonic library, and
   * @param walletHandle
   * @param walletPassword
   * @returns {Promise<*>}
   */


  this.exportMasterDerivationKey =
  /*#__PURE__*/
  function () {
    var _ref9 = _asyncToGenerator(function* (walletHandle, walletPassword) {
      let req = {
        "wallet_handle_token": walletHandle,
        "wallet_password": walletPassword
      };
      let res = yield c.post("/v1/master-key/export", req);
      return {
        "master_derivation_key": Buffer.from(res.body.master_derivation_key, 'base64')
      };
    });

    return function (_x11, _x12) {
      return _ref9.apply(this, arguments);
    };
  }();
  /**
   * importKey accepts a wallet handle and an ed25519 private key, and imports
   * the key into the wallet. It returns an ImportKeyResponse containing the
   * address corresponding to this private key.
   * @param walletHandle
   * @param secretKey
   * @returns {Promise<*>}
   */


  this.importKey =
  /*#__PURE__*/
  function () {
    var _ref10 = _asyncToGenerator(function* (walletHandle, secretKey) {
      let req = {
        "wallet_handle_token": walletHandle,
        "private_key": Buffer.from(secretKey).toString('base64')
      };
      let res = yield c.post("/v1/key/import", req);
      return res.body;
    });

    return function (_x13, _x14) {
      return _ref10.apply(this, arguments);
    };
  }();
  /**
   * exportKey accepts a wallet handle, wallet password, and address, and returns
   * an ExportKeyResponse containing the ed25519 private key corresponding to the
   * address stored in the wallet.
   * @param walletHandle
   * @param walletPassword
   * @param addr
   * @returns {Promise<*>}
   */


  this.exportKey =
  /*#__PURE__*/
  function () {
    var _ref11 = _asyncToGenerator(function* (walletHandle, walletPassword, addr) {
      let req = {
        "wallet_handle_token": walletHandle,
        "address": addr,
        "wallet_password": walletPassword
      };
      let res = yield c.post("/v1/key/export", req);
      return {
        "private_key": Buffer.from(res.body.private_key, 'base64')
      };
    });

    return function (_x15, _x16, _x17) {
      return _ref11.apply(this, arguments);
    };
  }();
  /**
   * generateKey accepts a wallet handle, and then generates the next key in the
   * wallet using its internal master derivation key. Two wallets with the same
   * master derivation key will generate the same sequence of keys.
   * @param walletHandle
   * @returns {Promise<*>}
   */


  this.generateKey =
  /*#__PURE__*/
  function () {
    var _ref12 = _asyncToGenerator(function* (walletHandle) {
      let req = {
        "wallet_handle_token": walletHandle,
        "display_mnemonic": false
      };
      let res = yield c.post("/v1/key", req);
      return res.body;
    });

    return function (_x18) {
      return _ref12.apply(this, arguments);
    };
  }();
  /**
   * deleteKey accepts a wallet handle, wallet password, and address, and deletes
   * the information about this address from the wallet (including address and
   * secret key). If DeleteKey is called on a key generated using GenerateKey,
   * the same key will not be generated again. However, if a wallet is recovered
   * using the master derivation key, a key generated in this way can be
   * recovered.
   * @param walletHandle
   * @param walletPassword
   * @param addr
   * @returns {Promise<*>}
   */


  this.deleteKey =
  /*#__PURE__*/
  function () {
    var _ref13 = _asyncToGenerator(function* (walletHandle, walletPassword, addr) {
      let req = {
        "wallet_handle_token": walletHandle,
        "address": addr,
        "wallet_password": walletPassword
      };
      let res = yield c.delete("/v1/key", req);
      return res.body;
    });

    return function (_x19, _x20, _x21) {
      return _ref13.apply(this, arguments);
    };
  }();
  /**
   * ListKeys accepts a wallet handle and returns a ListKeysResponse containing
   * all of the addresses for which this wallet contains secret keys.
   * @param walletHandle
   * @returns {Promise<*>}
   */


  this.listKeys =
  /*#__PURE__*/
  function () {
    var _ref14 = _asyncToGenerator(function* (walletHandle) {
      let req = {
        "wallet_handle_token": walletHandle
      };
      let res = yield c.post("/v1/key/list", req);
      return res.body;
    });

    return function (_x22) {
      return _ref14.apply(this, arguments);
    };
  }();
  /**
   * signTransaction accepts a wallet handle, wallet password, and a transaction,
   * and returns and SignTransactionResponse containing an encoded, signed
   * transaction. The transaction is signed using the key corresponding to the
   * Sender field.
   * @param walletHandle
   * @param walletPassword
   * @param transaction
   * @returns {Promise<*>}
   */


  this.signTransaction =
  /*#__PURE__*/
  function () {
    var _ref15 = _asyncToGenerator(function* (walletHandle, walletPassword, transaction) {
      let tx = new txn.Transaction(transaction);
      let req = {
        "wallet_handle_token": walletHandle,
        "wallet_password": walletPassword,
        "transaction": tx.toByte().toString('base64')
      };
      let res = yield c.post("/v1/transaction/sign", req);

      if (res.statusCode === 200) {
        return Buffer.from(res.body.signed_transaction, 'base64');
      }

      return res.body;
    });

    return function (_x23, _x24, _x25) {
      return _ref15.apply(this, arguments);
    };
  }();
  /**
   * listMultisig accepts a wallet handle and returns a ListMultisigResponse
   * containing the multisig addresses whose preimages are stored in this wallet.
   * A preimage is the information needed to reconstruct this multisig address,
   * including multisig version information, threshold information, and a list
   * of public keys.
   * @param walletHandle
   * @returns {Promise<*>}
   */


  this.listMultiSig =
  /*#__PURE__*/
  function () {
    var _ref16 = _asyncToGenerator(function* (walletHandle) {
      let req = {
        "wallet_handle_token": walletHandle
      };
      let res = yield c.post("/v1/multisig/list", req);
      return res.body;
    });

    return function (_x26) {
      return _ref16.apply(this, arguments);
    };
  }();
  /**
   * importMultiSig accepts a wallet handle and the information required to
   * generate a multisig address. It derives this address, and stores all of the
   * information within the wallet. It returns a ImportMultisigResponse with the
   * derived address.
   * @param walletHandle
   * @param version
   * @param threshold
   * @param pks
   * @returns {Promise<*>}
   */


  this.importMultiSig =
  /*#__PURE__*/
  function () {
    var _ref17 = _asyncToGenerator(function* (walletHandle, version, threshold, pks) {
      let req = {
        "wallet_handle_token": walletHandle,
        "multisig_version": version,
        "threshold": threshold,
        "pks": pks
      };
      let res = yield c.post("/v1/multisig/import", req);
      return res.body;
    });

    return function (_x27, _x28, _x29, _x30) {
      return _ref17.apply(this, arguments);
    };
  }();
  /**
   * exportMultisig accepts a wallet handle, wallet password, and multisig
   * address, and returns an ExportMultisigResponse containing the stored
   * multisig preimage. The preimage contains all of the information necessary
   * to derive the multisig address, including version, threshold, and a list of
   * public keys.
   * @param walletHandle
   * @param walletPassword
   * @param addr
   * @returns {Promise<*>}
   */


  this.exportMultisig =
  /*#__PURE__*/
  function () {
    var _ref18 = _asyncToGenerator(function* (walletHandle, walletPassword, addr) {
      let req = {
        "wallet_handle_token": walletHandle,
        "address": addr,
        "wallet_password": walletPassword
      };
      let res = yield c.post("/v1/multisig/export", req);
      return res.body;
    });

    return function (_x31, _x32, _x33) {
      return _ref18.apply(this, arguments);
    };
  }();
  /**
   * signMultisigTransaction accepts a wallet handle, wallet password,
   * transaction, public key (*not* an address), and an optional partial
   * MultisigSig. It looks up the secret key corresponding to the public key, and
   * returns a SignMultisigTransactionResponse containing a MultisigSig with a
   * signature by the secret key included.
   * @param walletHandle
   * @param pw
   * @param tx
   * @param pk
   * @param partial
   * @returns {Promise<*>}
   */


  this.signMultisigTransaction =
  /*#__PURE__*/
  function () {
    var _ref19 = _asyncToGenerator(function* (walletHandle, pw, tx, pk, partial) {
      let req = {
        "wallet_handle_token": walletHandle,
        "transaction": tx,
        "public_key": Buffer.from(pk).toString('base64'),
        "partial_multisig": partial,
        "wallet_password": pw
      };
      let res = yield c.delete("/v1/multisig/sign", req);
      return res.body;
    });

    return function (_x34, _x35, _x36, _x37, _x38) {
      return _ref19.apply(this, arguments);
    };
  }();
}

module.exports = {
  Kmd
};
module.exports = {
  Kmd
};