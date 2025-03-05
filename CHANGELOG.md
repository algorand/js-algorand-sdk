# Changelog

All notable changes to this project will be documented in this file.

## v3.3.2 - 2025-03-05

<!-- Release notes generated using configuration in .github/release.yml at sdk-release-updates-testing -->
### What's Changed

Support for /v2/blockheaders compatible with [Indexer 3.7.x](https://github.com/algorand/indexer/releases/tag/v3.7.2).

Support for /v2/block/{round}?header-only=true in upcoming go-algorand 4.0.2 release.

> ⚠️ **WARNING:** This release is on the major version line with breaking changes from the v2.X.X series. For help migrating from v2 releases, see the file `v2_TO_v3_MIGRATION_GUIDE.md`.

#### V2 End of Life

V2 is now in maintenance mode. No new features will be added to v2 going forward, and only security fixes or critical errors will be addressed. At the end of March 2025, no further updates will be made to the v2 package.

#### Enhancements

* Blockheaders: Basic BlockHeaders API support. by @gmalouf in https://github.com/algorand/js-algorand-sdk/pull/926
* Dependencies: Bump webpack from 5.89.0 to 5.97.1 by @dependabot in https://github.com/algorand/js-algorand-sdk/pull/930
* feat: add Address as an ABIValue and handle encoding an Address by @joe-p in https://github.com/algorand/js-algorand-sdk/pull/911
* API: Support for header-only flag on /v2/block algod endpoint. by @github-actions in https://github.com/algorand/js-algorand-sdk/pull/939

**Full Changelog**: https://github.com/gmalouf/js-algorand-sdk/compare/v3.3.1...v3.3.2
