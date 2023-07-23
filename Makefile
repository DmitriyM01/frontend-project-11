install:
	npm ci

lint:
	npx exlint

start:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack