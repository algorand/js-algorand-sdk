unit:
	node_modules/.bin/cucumber-js --tags "@unit.applications" tests/cucumber/features --require tests/cucumber/steps/*

integration:
	node_modules/.bin/cucumber-js --tags "@applications" tests/cucumber/features --require tests/cucumber/steps/*

docker-test:
	./tests/cucumber/docker/run_docker.sh
