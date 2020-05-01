#!/usr/bin/env bash

set -e

rm -rf test-harness
rm -rf tests/cucumber/features
git clone --single-branch --branch evan/minortweaks https://github.com/algorand/algorand-sdk-testing.git test-harness

mv test-harness/features tests/cucumber/features

docker build -t js-sdk-testing -f tests/cucumber/docker/Dockerfile "$(pwd)"

docker run -it \
     --network host \
     js-sdk-testing:latest
