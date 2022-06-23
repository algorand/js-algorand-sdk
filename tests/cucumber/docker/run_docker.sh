#!/usr/bin/env bash

set -e

# cleanup last test run
rm -rf test-harness
rm -rf tests/cucumber/features

# clone test harness
git clone --single-branch --branch box-reference https://github.com/algorand/algorand-sdk-testing.git test-harness

# move feature files and example files to destination
mv test-harness/features tests/cucumber/features

if [ $TEST_BROWSER == "chrome" ]; then
  # use latest version of chromedriver for compatability with the current Chrome version
  npm install chromedriver@latest
  # print the version installed
  npm ls chromedriver
fi

# build test environment
docker build -t js-sdk-testing -f tests/cucumber/docker/Dockerfile "$(pwd)" --build-arg TEST_BROWSER --build-arg CI=true

# Start test harness environment
./test-harness/scripts/up.sh

docker run -it \
     --network host \
     js-sdk-testing:latest
