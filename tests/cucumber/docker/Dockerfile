FROM ubuntu:focal

# install wget, gnupg2, make
RUN apt-get update -qqy \
  && apt-get -qqy install wget gnupg2 make

# install chrome, firefox
# based on https://github.com/SeleniumHQ/docker-selenium/blob/trunk/NodeChrome/Dockerfile
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy --no-install-recommends install google-chrome-stable firefox

# install node
RUN wget -q -O - https://deb.nodesource.com/setup_18.x | bash \
  && apt-get -qqy --no-install-recommends install nodejs \
  && echo "node version: $(node --version)" \
  && echo "npm version: $(npm --version)"

# Copy SDK code into the container
RUN mkdir -p /home/js-algorand-sdk
COPY . /home/js-algorand-sdk
WORKDIR /home/js-algorand-sdk

ARG TEST_BROWSER
ENV TEST_BROWSER=$TEST_BROWSER

ARG CI
ENV CI=$CI

# Temporary hack to install msgpack-javascript from a branch
RUN cd .. \
  && git clone https://github.com/algorand/msgpack-javascript.git \
  && cd msgpack-javascript \
  && git checkout raw-string-encoding \
  && npm i \
  && npm run prepare \
  && npm pack
RUN npm ci
RUN npm run prepare-browser-tests

# Run integration tests
CMD ["/bin/bash", "-c", "make unit && make integration && make smoke-test-examples"]
