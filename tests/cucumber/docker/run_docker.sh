#!/usr/bin/env bash

set -e

rm -rf temp
rm -rf tests/cucumber/features
git clone --single-branch --branch templates https://github.com/algorand/algorand-sdk-testing.git temp

cp tests/cucumber/docker/sdk.py temp/docker
mv temp/features tests/cucumber/features

docker build -t sdk-testing -f tests/cucumber/docker/Dockerfile "$(pwd)"

docker run -it \
     -v "$(pwd)":/opt/js-algorand-sdk \
     sdk-testing:latest 
