p:
	git add .
	git commit -m 'qfix'
	git push

dev:
	npx webpack serve

install:
	npm ci

build:
	NODE_ENV=production npx webpack

test:
	npm test

lint:
	npx eslint .