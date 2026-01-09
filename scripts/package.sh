#!/usr/bin/env bash

set -e

SHA=''
SIMPLE=''
DEBUG=''
for val in $@; do
  if [ $val == '--simple' ]; then
    SIMPLE=1
  fi
  if [ $val == '--sha' ]; then
    SHA=$(git rev-parse --short HEAD)
  fi
  if [ $val == '--debug' ]; then
    DEBUG='--debug'
  fi
done

VERSION=$(node -p "require('./package.json').version")

for PLATFORM in firefox chromium; do
  echo
  echo "##################################"
  echo "  Generating package for $PLATFORM"
  echo "##################################"
  echo

  npm run build -- $PLATFORM --silent $DEBUG
  NAME="ghostery-$PLATFORM"
  if ! [ $SIMPLE ]; then
    NAME+="-$VERSION"
    if [ $SHA ]; then
      NAME+="-$SHA"
    fi
  fi
  if [ $DEBUG ]; then
    NAME+="-debug"
  fi
  NAME+=".zip"

  npm exec web-ext -- build \
    --overwrite-dest \
    -n "$NAME"
done
