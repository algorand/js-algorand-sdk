UNIT_TAGS :=  "$(subst :, or ,$(shell awk '{print $2}' tests/cucumber/unit.tags | paste -s -d: -))"
INTEGRATIONS_TAGS := "$(subst :, or ,$(shell awk '{print $2}' tests/cucumber/integration.tags | paste -s -d: -))"

unit:
	node_modules/.bin/cucumber-js --tags $(UNIT_TAGS) tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js
	
integration:
	node_modules/.bin/cucumber-js --tags $(INTEGRATIONS_TAGS) tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js

harness:
	./test-harness.sh

docker-build:
	docker build -t js-sdk-testing -f tests/cucumber/docker/Dockerfile $(CURDIR) --build-arg TEST_BROWSER --build-arg CI=true

docker-run:
	docker ps -a
	docker run -it --network host js-sdk-testing:latest

docker-test: harness docker-build docker-run

format:
	npm run format
