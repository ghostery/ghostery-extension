#!/usr/bin/env bash

set -e

VERSION=$(node -p "require('./package.json').version")

for PLATFORM in firefox chrome edge opera
do
  npm run build -- $PLATFORM --silent
  npm exec web-ext -- build \
    --overwrite-dest \
    -n ghostery-$PLATFORM-$VERSION.zip
done
