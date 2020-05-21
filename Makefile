unit:
	node_modules/.bin/cucumber-js --tags "@unit.offline or @unit.algod or @unit.indexer" tests/cucumber/features --require tests/cucumber/steps/*

integration:
	node_modules/.bin/cucumber-js --tags "@algod or @assets or @auction or @kmd or @send or @template or @indexer" tests/cucumber/features --require tests/cucumber/steps/*

docker-test:
	./tests/cucumber/docker/run_docker.sh
