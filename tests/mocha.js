/* eslint-env node, mocha */
/* eslint-disable no-console */
const Mocha = require('mocha');
const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const express = require('express');

const webpackConfig = require('../webpack.config');

const browser = process.env.TEST_BROWSER;

const resourceServerPort = 8080;
let resourceServer;

const resourcePath = path.dirname(__dirname);

async function startResourceServer() {
  const app = express();
  app.use(express.static(resourcePath));
  await new Promise((resolve) => {
    resourceServer = app.listen(resourceServerPort, undefined, resolve);
  });
  console.log(
    `Resource server started on port ${resourceServerPort} serving ${resourcePath}`
  );
}

function stopResourceServer() {
  if (resourceServer) {
    resourceServer.close();
  }
}

async function testRunner() {
  console.log('TEST_BROWSER is', browser);

  const testFiles = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file !== 'mocha.js' && (file.endsWith('.js') || file.endsWith('.ts'))
    )
    .map((file) => path.join(__dirname, file));

  await startResourceServer();

  if (browser) {
    const bundleLocation = path.join(__dirname, 'browser', 'bundle.js');

    await new Promise((resolve, reject) => {
      // Change entry and output for webpack config
      const webpackTestConfig = Object.assign(webpackConfig);

      webpackTestConfig.mode = 'development';
      webpackTestConfig.entry = testFiles;
      webpackTestConfig.output = {
        filename: path.basename(bundleLocation),
        path: path.dirname(bundleLocation),
      };
      webpackTestConfig.optimization = {
        minimize: false,
      };

      webpack(webpackTestConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
          return reject(err || stats.toJson());
        }
        return resolve();
      });
    });

    console.log('Testing in browser');

    /* eslint-disable global-require */
    if (browser === 'chrome') {
      require('chromedriver');
    } else if (browser === 'firefox') {
      require('geckodriver');
    }
    /* eslint-disable global-require */

    const webdriver = require('selenium-webdriver');
    const chrome = require('selenium-webdriver/chrome');
    const firefox = require('selenium-webdriver/firefox');

    let chromeOptions = new chrome.Options();
    let firefoxOptions = new firefox.Options();

    if (process.env.CI) {
      chromeOptions = chromeOptions.addArguments(
        'no-sandbox',
        'headless',
        'disable-gpu'
      );
      firefoxOptions = firefoxOptions.headless();
    }

    const driver = await new webdriver.Builder()
      .setChromeOptions(chromeOptions)
      .setFirefoxOptions(firefoxOptions)
      .forBrowser(browser)
      .build();

    await driver.get(
      `http://localhost:${resourceServerPort}/tests/browser/index.html`
    );

    const title = await driver.getTitle();

    if (title !== 'Algosdk Mocha Browser Testing') {
      throw new Error(`Incorrect title: ${title}`);
    }

    const { passed, failures } = await driver.executeAsyncScript(
      async (done) => {
        const failuresSeen = [];
        let testsPassed = 0;

        const runner = mocha.run(() => {
          done({
            passed: testsPassed,
            failures: failuresSeen,
          });
        });

        runner.on('pass', () => {
          testsPassed += 1;
        });

        runner.on('fail', (test, err) => {
          failuresSeen.push({
            test: test.fullTitle(),
            error: `${err.toString()}\n${err.stack}`,
          });
        });
      }
    );

    console.log(
      `Failed ${failures.length} of ${failures.length + passed} tests`
    );

    for (const { test, error } of failures) {
      console.log(`Test: ${test}\n\t${error}\n`);
    }

    await driver.quit();

    process.exitCode = failures.length > 0 ? 1 : 0;
  } else {
    console.log('Testing in Node');

    const mocha = new Mocha({
      timeout: process.env.MOCHA_TIMEOUT,
    });
    testFiles.forEach((file) => mocha.addFile(file));

    await new Promise((resolve) => {
      mocha.run((failures) => {
        process.exitCode = failures ? 1 : 0;
        resolve();
      });
    });
  }

  stopResourceServer();
}

testRunner().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
