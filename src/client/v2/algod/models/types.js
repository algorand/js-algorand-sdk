const base = require("./base");
/**
 * Request data type for dryrun endpoint.
 * Given the Transactions and simulated ledger state upload,
 * run TEAL scripts and return debugging information.
 */
class DryrunRequest extends base.BaseModel {
    attribute_map = {
        "txns": "txns",
        "accounts": "accounts",
        "apps": "apps",
        "protocolVersion": "protocol-version",
        "round": "round",
        "latestTimestamp": "latest-timestamp",
        "sources": "sources"
    }

    /**
     * Creates a new <code>DryrunRequest</code> object.
     * @param txns {Array.<str>}
     * @param accounts {Array.<Account>}
     * @param apps {Array.<DryrunApp>}
     * @param protocolVersion {String} ProtocolVersion specifies a specific version string to operate under, otherwise whatever the current protocol of the network this algod is running in.
     * @param round {Number} Round is available to some TEAL scripts. Defaults to the current round on the network this algod is attached to.
     * @param latestTimestamp {Number} LatestTimestamp is available to some TEAL scripts. Defaults to the latest confirmed timestamp this algod is attached to.
     * @param sources {Array.<DryrunSource>}
     */

    constructor({txns, accounts, apps, protocolVersion, round, latestTimestamp, sources}) {
        super();
        this.txns = txns;
        this.accounts = accounts;
        this.apps = apps;
        this.protocolVersion = protocolVersion;
        this.round = round;
        this.latestTimestamp = latestTimestamp;
        this.sources = sources;
    }
}

/**
 * DryrunSource is TEAL source text that gets uploaded,
 * compiled, and inserted into transactions or application state.
 */
class DryrunSource extends base.BaseModel {
    attribute_map = {
        "fieldName": "field-name",
        "source": "source",
        "txnIndex": "txn-index",
        "appIndex": "app-index"
    }
    /**
     * Creates a new <code>DryrunSource</code> object.
     * @param fieldName {String} FieldName is what kind of sources this is. If lsig then it goes into the transactions[this.TxnIndex].LogicSig. If approv or clearp it goes into the Approval Program or Clear State Program of application[this.AppIndex].
     * @param source {String}
     * @param txnIndex {Number}
     * @param appIndex {Number}
     */
    constructor(fieldName, source, txnIndex, appIndex) {
        super();
        this.fieldName = fieldName;
        this.source = source;
        this.txnIndex = txnIndex;
        this.appIndex = appIndex;
    }
}

class Application extends base.BaseModel {
    attribute_map = {
        "id": "id",
        "params": "params"
    }
    constructor(id, params) {
        super();
        this.id = id;
        this.params = params;
    }
}

class ApplicationParams extends base.BaseModel {
    attribute_map = {
        "creator": "creator",
        "approvalProgram": "approval-program",
        "clearStateProgram": "clear-state-program",
        "localStateSchema": "local-state-schema",
        "globalStateSchema": "global-state-schema",
        "globalState": "global-state"
    }
    constructor({
        creator, approvalProgram, clearStateProgram,
        localStateSchema, globalStateSchema, globalState
    }) {
        super();
        this.creator = creator;
        this.approvalProgram = approvalProgram;
        this.clearStateProgram = clearStateProgram;
        this.localStateSchema = localStateSchema;
        this.globalStateSchema = globalStateSchema;
        this.globalState = globalState;
    }
}

class ApplicationStateSchema extends base.BaseModel {
    attribute_map = {
        "numUint": "num-uint",
        "numByteSlice": "num-byte-slice"
    }
    constructor(numUint, numByteSlice) {
        super();
        this.numUint = numUint;
        this.numByteSlice = numByteSlice;
    }
}

class ApplicationLocalStates extends base.BaseModel {
    attribute_map = {
        "id": "id",
        "state": "state"
    }

    constructor(id, state) {
        super();
        this.id = id;
        this.state = state;
    }
}

class ApplicationLocalState extends base.BaseModel {
    attribute_map = {
        "schema": "schema",
        "keyValue": "key-value"
    }

    constructor(schema, keyValue) {
        super();
        this.schema = schema;
        this.keyValue = keyValue;
    }
}

class TealKeyValue extends base.BaseModel {
    attribute_map = {
        "key": "key",
        "value": "value"
    }
    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }
}

class TealValue extends base.BaseModel {
    static openapi_types = {
        "type": Number,
        "bytes": String,
        "uint": Number
    }

    static openapi_attribute_map = {
        "type": "type",
        "bytes": "bytes",
        "uint": "uint"
    }

    attribute_map = {
        "type": "type",
        "bytes": "bytes",
        "uint": "uint"
    }

    constructor(type, bytes, uint) {
        super();
        this.type = type;
        this.bytes = bytes;
        this.uint = uint;
    }
}

class AssetHolding extends base.BaseModel {
    attribute_map = {
        "amount": "amount",
        "assetId": "asset-id",
        "creator": "creator",
        "isFrozen": "is-frozen"
    }

    constructor(amount, assetId, creator, isFrozen) {
        this.amount = amount;
        this.assetId = assetId;
        this.creator = creator;
        this.isFrozen = isFrozen;
    }
}

class Asset extends base.BaseModel {
    attribute_map = {
        "index": "index",
        "params": "params"

    }

    constructor(index, params) {
        this.amount = index;
        this.assetId = params;
    }
}

class AssetParams extends base.BaseModel {
    attribute_map = {
        "clawback": "clawback",
        "creator": "creator",
        "decimals": "decimals",
        "defaultFrozen": "default-frozen",
        "freeze": "freeze",
        "manager": "manager",
        "metadataHash": "metadata-hash",
        "name": "name",
        "reserve": "reserve",
        "total": "total",
        "unitName": "unit-name",
        "url": "url"
    }

    constructor({
        clawback, creator, decimals, defaultFrozen, freeze, manager,
        metadataHash, name, reserve, total, unitName, url
    }) {
        this.clawback = clawback;
        this.creator = creator;
        this.decimals = decimals;
        this.defaultFrozen = defaultFrozen;
        this.freeze = freeze;
        this.manager = manager;
        this.metadataHash = metadataHash;
        this.name = name;
        this.reserve = reserve;
        this.total = total;
        this.unitName = unitName;
        this.url = url;
    }
}

class Account extends base.BaseModel {
    attribute_map = {
        "address": "address",
        "amount": "amount",
        "amountWithoutPendingRewards": "amount-without-pending-rewards",
        "appsLocalState": "apps-local-state",
        "appsTotalSchema": "apps-total-schema",
        "assets": "assets",
        "createdApps": "created-apps",
        "createdAssets": "created-assets",
        "participation": "participation",
        "pendingRewards": "pending-rewards",
        "rewardBase": "reward-base",
        "rewards": "rewards",
        "round": "round",
        "status": "status",
        "sigType": "sig-type",
        "authAddr": "auth-addr"
    }

    constructor({
        address, amount, amountWithoutPendingRewards, appsLocalState, appsTotalSchema,
        assets, createdApps, createdAssets, participation,
        pendingRewards, rewardBase, rewards,
        round, status, sigType, authAddr
    }) {
        super();
        this.address = address;
        this.amount = amount;
        this.amountWithoutPendingRewards = amountWithoutPendingRewards;
        this.appsLocalState = appsLocalState;
        this.appsTotalSchema = appsTotalSchema;
        this.assets = assets;
        this.createdApps = createdApps;
        this.createdAssets = createdAssets;
        this.participation = participation;
        this.pendingRewards = pendingRewards;
        this.rewardBase = rewardBase;
        this.rewards = rewards;
        this.round = round;
        this.status = status;
        this.sigType = sigType;
        this.authAddr = authAddr;
    }
}

class EvalDelta extends base.BaseModel {
    static openapi_types = {
        "action": Number,
        "bytes": String,
        "uint": Number
    }

    static openapi_attribute_map = {
        "action": "action",
        "bytes": "bytes",
        "uint": "uint"
    }

    attribute_map = {
        "action": "action",
        "bytes": "bytes",
        "uint": "uint"
    }

    constructor(action, bytes, uint) {
        super();
        this.action = action;
        this.bytes = bytes;
        this.uint = uint;
    }
}

class EvalDeltaKeyValue extends base.BaseModel {
    static openapi_types = {
        "key": String,
        "value": EvalDelta
    }

    static openapi_attribute_map = {
        "key": "key",
        "value": "value"
    }

    attribute_map = {
        "key": "key",
        "value": "value"
    }

    constructor(key, value) {
        super();
        this.key = key;
        this.value = value;
    }
}

class AccountStateDelta extends base.BaseModel {
    static openapi_types = {
        "address": String,
        "delta": [EvalDeltaKeyValue]
    }

    static openapi_attribute_map = {
        "address": "address",
        "delta": "delta"
    }

    attribute_map = {
        "address": "address",
        "delta": "delta"
    }

    constructor(address, delta) {
        super();
        this.address = address;
        this.delta = delta;
    }
}

class DryrunState extends base.BaseModel {
    static openapi_types = {
        "line": Number,
        "pc": Number,
        "stack": [TealValue],
        "scratch": [TealValue],
        "error": String
    }

    static openapi_attribute_map = {
        "line": "line",
        "pc": "pc",
        "stack": "stack",
        "scratch": "scratch",
        "error": "error"
    }

    attribute_map = {
        "line": "line",
        "pc": "pc",
        "stack": "stack",
        "scratch": "scratch",
        "error": "error"
    }

    constructor({line, pc, stack, scratch, error}) {
        super();
        this.line = line;
        this.pc = pc;
        this.stack = stack;
        this.scratch = scratch;
        this.error = error;
    }
}

class DryrunTxnResult extends base.BaseModel {
    static openapi_types = {
        "disassembly": [String],
        "logic-sig-trace": [DryrunState],
        "logic-sig-messages": [String],
        "app-call-trace": [DryrunState],
        "app-call-messages": [String],
        "global-delta": [EvalDeltaKeyValue],
        "local-deltas": [AccountStateDelta]
    }

    static openapi_attribute_map = {
        "disassembly": "disassembly",
        "logic-sig-trace": "logicSigTrace",
        "logic-sig-messages": "logicSigMessages",
        "app-call-trace": "appCallTrace",
        "app-call-messages": "appCallMessages",
        "global-delta": "globalDelta",
        "local-deltas": "localDeltas"
    }

    attribute_map = {
        "disassembly": "disassembly",
        "logicSigTrace": "logic-sig-trace",
        "logicSigMessages": "logic-sig-messages",
        "appCallTrace": "app-call-trace",
        "appCallMessages": "app-call-messages",
        "globalDelta": "global-delta",
        "localDeltas": "local-deltas"
    }

    constructor({
        disassembly, logicSigTrace, logicSigMessages,
        appCallTrace, appCallMessages, globalDelta, localDeltas
    }) {
        super();
        this.disassembly = disassembly;
        this.logicSigTrace = logicSigTrace;
        this.logicSigMessages = logicSigMessages;
        this.appCallTrace = appCallTrace;
        this.appCallMessages = appCallMessages;
        this.globalDelta = globalDelta;
        this.localDeltas = localDeltas;
    }
}

class DryrunResponse extends base.BaseModel {
    static openapi_types = {
        "txns": [DryrunTxnResult],
        "error": String,
        "protocol-version": String
    }

    static openapi_attribute_map = {
        "txns": "txns",
        "error": "error",
        "protocol-version": "protocolVersion"
    }

    attribute_map = {
        "txns": "txns",
        "error": "error",
        "protocolVersion": "protocol-version"
    }

    constructor(txns, error, protocolVersion) {
        super();
        this.txns = txns;
        this.error = error;
        this.protocolVersion = protocolVersion;
    }
}

module.exports = {
    DryrunRequest, DryrunSource,
    Account,
    Application, ApplicationParams,
    Asset, AssetParams,
    AssetHolding, ApplicationLocalState, ApplicationStateSchema,
    TealKeyValue, TealValue,
    DryrunResponse, DryrunTxnResult, DryrunState,
};
