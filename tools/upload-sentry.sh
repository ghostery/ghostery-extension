#!/usr/bin/env bash -x

VERSION=`cat manifest.json | jq '.version' -r`

sentry-cli \
	releases \
	--org ghostery \
	--project ghostery-extension \
	files ghostery-extension@$VERSION \
	upload-sourcemaps ./dist/background.js ./dist/background.js.map \
	--url-prefix ~/dist/
