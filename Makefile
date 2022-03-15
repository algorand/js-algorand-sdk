unit:
	#node_modules/.bin/cucumber-js --tags "@unit.offline or @unit.algod or @unit.indexer or @unit.rekey or @unit.tealsign or @unit.dryrun or @unit.applications or @unit.responses or @unit.transactions or @unit.transactions.keyreg or @unit.transactions.payment or @unit.responses.231 or @unit.feetest or @unit.indexer.logs or @unit.abijson or @unit.atomic_transaction_composer or @unit.dryrun.trace.application" tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js
	node_modules/.bin/cucumber-js --tags "@unit.dryrun.trace.application" tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js
integration:
	node_modules/.bin/cucumber-js --tags "@algod or @assets or @auction or @kmd or @send or @indexer or @rekey or @send.keyregtxn or @dryrun or @compile or @applications or @indexer.applications or @applications.verified or @indexer.231 or @abi or @c2c" tests/cucumber/features --require-module ts-node/register --require tests/cucumber/steps/index.js

docker-test:
	./tests/cucumber/docker/run_docker.sh

format:
	npm run format
