#!/usr/bin/env bash
set -euo pipefail

# test-harness.sh setup/start cucumber test environment.
#
# Configuration is managed with environment variables, the ones you
# are most likely to reconfigured are stored in '.test-env'.
#
# Variables:
#   SDK_TESTING_URL     - URL to algorand-sdk-testing, useful for forks.
#   SDK_TESTING_BRANCH  - branch to checkout, useful for new tests.
#   SDK_TESTING_HARNESS - in case you want to change the clone directory?
#   VERBOSE_HARNESS     - more output while the script runs.
#   INSTALL_ONLY        - installs feature files only, useful for unit tests.
#
#   WARNING: If set to 1, new features will be LOST when downloading the test harness.
#   REGARDLESS: modified features are ALWAYS overwritten.
#   REMOVE_LOCAL_FEATURES - cleanup cucumber feature files?
#
#   WARNING: Be careful when turning on the next variable.
#   In that case you'll need to provide all variables expected by `algorand-sdk-testing`'s `.env`
#   OVERWRITE_TESTING_ENVIRONMENT=0

SHUTDOWN=0
if [ $# -ne 0 ]; then
  if [ $# -ne 1 ]; then
    echo "this script accepts a single argument, which must be 'up' or 'down'."
    exit 1
  fi

  case $1 in
    'up')
      ;; # default.
    'down')
      SHUTDOWN=1
      ;;
    *)
      echo "unknown parameter '$1'."
      echo "this script accepts a single argument, which must be 'up' or 'down'."
      exit 1
      ;;
  esac
fi

START=$(date "+%s")

THIS=$(basename "$0")
ENV_FILE=".test-env"
TEST_DIR="tests/cucumber"

set -a
source "$ENV_FILE"
set +a

rootdir=$(dirname "$0")
pushd "$rootdir"

echo "$THIS: VERBOSE_HARNESS=$VERBOSE_HARNESS"

## Reset test harness
if [ -d "$SDK_TESTING_HARNESS" ]; then
  pushd "$SDK_TESTING_HARNESS"
  ./scripts/down.sh
  popd
  rm -rf "$SDK_TESTING_HARNESS"
  if [[ $SHUTDOWN == 1 ]]; then
    echo "network shutdown complete."
    exit 0
  fi
else
  echo "$THIS: directory $SDK_TESTING_HARNESS does not exist - NOOP"
fi

if [[ $SHUTDOWN == 1 ]]; then
  echo "unable to shutdown network."
  exit 1
fi

git clone --depth 1 --single-branch --branch "$SDK_TESTING_BRANCH" "$SDK_TESTING_URL" "$SDK_TESTING_HARNESS"


echo "$THIS: OVERWRITE_TESTING_ENVIRONMENT=$OVERWRITE_TESTING_ENVIRONMENT"
if [[ $OVERWRITE_TESTING_ENVIRONMENT == 1 ]]; then
  echo "$THIS: OVERWRITE downloaded $SDK_TESTING_HARNESS/.env with $ENV_FILE:"
  cp "$ENV_FILE" "$SDK_TESTING_HARNESS"/.env
fi

echo "$THIS: REMOVE_LOCAL_FEATURES=$REMOVE_LOCAL_FEATURES"
## Copy feature files into the project resources
if [[ $REMOVE_LOCAL_FEATURES == 1 ]]; then
  echo "$THIS: OVERWRITE wipes clean $TEST_DIR/features"
  if [[ $VERBOSE_HARNESS == 1 ]]; then
    ( tree $TEST_DIR/features && echo "$THIS: see the previous for files deleted" ) || true
  fi
  rm -rf $TEST_DIR/features
fi
mkdir -p $TEST_DIR/features
cp -r "$SDK_TESTING_HARNESS"/features/* $TEST_DIR/features
if [[ $VERBOSE_HARNESS == 1 ]]; then
  ( tree $TEST_DIR/features && echo "$THIS: see the previous for files copied over" ) || true
fi
echo "$THIS: seconds it took to get to end of cloning and copying: $(($(date "+%s") - START))s"

if [[ $INSTALL_ONLY == 1 ]]; then
  echo "$THIS: configured to install feature files only. Not starting test harness environment."
  exit 0
fi

## Start test harness environment
pushd "$SDK_TESTING_HARNESS"

[[ "$VERBOSE_HARNESS" = 1 ]] && V_FLAG="-v" || V_FLAG=""
echo "$THIS: standing up harnness with command [./up.sh $V_FLAG]"
./scripts/up.sh "$V_FLAG"

popd
echo "$THIS: seconds it took to finish testing sdk's up.sh: $(($(date "+%s") - START))s"
echo ""
echo "--------------------------------------------------------------------------------"
echo "|"
echo "|    To run sandbox commands, cd into $SDK_TESTING_HARNESS/.sandbox             "
echo "|"
echo "--------------------------------------------------------------------------------"
