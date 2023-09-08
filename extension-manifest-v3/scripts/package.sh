#!/usr/bin/env bash

set -e

SHA=''
SIMPLE=''
for val in $@; do
  if [ $val == '--simple' ]; then
    SIMPLE=1
  fi
  if [ $val == '--sha' ]; then
    SHA=$(git rev-parse --short HEAD)
  fi
done

VERSION=$(node -p "require('./package.json').version")

for PLATFORM in firefox chrome edge opera; do
  echo
  echo "##################################"
  echo "  Generating package for $PLATFORM"
  echo "##################################"
  echo

  npm run build -- $PLATFORM --silent
  NAME="ghostery-$PLATFORM"
  if ! [ $SIMPLE ]; then
    NAME+="$VERSION"
    if [ $SHA ]; then
      NAME+="-$SHA"
    fi
  fi
  NAME+=".zip"

  npm exec web-ext -- build \
    --overwrite-dest \
    -n "$NAME"
done
