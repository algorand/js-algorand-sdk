FROM node:14.1.0-stretch

# Copy SDK code into the container
RUN mkdir -p $HOME/js-algorand-sdk
COPY . $HOME/js-algorand-sdk
WORKDIR $HOME/js-algorand-sdk

RUN npm ci

# Run integration tests
CMD ["/bin/bash", "-c", "make unit && make integration"]
