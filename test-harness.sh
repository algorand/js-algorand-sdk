#!/usr/bin/env bash

START=$(date "+%s")

set -e

ENV_FILE=".test-env"
source $ENV_FILE

echo "test-harness.sh: AFTER sourcing from $ENV_FILE. Build TYPE=$TYPE"

rootdir=$(dirname "$0")
pushd "$rootdir"

## Reset test harness
if [ -d "$SDK_TESTING_HARNESS" ]; then
  pushd "$SDK_TESTING_HARNESS"
  ./scripts/down.sh
  popd
  rm -rf "$SDK_TESTING_HARNESS"
else
  echo "test-harness.sh: directory $SDK_TESTING_HARNESS does not exist - NOOP"
fi

git clone --single-branch --branch "$SDK_TESTING_BRANCH" "$SDK_TESTING_URL" "$SDK_TESTING_HARNESS"

## OVERWRITE incoming .env with .test-env
cp "$ENV_FILE" "$SDK_TESTING_HARNESS"/.env

## Copy feature files into the project resources
rm -rf tests/cucumber/features
mkdir -p tests/cucumber/features
cp -r "$SDK_TESTING_HARNESS"/features/* tests/cucumber/features
echo "test-harness.sh: seconds it took to get to end of cloning + copying: " + $(($(date "+%s") - $START))

if [ $TEST_BROWSER == "chrome" ]; then
  # use latest version of chromedriver for compatability with the current Chrome version
  npm install chromedriver@latest
  # print the version installed
  npm ls chromedriver
fi

## Start test harness environment
pushd "$SDK_TESTING_HARNESS"
./scripts/up.sh
popd
echo "test-harness.sh: seconds it took to finish testing sdk's up.sh: " + $(($(date "+%s") - $START))
echo ""
echo "--------------------------------------------------------------------------------"
echo "|"
echo "|    To run sandbox commands, cd into $SDK_TESTING_HARNESS/$LOCAL_SANDBOX_DIR"
echo "|"
echo "--------------------------------------------------------------------------------"
