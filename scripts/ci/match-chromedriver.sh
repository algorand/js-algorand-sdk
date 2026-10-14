#!/usr/bin/env bash
# Replace the pinned chromedriver dev dependency with the version that matches
# the Chrome installed on the CI runner. Used by the chrome leg of the CI matrix.
set -euo pipefail

# Get the installed Chrome major version
CHROME_VERSION=$(google-chrome --version | grep -oE '[0-9]+' | head -1)
echo "Detected Chrome version: $CHROME_VERSION"

# Remove the fixed version chromedriver and install one that matches Chrome
npm uninstall chromedriver
npm install "chromedriver@$CHROME_VERSION" || npm install chromedriver@latest

# Verify the installation
echo "Installed ChromeDriver version:"
npx chromedriver --version
