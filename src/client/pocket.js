import { RpcError} from "@pokt-network/pocket-js/lib/src/rpc";
import { Pocket, Configuration, HttpRpcProvider, typeGuard, PocketAAT, Node } from "@pokt-network/pocket-js";


function Pocket(dispatchers, maxDispatchers, requestTimeOut, maxSessions) {

    let pocketClient = new Pocket.Pocket([], undefined, undefined, undefined);
    let configuration = null;
    this.createPocketInstance(dispatchers, maxDispatchers, requestTimeOut, maxSessions);

    this.createPocketInstance = function (dispatchers) {
        let dispatchersUrl = [];

        if (typeGuard(dispatchers, Array)) {
            throw new Error("The dispatchers needs to be an array");
        }

        if (typeof (maxDispatchers) !== "number" || typeof (requestTimeOut) !== "number" || typeof (maxSessions) !== "number") {
            throw new Error("The maxDispatchers, requestTimeOut and maxSessions need to be a number");
        }

        dispatchers.forEach(element => {
            dispatchersUrl.push(new URL(element));
        });


        const rpcProvider = new HttpRpcProvider(dispatchers);
        configuration = new Configuration(maxDispatchers, requestTimeOut, undefined, maxSessions);
        pocketClient = new Pocket(dispatchersUrl, rpcProvider, configuration, undefined);
    };

    this.validateType = function (type, ...parameters) {
        parameters.forEach(parameter => {
            if (typeof (parameter) !== type) {
                return false;
            }
        });
        return true;
    };

    this.sendRelay = async function (data, blockChain, version, clientPublicKey, applicationPublicKey, privateKey) {

        if (!this.validateType("string", data, blockChain, version, clientPublicKey, applicationPublicKey, privateKey)) {
            throw new Error("All the parameters need to be an string");
        }

        const aat = await PocketAAT.from(version, clientPublicKey, applicationPublicKey, privateKey);

        let response = await pocketClient.sendRelay(data, blockChain, aat, configuration, undefined, undefined, undefined, undefined, undefined)
        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON();
    };

    this.sendRawTransaction = async function (privateKey, fromAddress, toAddress, amount, chainID, fee, memo) {
        if (!this.validateType("string", privateKey, fromAddress, toAddress, amount, chainID, fee)) {
            throw new Error("All the parameters need to be an string")
        }

        const transactionSender = pocketClient.withPrivateKey(privateKey);
        if (typeGuard(transactionSender, Error)) {
            throw transactionSender
        }

        let response = await transactionSender.send(fromAddress, toAddress, amount).submit(chainID, fee, undefined, memo, undefined);
        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.sendRawTransaction = async function (address, passphrase, fromAddress, toAddress, amount, chainID, fee, memo) {
        if (!this.validateType("string", address, passphrase, fromAddress, toAddress, amount, chainID, fee)) {
            throw new Error("All the parameters need to be an string")
        }

        const transactionSender = pocketClient.withImportedAccount(address, passphrase);
        if (typeGuard(transactionSender, Error)) {
            throw transactionSender
        }

        let response = await transactionSender.send(fromAddress, toAddress, amount).submit(chainID, fee, undefined, memo, undefined);
        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getAccount = async function (address, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        if(typeof(address) !== "string") {
            throw new Error("The address needs to be a string")
        }

        let response = await rpc.query.getAccount(address, timeout);
        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    }

    this.getBlock = async function (blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        if(typeof(blockHeight) !== "number") {
            throw new Error("The address needs to be a number")
        }

        let response = await rpc.query.getBlock(BigInt(blockHeight), timeout);
        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getTX = async function (txHash, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        if(typeof(txHash) !== "string") {
            throw new Error("The txHash needs to be a number")
        }

        let response = await rpc.query.getTX(txHash, timeout);
        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getHeight = async function (timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        let response = await rpc.query.getHeight(timeout);
        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getBalance = async function (address, blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        if(typeof(address) !== "string") {
            throw new Error("The address needs to be a number")
        }

        let response = null

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The address needs to be a number")
            }

            response = await rpc.query.getBalance(address, BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getBalance(address, undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getNode = async function (address, blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        if(typeof(address) !== "string") {
            throw new Error("The address needs to be a number")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getNode(address, BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getNode(address, undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getNodeParams = async function (blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getNodeParams(BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getNodeParams(undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getNodeProofs = async function (address, blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        if(typeof(address) !== "string") {
            throw new Error("The address needs to be a number")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getNodeProofs(address, BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getNodeProofs(address, undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getApp = async function (address, blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        if(typeof(address) !== "string") {
            throw new Error("The address needs to be a number")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getApp(address, BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getApp(address, undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getAppParams = async function (blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getAppParams(BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getAppParams(undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getPocketParams = async function (blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getPocketParams(BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getPocketParams(undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getSupportedChains = async function (blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getSupportedChains(BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getSupportedChains(undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };

    this.getSupply = async function (blockHeight, timeout) {
        const rpc = pocketClient.rpc();
        if(rpc === undefined) {
            throw new Error("Please specify an RPC Provider")
        }

        let response = null;

        if(blockHeight !== undefined && blockHeight !== null) {
            if(typeof(blockHeight) !== "number") {
                throw new Error("The blockHeight needs to be a number")
            }

            response = await rpc.query.getSupply(BigInt(blockHeight), timeout);
        } else {
            response = await rpc.query.getSupply(undefined, timeout);
        }

        if (typeGuard(response, RpcError)) {
            throw response
        }
        return response.toJSON()
    };


}

module.exports = {Pocket};


module.exports = {Pocket};