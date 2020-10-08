FROM node:14.1.0-stretch

# Copy SDK code into the container
RUN mkdir -p $HOME/js-algorand-sdk
COPY . $HOME/js-algorand-sdk
WORKDIR $HOME/js-algorand-sdk

RUN npm ci
RUN npm run test:browser:prepare

ARG TEST_BROWSER
ENV TEST_BROWSER=${TEST_BROWSER}

# Run integration tests
CMD ["/bin/bash", "-c", "make unit && make integration"]
