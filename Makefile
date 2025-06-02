UNIT_TAGS :=  "$(subst :, or ,$(shell awk '{print $2}' tests/cucumber/unit.tags | paste -s -d: -))"
INTEGRATIONS_TAGS := "$(subst :, or ,$(shell awk '{print $2}' tests/cucumber/integration.tags | paste -s -d: -))"

unit:
	node_modules/.bin/cucumber-js --tags $(UNIT_TAGS) tests/cucumber/features --require-module tsx/cjs --require tests/cucumber/steps/index.js

integration:
	node_modules/.bin/cucumber-js --tags $(INTEGRATIONS_TAGS) tests/cucumber/features --require-module tsx/cjs --require tests/cucumber/steps/index.js

# The following assumes that all cucumber steps are defined in `./tests/cucumber/steps/steps.js` and begin past line 135 of that file.
# Please note any deviations of the above before presuming correctness.
display-all-js-steps:
	tail -n +135 tests/cucumber/steps/steps.js | grep -v '^ *//' | awk "/(Given|Then|When)/,/',/" | grep -E "\'.+\'"  | sed "s/^[^']*'\([^']*\)'.*/\1/g"

harness:
	./test-harness.sh up

harness-down:
	./test-harness.sh down

# Force to platform=linux/amd64 because chrome isn't available on arm64
docker-build:
	docker build --platform=linux/amd64 -t js-sdk-testing -f tests/cucumber/docker/Dockerfile $(CURDIR) --build-arg TEST_BROWSER --build-arg CI=true

docker-run:
	docker ps -a
	docker run --platform=linux/amd64 -t --network host js-sdk-testing:latest

smoke-test-examples:
	cd examples && bash smoke_test.sh && cd -

docker-test: harness docker-build docker-run

prepare-browser-tests:
	npm ci
	npm run prepare-browser-tests

ci-test: harness prepare-browser-tests unit integration smoke-test-examples

format:
	npm run format
