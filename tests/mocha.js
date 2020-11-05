const Mocha = require('mocha');
const Browserify = require('browserify');
const fs = require('fs');
const path = require('path');

const browser = process.env.TEST_BROWSER;

async function testRunner() {
    console.log('TEST_BROWSER is', browser);

    const testFiles = fs.readdirSync(__dirname)
        .filter((file) => file !== 'mocha.js' && file.endsWith('.js'))
        .map((file) => path.join(__dirname, file));

    if (browser) {
        const browserEntry = path.join(__dirname, 'browser', 'index.html');
        const bundleLocation = path.join(__dirname, 'browser', 'bundle.js');
        const browserify = Browserify();

        testFiles.forEach((file) => browserify.add(file));

        await new Promise((resolve, reject) => {
            browserify.bundle((err, bundle) => {
                if (err) {
                    return reject(err);
                }

                fs.writeFile(bundleLocation, bundle, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        console.log('Testing in browser');

        if (browser === 'chrome') {
            require('chromedriver');
        } else if (browser === 'firefox') {
            require('geckodriver');
        }
        const webdriver = require('selenium-webdriver');
        const chrome = require('selenium-webdriver/chrome');
        const firefox = require('selenium-webdriver/firefox');
    
        const chromeOptions = new chrome.Options();
        const firefoxOptions = new firefox.Options();
    
        if (process.env.CI) {
            chromeOptions.addArguments('--no-sandbox','--headless','--disable-gpu');
            firefoxOptions.addArguments('-headless');
        }
    
        const driver = await new webdriver.Builder()
            .setChromeOptions(chromeOptions)
            .setFirefoxOptions(firefoxOptions)
            .forBrowser(browser)
            .build();
        
        await driver.get('file://' + browserEntry);

        const title = await driver.getTitle();

        if (title !== "Algosdk Mocha Browser Testing") {
            throw new Error('Incorrect title: ' + title);
        }

        const { passed, failures } = await driver.executeAsyncScript(async (done) => {
            const failures = [];
            let passed = 0;

            const runner = mocha.run(() => {
                done({ passed, failures });
            });

            runner.on('pass', () => {
                passed += 1;
            });

            runner.on('fail', (test, err) => {
                failures.push({ test: test.fullTitle(), error: err.toString() + '\n' + err.stack });
            });
        });

        console.log(`Failed ${failures.length} of ${failures.length + passed} tests`);

        for (const { test, error } of failures) {
            console.log(`Test: ${test}\n\t${error}\n`);
        }

        await driver.quit();

        process.exitCode = failures.length > 0 ? 1 : 0;
    } else {
        console.log('Testing in Node');

        const mocha = new Mocha();
        fs.readdirSync(__dirname)
            .filter((file) => file !== 'mocha.js' && file.endsWith('.js'))
            .forEach((file) => mocha.addFile(path.join(__dirname, file)));

        mocha.run((failures) => {
            process.exitCode = failures ? 1 : 0;
        });
    }
}

testRunner()
    .catch(err => {
        console.error(err);
        process.exitCode = 1;
    });
