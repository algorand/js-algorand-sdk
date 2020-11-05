unit:
	node_modules/.bin/cucumber-js --tags "@unit.offline or @unit.algod or @unit.indexer or @unit.rekey or @unit.tealsign or @unit.dryrun or @unit.applications or @unit.responses or @unit.transactions" tests/cucumber/features --require tests/cucumber/steps/index.js
integration:
	node_modules/.bin/cucumber-js --tags "@algod or @assets or @auction or @kmd or @send or @template or @indexer or @rekey or @dryrun or @compile or @applications or @indexer.applications or @applications.verified" tests/cucumber/features --require tests/cucumber/steps/index.js

docker-test:
	./tests/cucumber/docker/run_docker.sh
