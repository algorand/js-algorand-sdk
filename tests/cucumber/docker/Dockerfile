FROM node:14.1.0-stretch

# Copy SDK code into the container
RUN mkdir -p $HOME/js-algorand-sdk
COPY . $HOME/js-algorand-sdk
WORKDIR $HOME/js-algorand-sdk

ARG TEST_BROWSER
ENV TEST_BROWSER=$TEST_BROWSER

ENV SELENIUM_SERVER_URL=http://selenium:4444/wd/hub

RUN npm ci
RUN npm run prepare-browser-tests

# Run integration tests
CMD ["/bin/bash", "-c", "make unit && make integration"]
