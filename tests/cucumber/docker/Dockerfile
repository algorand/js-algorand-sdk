FROM ubuntu:bionic

# install wget, gnupg2, make
RUN apt-get update -qqy \
  && apt-get -qqy install wget gnupg2 make

# install chrome, firefox
# based on https://github.com/SeleniumHQ/docker-selenium/blob/trunk/NodeChrome/Dockerfile
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy --no-install-recommends install google-chrome-stable

ARG FIREFOX_VERSION="99.0.1"
RUN apt-get update -qqy \
  && apt-get -qqy --no-install-recommends install firefox \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* \
  && wget --no-verbose -O /tmp/firefox.tar.bz2 https://download-installer.cdn.mozilla.net/pub/firefox/releases/$FIREFOX_VERSION/linux-x86_64/en-US/firefox-$FIREFOX_VERSION.tar.bz2 \
  && apt-get -y purge firefox \
  && rm -rf /opt/firefox \
  && tar -C /opt -xjf /tmp/firefox.tar.bz2 \
  && rm /tmp/firefox.tar.bz2 \
  && mv /opt/firefox /opt/firefox-$FIREFOX_VERSION \
  && ln -fs /opt/firefox-$FIREFOX_VERSION/firefox /usr/bin/firefox

# install node
RUN wget -q -O - https://deb.nodesource.com/setup_12.x | bash \
  && apt-get -qqy --no-install-recommends install nodejs \
  && echo "node version: $(node --version)" \
  && echo "npm version: $(npm --version)"

# Copy SDK code into the container
RUN mkdir -p $HOME/js-algorand-sdk
COPY . $HOME/js-algorand-sdk
WORKDIR $HOME/js-algorand-sdk

ARG TEST_BROWSER
ENV TEST_BROWSER=$TEST_BROWSER

ARG CI
ENV CI=$CI

RUN npm ci
RUN npm run prepare-browser-tests

# Run integration tests
CMD ["/bin/bash", "-c", "make unit && make integration"]
