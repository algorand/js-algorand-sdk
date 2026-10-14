/* eslint-disable no-console */
// Update the browser bundle snippets in README.md with a new version and the SRI
// hash of dist/browser/algosdk.min.js. Run by semantic-release (@semantic-release/exec)
// in the prepare step, after the tested dist/ has been unzipped.
//
// Usage: node scripts/ci/update-readme-sri.js <version>
//
// Prerelease versions (e.g. 3.9.0-beta.1) leave README.md unchanged, so the README
// always documents the latest stable release.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const version = process.argv[2];
if (!version || !/^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`Invalid version: "${version}"`);
  process.exit(1);
}

if (version.includes('-')) {
  console.log(`Prerelease ${version}: README.md is not updated`);
  process.exit(0);
}

const root = path.join(__dirname, '..', '..');
const bundlePath = path.join(root, 'dist', 'browser', 'algosdk.min.js');
const readmePath = path.join(root, 'README.md');

const hash = crypto
  .createHash('sha384')
  .update(fs.readFileSync(bundlePath))
  .digest('base64');

const versionPattern = /algosdk@v[0-9]+\.[0-9]+\.[-a-z.0-9]+/g;
const integrityPattern = /integrity="sha384-.*?"/g;

const readme = fs.readFileSync(readmePath, 'utf8');
const versionMatches = (readme.match(versionPattern) || []).length;
const integrityMatches = (readme.match(integrityPattern) || []).length;
if (versionMatches === 0 || integrityMatches === 0) {
  console.error(
    `README.md has no browser snippet to update (versions: ${versionMatches}, integrity: ${integrityMatches})`
  );
  process.exit(1);
}

const updated = readme
  .replace(versionPattern, `algosdk@v${version}`)
  .replace(integrityPattern, `integrity="sha384-${hash}"`);
fs.writeFileSync(readmePath, updated);

console.log(
  `README.md updated to v${version} (sha384-${hash}), ${versionMatches} version and ${integrityMatches} integrity references`
);
