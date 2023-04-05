UNIT_TAGS :=  "$(subst :, or ,$(shell awk '{print $2}' tests/cucumber/unit.tags | paste -s -d: -))"
INTEGRATIONS_TAGS := "$(subst :, or ,$(shell awk '{print $2}' tests/cucumber/integration.tags | paste -s -d: -))"

unit:
	node_modules/.bin/cucumber-js --tags $(UNIT_TAGS) tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js
	
integration:
	node_modules/.bin/cucumber-js --tags $(INTEGRATIONS_TAGS) tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js

# The following assumes that all cucumber steps are defined in `./tests/cucumber/steps/steps.js` and begin past line 135 of that file.
# Please note any deviations of the above before presuming correctness.
display-all-js-steps:
	tail -n +135 tests/cucumber/steps/steps.js | grep -v '^ *//' | awk "/(Given|Then|When)/,/',/" | grep -E "\'.+\'"  | sed "s/^[^']*'\([^']*\)'.*/\1/g"

harness:
	./test-harness.sh up

harness-down:
	./test-harness.sh down

docker-build:
	docker build -t js-sdk-testing -f tests/cucumber/docker/Dockerfile $(CURDIR) --build-arg TEST_BROWSER --build-arg CI=true

docker-run:
	docker ps -a
	docker run -it --network host js-sdk-testing:latest

smoke-test-examples:
	cd examples && bash smoke_test.sh && cd -

docker-test: harness docker-build docker-run

format:
	npm run format
