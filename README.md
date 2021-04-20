# js-algorand-sdk

[![Build Status](https://travis-ci.com/algorand/js-algorand-sdk.svg?branch=master)](https://travis-ci.com/algorand/js-algorand-sdk) [![npm version](https://badge.fury.io/js/algosdk.svg)](https://badge.fury.io/js/algosdk)

AlgoSDK is a javascript library for communicating with the Algorand network for modern browsers and node.js.

## Installation

### node.js

```
$ npm install algosdk
```

### Browser

Starting with version 1.9.0, a minified browser bundle can be obtained from npm CDNs such as [unpkg](https://unpkg.com/) or [jsDelivr](https://www.jsdelivr.com/). These bundles can be included directly in your HTML like so:

```html
<script src="https://unpkg.com/algosdk@latest" /> <!-- or https://cdn.jsdelivr.net/npm/algosdk@latest -->
```

> In production, it's recommended to pin a specific version instead of using `latest`.

If you would instead prefer to host the package yourself, a minified browser bundle can be found in the `dist/browser/` folder of the published npm package starting with version 1.9.0. Prior versions do not include the browser bundle in the npm package. In order to access those, look in the `dist` folder on the version's GitHub tag, e.g. https://github.com/algorand/js-algorand-sdk/tree/v1.8.1/dist.

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

**As portions of the codebase are written in TypeScript, example files cannot be run directly using `node`**. Please refer to the instructions described in the [examples/README.md](examples/README.md) file for more information regarding running the examples.

## SDK Development

### Building

To build a new version of the library, run:

```bash
npm run build
```

### Generating Documentation

To generate the documentation website, run:

```bash
npm run docs
```

The static website will be located in the `docs/` directory.

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
