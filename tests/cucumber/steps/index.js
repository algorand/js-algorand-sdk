const path = require('path');
const fs = require('fs');
const { BeforeAll, After, AfterAll, Given, When, Then, setDefaultTimeout } = require('cucumber');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const ServerMock = require("mock-http-server");
const getSteps = require("./steps");

const cucumberPath = path.dirname(__dirname);

setDefaultTimeout(60000);

BeforeAll(async function () {
    // You can use this hook to write code that will run one time before all scenarios,
    // before even the Background steps
    createIndexerMockServers();
    createAlgodV2MockServers();
});

After(async function () {
    // this code is run after each individual scenario
    resetIndexerMockServers();
    resetAlgodV2MockServers();
});

AfterAll(async function () {
    // this cleanup code is run after all scenarios are done
    cleanupIndexerMockServers();
    cleanupAlgodV2MockServers();
});

let algodMockServerResponder;
let indexerMockServerResponder;
let algodMockServerPathRecorder;
let indexerMockServerPathRecorder;

const stepOptions = {
    algod_token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    kmd_token: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    mockAlgodResponderPort: 31337,
    mockAlgodResponderHost: "localhost",
    mockIndexerResponderPort: 31338,
    mockIndexerResponderHost: "localhost",
    mockAlgodPathRecorderPort: 31339,
    mockAlgodPathRecorderHost: "localhost",
    mockIndexerPathRecorderPort: 31340,
    mockIndexerPathRecorderHost: "localhost"
};

function createIndexerMockServers() {
    indexerMockServerResponder = new ServerMock({ host: stepOptions.mockIndexerResponderHost, port: stepOptions.mockIndexerResponderPort });
    indexerMockServerResponder.start(emptyFunctionForMockServer);
    indexerMockServerPathRecorder = new ServerMock({host: stepOptions.mockIndexerPathRecorderHost, port: stepOptions.mockIndexerPathRecorderPort});
    indexerMockServerPathRecorder.start(emptyFunctionForMockServer);
}

function createAlgodV2MockServers() {
    algodMockServerResponder = new ServerMock({host: stepOptions.mockAlgodResponderHost, port: stepOptions.mockAlgodResponderPort});
    algodMockServerResponder.start(emptyFunctionForMockServer);
    algodMockServerPathRecorder = new ServerMock({host: stepOptions.mockAlgodPathRecorderHost, port: stepOptions.mockAlgodPathRecorderPort});
    algodMockServerPathRecorder.start(emptyFunctionForMockServer);
}

function resetIndexerMockServers() {
    if (indexerMockServerPathRecorder != undefined) {
        indexerMockServerPathRecorder.reset();
    }
    if (indexerMockServerResponder != undefined) {
        indexerMockServerResponder.reset();
    }
}

function resetAlgodV2MockServers() {
    if (algodMockServerPathRecorder != undefined) {
        algodMockServerPathRecorder.reset();
    }
    if (algodMockServerResponder != undefined) {
        algodMockServerResponder.reset();
    }
}

function cleanupIndexerMockServers() {
    if (indexerMockServerPathRecorder != undefined) {
        indexerMockServerPathRecorder.stop(emptyFunctionForMockServer);
    }
    if (indexerMockServerResponder != undefined) {
        indexerMockServerResponder.stop(emptyFunctionForMockServer);
    }
}

function cleanupAlgodV2MockServers() {
    if (algodMockServerPathRecorder != undefined) {
        algodMockServerPathRecorder.stop(emptyFunctionForMockServer);
    }
    if (algodMockServerResponder != undefined) {
        algodMockServerResponder.stop(emptyFunctionForMockServer);
    }
}

function emptyFunctionForMockServer() {}

function setupMockServerForResponses(fileName, jsonDirectory, mockServer) {
    const resultString = fs.readFileSync(path.join(cucumberPath, 'features', 'resources', jsonDirectory, fileName)).toString();

    let headers;  // example headers: { "content-type": "application/json" }
    let body;  // example body: JSON.stringify({ hello: "world" }
    if (fileName.endsWith("json")) {
        headers = { "content-type": "application/json" };
        body = resultString;
    }
    if (fileName.endsWith("base64")) {
        headers = { "content-type": "application/msgpack"};
        body = Buffer.from(resultString, 'base64');
    }
    let statusCode = 200;
    if (fileName.indexOf("Error") > -1) {
        statusCode = 500;
    }
    mockServer.on({
        method: 'GET',
        path: '*',
        reply: {
            status:  statusCode,
            headers: headers,
            body:    body
        }
    });
    mockServer.on({
        method: 'POST',
        path: '*',
        reply: {
            status:  statusCode,
            headers: headers,
            body:    body
        }
    });
    return body;
}

function setupMockServerForPaths(mockServer) {
    mockServer.on({
        method: 'GET',
        path: '*',
        reply: {
            status:  200
        }
    });
    mockServer.on({
        method: 'POST',
        path: '*',
        reply: {
            status:  200
        }
    });
}

const steps = getSteps(stepOptions);
for (const name of Object.keys(steps.given)) {
    const fn = steps.given[name];
    if (name === "mock http responses in {string} loaded from {string}") {
        Given(name, function (fileName, jsonDirectory) {
            const body1 = setupMockServerForResponses(fileName, jsonDirectory, algodMockServerResponder);
            const body2 = setupMockServerForResponses(fileName, jsonDirectory, indexerMockServerResponder);
            fn.call(this, body2 || body1);
        });
    } else if (name === "mock http responses in {string} loaded from {string} with status {int}.") {
        Given(name, function (fileName, jsonDirectory, status) {
            const body1 = setupMockServerForResponses(fileName, jsonDirectory, algodMockServerResponder);
            const body2 = setupMockServerForResponses(fileName, jsonDirectory, indexerMockServerResponder);
            fn.call(this, body2 || body1, status);
        });
    } else if (name === "mock server recording request paths") {
        Given(name, function () {
            setupMockServerForPaths(algodMockServerPathRecorder);
            setupMockServerForPaths(indexerMockServerPathRecorder);
            fn.call(this);
        });
    } else {
        Given(name, fn);
    }
}
for (const name of Object.keys(steps.when)) {
    const fn = steps.when[name];
    When(name, fn);
}
for (const name of Object.keys(steps.then)) {
    const fn = steps.then[name];
    if (name === "expect the path used to be {string}") {
        Then(name, function (expectedRequestPath) {
            // get all requests the mockservers have seen since reset
            const algodSeenRequests = algodMockServerPathRecorder.requests().map(req => req.url);
            const indexerSeenRequests = indexerMockServerPathRecorder.requests().map(req => req.url);
            fn.call(this, algodSeenRequests, indexerSeenRequests, expectedRequestPath);
        });
    } else if (name === "we expect the path used to be {string}") {
        Then(name, function (expectedRequestPath) {
            // get all requests the mockservers have seen since reset
            const algodSeenRequests = algodMockServerPathRecorder.requests().map(req => req.url);
            const indexerSeenRequests = indexerMockServerPathRecorder.requests().map(req => req.url);
            fn.call(this, algodSeenRequests, indexerSeenRequests, expectedRequestPath);
        });
    } else {
        Then(name, fn);
    }
}
