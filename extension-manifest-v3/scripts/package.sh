#!/usr/bin/env bash

set -e

SHA=''
for val in $@; do
  if [ $val == '--sha' ]; then
    SHA=$(git rev-parse --short HEAD)
  fi
done

VERSION=$(node -p "require('./package.json').version")

for PLATFORM in firefox chrome edge opera; do
  npm run build -- $PLATFORM --silent
  npm exec web-ext -- build \
    --overwrite-dest \
    -n ghostery-$PLATFORM-$VERSION$([ $SHA ] && echo "-$SHA").zip
done
