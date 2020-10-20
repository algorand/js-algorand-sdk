const path = require('path');
const fs = require('fs');
const { BeforeAll, After, AfterAll, Given, When, Then, setDefaultTimeout } = require('cucumber');
const express = require('express');
const ServerMock = require("mock-http-server");
const getSteps = require("./steps");

const cucumberPath = path.dirname(__dirname);
const browser = process.env.TEST_BROWSER;

console.log('TEST_BROWSER is', browser);

let driver;
let driverBuilder;
if (browser) {
    const webdriver = require('selenium-webdriver');
    const chrome = require('selenium-webdriver/chrome');
    const firefox = require('selenium-webdriver/firefox');

    const chromeOptions = new chrome.Options();
    const firefoxOptions = new firefox.Options();

    if (process.env.CI) {
        chromeOptions.addArguments(['--no-sandbox','--headless','--disable-gpu']);
        firefoxOptions.addArguments(['-headless']);
    }

    driverBuilder = new webdriver.Builder()
        .setChromeOptions(chromeOptions)
        .setFirefoxOptions(firefoxOptions)
        .forBrowser(browser);
    
    if (process.env.SELENIUM_SERVER_URL) {
        driverBuilder = driverBuilder.usingServer(process.env.SELENIUM_SERVER_URL);
    } else {
        if (browser === 'chrome') {
            require('chromedriver');
        } else if (browser === 'firefox') {
            require('geckodriver');
        }
    }
    
    console.log('Testing in browser');
} else {
    console.log('Testing in node');
}

const browserServerPort = 8080;
let browserServer;

async function startBrowserServer() {
    const app = express();
    app.use(express.static(cucumberPath));
    await new Promise((resolve, reject) => {
        browserServer = app.listen(browserServerPort, undefined, resolve);
    });
}

function stopBrowserServer() {
    if (browserServer) {
        browserServer.close();
    }
}

setDefaultTimeout(60000);

BeforeAll(async function () {
    // You can use this hook to write code that will run one time before all scenarios,
    // before even the Background steps
    await createIndexerMockServers();
    await createAlgodV2MockServers();

    if (browser) {
        await startBrowserServer();

        driver = await driverBuilder.build();
        
        await driver.get(`http://localhost:${browserServerPort}/browser/index.html`);

        const title = await driver.getTitle();

        if (title !== "Algosdk Browser Testing") {
            throw new Error('Incorrect title: ' + title);
        }

        const options = Object.assign({ ignoreReturn: true }, stepOptions);

        // populate steps in browser context
        await driver.executeScript(getSteps, options);
    }
});

After(async function () {
    // this code is run after each individual scenario
    resetIndexerMockServers();
    resetAlgodV2MockServers();
});

AfterAll(async function () {
    // this cleanup code is run after all scenarios are done

    if (browser) {
        await driver.quit();
        stopBrowserServer();
    }

    await cleanupIndexerMockServers();
    await cleanupAlgodV2MockServers();
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

async function createIndexerMockServers() {
    indexerMockServerResponder = new ServerMock({ host: stepOptions.mockIndexerResponderHost, port: stepOptions.mockIndexerResponderPort });
    await new Promise((resolve, reject) => {
        indexerMockServerResponder.start(resolve);
    });

    indexerMockServerPathRecorder = new ServerMock({host: stepOptions.mockIndexerPathRecorderHost, port: stepOptions.mockIndexerPathRecorderPort});
    await new Promise((resolve, reject) => {
        indexerMockServerPathRecorder.start(resolve);
    });
}

async function createAlgodV2MockServers() {
    algodMockServerResponder = new ServerMock({host: stepOptions.mockAlgodResponderHost, port: stepOptions.mockAlgodResponderPort});
    await new Promise((resolve, reject) => {
        algodMockServerResponder.start(resolve);
    });

    algodMockServerPathRecorder = new ServerMock({host: stepOptions.mockAlgodPathRecorderHost, port: stepOptions.mockAlgodPathRecorderPort});
    await new Promise((resolve, reject) => {
        algodMockServerPathRecorder.start(resolve);
    });
}

function resetIndexerMockServers() {
    if (indexerMockServerPathRecorder != undefined) {
        indexerMockServerPathRecorder.reset();
    }
    if (indexerMockServerResponder != undefined) {
        indexerMockServerResponder.reset();
    }
}

async function resetAlgodV2MockServers() {
    if (algodMockServerPathRecorder != undefined) {
        algodMockServerPathRecorder.reset();
    }
    if (algodMockServerResponder != undefined) {
        algodMockServerResponder.reset();
    }
}

async function cleanupIndexerMockServers() {
    if (indexerMockServerPathRecorder != undefined) {
        await new Promise((resolve, reject) => {
            indexerMockServerPathRecorder.stop(resolve);
        });
    }
    if (indexerMockServerResponder != undefined) {
        await new Promise((resolve, reject) => {
            indexerMockServerResponder.stop(resolve);
        });
    }
}

async function cleanupAlgodV2MockServers() {
    if (algodMockServerPathRecorder != undefined) {
        await new Promise((resolve, reject) => {
            algodMockServerPathRecorder.stop(resolve);
        });
    }
    if (algodMockServerResponder != undefined) {
        await new Promise((resolve, reject) => {
            algodMockServerResponder.stop(resolve);
        });
    }
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Allow-Headers": "X-Algo-API-Token, X-Indexer-API-Token, Content-Type",
    "Access-Control-Max-Age": 2592000
};

function setupMockServerForResponses(fileName, jsonDirectory, mockServer) {
    const resultString = fs.readFileSync(path.join(cucumberPath, 'features', 'resources', jsonDirectory, fileName)).toString();

    let headers = corsHeaders;  // example headers: { "content-type": "application/json" }
    let body;  // example body: JSON.stringify({ hello: "world" }
    if (fileName.endsWith("json")) {
        headers = Object.assign({ "content-type": "application/json" }, corsHeaders);
        body = resultString;
    }
    if (fileName.endsWith("base64")) {
        headers = Object.assign({ "content-type": "application/msgpack"}, corsHeaders);
        body = Buffer.from(resultString, 'base64');
    }
    let statusCode = 200;
    if (fileName.indexOf("Error") > -1) {
        statusCode = 500;
    }
    mockServer.on({
        method: 'OPTIONS',
        path: '*',
        reply: {
            status:  204,
            headers: corsHeaders
        }
    })
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
        method: 'OPTIONS',
        path: '*',
        reply: {
            headers: corsHeaders,
            status:  204,
        }
    });
    mockServer.on({
        method: 'GET',
        path: '*',
        reply: {
            headers: corsHeaders,
            status:  200,
        }
    });
    mockServer.on({
        method: 'POST',
        path: '*',
        reply: {
            headers: corsHeaders,
            status:  200,
        }
    });
}

function getMockServerRequestUrls(mockServer) {
    return mockServer
        .requests()
        .filter(req => req.method !== "OPTIONS") // ignore cors preflight requests from the browser
        .map(req => req.url);
}

function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

const steps = getSteps(stepOptions);

if (browser) {
    for (const type of Object.keys(steps)) {
        for (const name of Object.keys(steps[type])) {
            const originalFn = steps[type][name];

            // have to return a promise here instead of making rcpFn async because internally cucumber
            // uses bluebird.race to resolve this, and for some reason that leaks rejections when this
            // is async ¯\_(ツ)_/¯
            const rpcFn = function(...args) {

                const asyncRpcFn = async () => {
                    let rpcArgs = args;
                    if (isFunction(rpcArgs[rpcArgs.length - 1])) {
                        // get rid of callback cucumber provides
                        rpcArgs = args.slice(0, rpcArgs.length - 1);
                    }

                    const { error } = await driver.executeAsyncScript(async function runTestInBrowser(type, name, ...rest) {
                        const done = rest[rest.length - 1];
                        try {
                            const testArgs = rest.slice(0, rest.length - 1);
                            const test = getStep(type, name);
                            await test.apply(testWorld, testArgs);
                            done({ error: null });
                        } catch (err) {
                            console.error(err);
                            done({ error: err.toString() + '\n' + err.stack });
                        }
                    }, type, name, ...rpcArgs);

                    if (error) {
                        throw new Error(`Error from test '${type} ${name}': ${error}\n    ^ --- browser ---`);
                    }
                };

                return asyncRpcFn();
            };

            // Need to make it look like rcpFn takes the same number of args as originalFn for cucumber
            Object.defineProperty(rpcFn, 'length', {
                value: originalFn.length,
                writable: false
            });

            steps[type][name] = rpcFn.bind(null);
        }
    }
}

for (const name of Object.keys(steps.given)) {
    const fn = steps.given[name];
    if (name === "mock http responses in {string} loaded from {string}") {
        Given(name, function (fileName, jsonDirectory) {
            const body1 = setupMockServerForResponses(fileName, jsonDirectory, algodMockServerResponder);
            const body2 = setupMockServerForResponses(fileName, jsonDirectory, indexerMockServerResponder);
            return fn.call(this, body2 || body1);
        });
    } else if (name === "mock http responses in {string} loaded from {string} with status {int}.") {
        Given(name, function (fileName, jsonDirectory, status) {
            const body1 = setupMockServerForResponses(fileName, jsonDirectory, algodMockServerResponder);
            const body2 = setupMockServerForResponses(fileName, jsonDirectory, indexerMockServerResponder);
            return fn.call(this, body2 || body1, status);
        });
    } else if (name === "mock server recording request paths") {
        Given(name, function () {
            setupMockServerForPaths(algodMockServerPathRecorder);
            setupMockServerForPaths(indexerMockServerPathRecorder);
            return fn.call(this);
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
            const algodSeenRequests = getMockServerRequestUrls(algodMockServerPathRecorder);
            const indexerSeenRequests = getMockServerRequestUrls(indexerMockServerPathRecorder);
            return fn.call(this, algodSeenRequests, indexerSeenRequests, expectedRequestPath);
        });
    } else if (name === "we expect the path used to be {string}") {
        Then(name, function (expectedRequestPath) {
            // get all requests the mockservers have seen since reset
            const algodSeenRequests = getMockServerRequestUrls(algodMockServerPathRecorder);
            const indexerSeenRequests = getMockServerRequestUrls(indexerMockServerPathRecorder);
            return fn.call(this, algodSeenRequests, indexerSeenRequests, expectedRequestPath);
        });
    } else {
        Then(name, fn);
    }
}
