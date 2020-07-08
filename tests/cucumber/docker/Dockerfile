FROM node:14.1.0-stretch

# Copy SDK code into the container
RUN mkdir -p $HOME/js-algorand-sdk
COPY . $HOME/js-algorand-sdk
WORKDIR $HOME/js-algorand-sdk

RUN npm install

ENV UNITTESTDIR=$HOME/js-algorand-sdk/tests/cucumber/features/unit

# Run integration tests
CMD ["/bin/bash", "-c", "make unit && make integration"]
