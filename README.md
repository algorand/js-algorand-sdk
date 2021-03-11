# js-algorand-sdk

[![Build Status](https://travis-ci.com/algorand/js-algorand-sdk.svg?branch=master)](https://travis-ci.com/algorand/js-algorand-sdk) [![npm version](https://badge.fury.io/js/algosdk.svg)](https://badge.fury.io/js/algosdk)

AlgoSDK is a javascript library for communicating with the Algorand network for modern browsers and node.js.

## Installation

### node.js

```
$ npm install algosdk
```

### Browser

The `dist` directory contains a minified version of the library - `algosdk.min.js`.
Include this line in your HTML.

```html
<script src="algosdk.min.js" />
```

## Quick Start

```javascript
const token = 'Your algod API token';
const server = 'http://127.0.0.1';
const port = 8080;
const client = new algosdk.Algod(token, server, port);

(async () => {
  console.log(await client.status());
})().catch((e) => {
  console.log(e);
});
```

## Documentation

For detailed information about the different API calls in `client`, visit https://developer.algorand.org

## Examples

Running examples requires access to a running node. Follow the instructions in Algorand's [developer resources](https://developer.algorand.org/docs/run-a-node/setup/install/) to install a node on your computer.

Please refer to the instructions described in the [examples/README.md](examples/README.md) file for more information regarding running the examples.

## SDK Development

### Building

To build a new version of the library for browsers, run:

```bash
npm run build
```

### Testing

We have two test suites: mocha tests in this repo, and the Algorand SDK test suite from https://github.com/algorand/algorand-sdk-testing.

#### Node

To run the mocha tests in Node, run:

```bash
npm test
```

To run the SDK test suite in Node, run:

```bash
make docker-test
```

#### Browsers

The test suites can also run in browsers. To do so, set the environment variable `TEST_BROWSER` to
one of our supported browsers. Currently we support testing in `chrome` and `firefox`. When
`TEST_BROWSER` is set, the mocha and SDK test suites will run in that browser.

For example, to run mocha tests in Chrome:

```bash
TEST_BROWSER=chrome npm test
```

And to run SDK tests in Firefox:

```bash
TEST_BROWSER=firefox make docker-test
```

### Code Style

This project enforces a modified version of the [Airbnb code style](https://github.com/airbnb/javascript).

We've setup linters and formatters to help catch errors and improve the development experience:

- [Prettier](https://prettier.io/) – ensures that code is formatted in a readable way.
- [ESLint](https://eslint.org/) — checks code for antipatterns as well as formatting.

> If using the Visual Studio Code editor with the [recommended extensions](.vscode/extensions.json), ESLint errors should be highlighted in red and the Prettier extension should format code on every save.

#### Precommit Hook

The linters and formatters listed above should run automatically on each commit to catch errors early and save CI running time.

## License

js-algorand-sdk is licensed under a MIT license. See the [LICENSE](https://github.com/algorand/js-algorand-sdk/blob/master/LICENSE) file for details.
