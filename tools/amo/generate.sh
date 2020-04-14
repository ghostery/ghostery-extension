#!/bin/bash
#
# Generate source code archive for AMO reviewers
#
# Ghostery Browser Extension
# http://www.ghostery.com/
#
# Copyright 2019 Ghostery, Inc. All rights reserved.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0

VERSION_FILE=../../manifest.json
PACKAGE_FILE=../../package.json
ZIP_FILE=ghostery-source

# Get version numbers
GHOSTERY_RAW_VERSION=$(cat $VERSION_FILE | jq '.version')
GHOSTERY_VERSION=${GHOSTERY_RAW_VERSION//\"} # remove ""
CLIQZ_BROWSER_CORE=$(cat $PACKAGE_FILE | jq '.dependencies["browser-core"]')
CLIQZ_VERSION=$(echo $CLIQZ_BROWSER_CORE | perl -pe '($_)=/([0-9]+([.][0-9]+)+)/')

# Download source code zip files from GitHub
curl "https://github.com/ghostery/ghostery-extension/archive/v$GHOSTERY_VERSION.zip" -O -J -L --fail
curl "https://github.com/cliqz-oss/browser-core/archive/v$CLIQZ_VERSION.zip" -O -J -L --fail

# Copy .nvmrc to top-level dir
cp ../../.nvmrc ./

# Make source-code zip
zip --quiet -R "$ZIP_FILE" "*" -x generate.sh *.DS_Store

# Clean up
rm "browser-core-$CLIQZ_VERSION.zip"
rm "ghostery-extension-$GHOSTERY_VERSION.zip"
rm .nvmrc
