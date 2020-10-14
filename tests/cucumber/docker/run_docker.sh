#!/usr/bin/env bash

set -e

# cleanup last test run
rm -rf test-harness
rm -rf tests/cucumber/features

# clone test harness
git clone --single-branch --branch master https://github.com/algorand/algorand-sdk-testing.git test-harness

# move feature files and example files to destination
mv test-harness/features tests/cucumber/features

# Start test harness environment
./test-harness/scripts/up.sh

make unit && make integration
