const client = require('./client');

function Kmd(token, baseServer = "http://127.0.0.1", port = 7833) {
    // Get client
    let c = new client.HTTPClient('X-KMD-API-Token', token, baseServer, port);

    /**
     * versions returns the list of supported versions
     * @returns {Promise<*>}
     */
    this.versions = async function () {
        let res = await c.get("/versions");
        return res.body;
    };

    /**
     * listWallets returns lists the wallets in kmd
     * @returns {Promise<*>}
     */
    this.listWallets = async function () {
        let res = await c.get("/v1/wallets");
        return res.body;
    };

    /**
     * createWallet creates a new wallet in kmd
     * @param walletName
     * @param walletPassword
     * @param walletDriverName
     * @param walletMDK
     * @returns {Promise<*>}
     */
    this.createWallet = async function (walletName, walletPassword, walletDriverName = "sqlite", walletMDK = "") {
        let req = {
            "wallet_name": walletName,
            "wallet_driver_name": walletDriverName,
            "wallet_password": walletPassword,
            "master_derivation_key": btoa(walletMDK),
        };
        let res = await c.post("/v1/wallet", req);
        return res.body;
    };

    /**
     * initWalletHandle
     * @param walletID
     * @param walletPassword
     * @returns {Promise<*>}
     */
    this.initWalletHandle = async function (walletID, walletPassword) {
        let req = {
            "wallet_id": walletID,
            "wallet_password": walletPassword,

        };
        let res = await c.post("/v1/wallet/init", req);
        return res.body;
    };

    /**
     * releaseWalletHandleHandle
     * @param walletHandle
     * @returns {Promise<*>}
     */
    this.releaseWalletHandle = async function (walletHandle) {
        let req = {
            "wallet_handle_token": walletHandle,
        };
        let res = await c.post("/v1/wallet/release", req);
        return res.body;
    };

    /**
     * renewWalletHandleHandle
     * @param walletHandle
     * @returns {Promise<*>}
     */
    this.renewWalletHandle = async function (walletHandle) {
        let req = {
            "wallet_handle_token": walletHandle,
        };
        let res = await c.post("/v1/wallet/renew", req);
        return res.body;
    };

    /**
     * renameWallet
     * @param walletHandle
     * @returns {Promise<*>}
     */
    this.renameWallet = async function (walletID, walletPassword, newWalletName) {
        let req = {
            "wallet_id": walletID,
            "wallet_password": walletPassword,
            "wallet_name": newWalletName

        };
        let res = await c.post("/v1/wallet/rename", req);
        return res.body;
    };

    /**
     * getWallet
     * @param walletHandle
     * @returns {Promise<*>}
     */
    this.getWallet = async function (walletHandle) {
        let req = {
            "wallet_handle_token": walletHandle,
        };
        let res = await c.post("/v1/wallet/info", req);
        return res.body;
    };

    /**
     * exportMasterDerivationKey
     * @param walletHandle
     * @param walletPassword
     * @returns {Promise<*>}
     */
    this.exportMasterDerivationKey = async function (walletHandle, walletPassword) {
        let req = {
            "wallet_handle_token": walletHandle,
            "wallet_password": walletPassword,
        };
        let res = await c.post("/v1/master_key/export", req);
        return res.body;
    };


    /**
     * importKey
     * @param walletHandle
     * @param walletPassword
     * @returns {Promise<*>}
     */
    this.importKey = async function (walletHandle, secretKey) {
        let req = {
            "wallet_handle_token": walletHandle,
            "private_key": btoa(secretKey),
        };
        let res = await c.post("/v1/key/import", req);
        return res.body;
    };

    /**
     * exportKey
     * @param walletHandle
     * @param walletPassword
     * @param addr
     * @returns {Promise<*>}
     */
    this.exportKey = async function (walletHandle, walletPassword, addr) {
        let req = {
            "wallet_handle_token": walletHandle,
            "address": addr,
            "wallet_password": walletPassword
        };
        let res = await c.post("/v1/key/export", req);
        return res.body;
    };

    this.generateKey = async function (walletHandle) {
        let req = {
            "wallet_handle_token": walletHandle,
            "display_mnemonic": false
        };
        let res = await c.post("/v1/key", req);
        return res.body;
    };

    /**
     * deleteKey
     * @param walletHandle
     * @param walletPassword
     * @param addr
     * @returns {Promise<*>}
     */
    this.deleteKey = async function (walletHandle, walletPassword, addr) {
        let req = {
            "wallet_handle_token": walletHandle,
            "address": addr,
            "wallet_password": walletPassword
        };
        let res = await c.delete("/v1/key", req);
        return res.body;
    };

    /**
     * signTransaction
     * @param walletHandle
     * @param walletPassword
     * @param transaction
     * @returns {Promise<*>}
     */
    this.signTransaction = async function (walletHandle, walletPassword, transaction) {
        let req = {
            "wallet_handle_token": walletHandle,
            "wallet_password": walletPassword,
            "transaction": transaction
        };
        let res = await c.post("/v1/transaction/sign", req);
        return res.body;
    };

    /**
     *
     * @param walletHandle
     * @returns {Promise<*>}
     */
    this.listMultiSig = async function (walletHandle) {
        let req = {
            "wallet_handle_token": walletHandle,
        };
        let res = await c.post("/v1/multisig/list", req);
        return res.body;
    };

    /**
     * importMultiSig
     * @param walletHandle
     * @param version
     * @param threshold
     * @param pks
     * @returns {Promise<*>}
     */
    this.importMultiSig = async function (walletHandle, version, threshold, pks) {
        let req = {
            "wallet_handle_token": walletHandle,
            "multisig_version": version,
            "threshold": threshold,
            "pks": pks
        };
        let res = await c.post("/v1/multisig/import", req);
        return res.body;
    };

    /**
     * exportMultisig
     * @param walletHandle
     * @param walletPassword
     * @param addr
     * @returns {Promise<*>}
     */
    this.exportMultisig = async function (walletHandle, walletPassword, addr) {
        let req = {
            "wallet_handle_token": walletHandle,
            "address": addr,
            "wallet_password": walletPassword
        };
        let res = await c.post("/v1/multisig/export", req);
        return res.body;
    };

    /**
     * signMultisigTransaction
     * @param walletHandle
     * @param pw
     * @param tx
     * @param pk
     * @param partial
     * @returns {Promise<*>}
     */
    this.signMultisigTransaction = async function (walletHandle, pw, tx, pk, partial) {
        let req = {
            "wallet_handle_token": walletHandle,
            "transaction": tx,
            "public_key": btoa(pk),
            "partial_multisig": partial,
            "wallet_password": pw
        };
        let res = await c.delete("/v1/multisig/sign", req);
        return res.body;
    };


}


module.exports = {Kmd};