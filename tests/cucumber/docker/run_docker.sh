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
docker build -t js-sdk-testing -f tests/cucumber/docker/Dockerfile "$(pwd)" --build-arg TEST_BROWSER --build-arg CI=true

# Start test harness environment
./test-harness/scripts/up.sh

if [ "$TEST_BROWSER" == "chrome" ]; then
  npx chromedriver --port=4444 &
  # docker run -d --name selenium --network host --shm-size 2g selenium/standalone-chrome:86.0
elif [ "$TEST_BROWSER" == "firefox" ]; then
  npx geckodriver --port 4444 &
  # docker run -d --name selenium --network host --shm-size 2g selenium/standalone-firefox:81.0
elif [ -n "$TEST_BROWSER" ]; then
  echo "Unknown value for TEST_BROWSER"
  exit 1
fi

docker run -it \
     --network host \
     js-sdk-testing:latest
