#!/usr/bin/env bash

set -e

# cleanup last test run
rm -rf test-harness
rm -rf tests/cucumber/features

# clone test harness
git clone --single-branch --branch master https://github.com/algorand/algorand-sdk-testing.git test-harness

# move feature files and example files to destination
mv test-harness/features tests/cucumber/features

# build test environment
docker build -t js-sdk-testing -f tests/cucumber/docker/Dockerfile "$(pwd)"

# Start test harness environment
./test-harness/scripts/up.sh

docker run -it \
     --network host \
     js-sdk-testing:latest
