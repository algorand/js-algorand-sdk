unit:
	node_modules/.bin/cucumber-js --tags "@unit.offline or @unit.algod or @unit.indexer or @unit.rekey or @unit.tealsign or @unit.dryrun or @unit.applications or @unit.responses or @unit.transactions or @unit.transactions.keyreg or @unit.transactions.payment or @unit.responses.231 or @unit.feetest or @unit.indexer.logs or @unit.abijson or @unit.abijson.byname or @unit.atomic_transaction_composer or @unit.responses.unlimited_assets or @unit.indexer.ledger_refactoring or @unit.algod.ledger_refactoring or @unit.dryrun.trace.application or @unit.sourcemap" tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js
	
integration:
	node_modules/.bin/cucumber-js --tags "@algod or @assets or @auction or @kmd or @send or @indexer or @rekey_v1 or @send.keyregtxn or @dryrun or @compile or @applications or @indexer.applications or @applications.verified or @indexer.231 or @abi or @c2c or @compile.sourcemap" tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js

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
