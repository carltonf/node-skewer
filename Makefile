.PHONY: test start
test:
	@NODE_ENV=testing npm test

start:
	bin/skewer test/fixturePublic
