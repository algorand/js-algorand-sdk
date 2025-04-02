FROM ubuntu:jammy

# install wget, gnupg2, make
RUN apt-get -qqy update \
  && DEBIAN_FRONTEND=noninteractive apt-get -qqy install wget gnupg2 make

# install chrome, firefox
# based on https://github.com/SeleniumHQ/docker-selenium/blob/trunk/NodeChrome/Dockerfile
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor | tee /etc/apt/trusted.gpg.d/google.gpg >/dev/null && \
    echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list && \
    wget -q https://packages.mozilla.org/apt/repo-signing-key.gpg -O- | tee /etc/apt/keyrings/packages.mozilla.org.asc > /dev/null && \
    echo "deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt mozilla main" | tee -a /etc/apt/sources.list.d/mozilla.list > /dev/null && \
    DEBIAN_FRONTEND=noninteractive apt-get -qqy update && \
    DEBIAN_FRONTEND=noninteractive apt-get -qqy install firefox google-chrome-stable

# install node
RUN wget -q -O - https://deb.nodesource.com/setup_22.x | bash \
  && DEBIAN_FRONTEND=noninteractive apt-get -qqy --no-install-recommends install nodejs \
  && echo "node version: $(node --version)" \
  && echo "npm version: $(npm --version)"

# Copy SDK code into the container
RUN mkdir -p /app/js-algorand-sdk
COPY . /app/js-algorand-sdk
WORKDIR /app/js-algorand-sdk

ARG TEST_BROWSER
ENV TEST_BROWSER=$TEST_BROWSER

ARG CI
ENV CI=$CI

RUN npm ci
RUN npm run prepare-browser-tests

# Run integration tests
CMD ["/bin/bash", "-c", "make unit && make integration && make smoke-test-examples"]
