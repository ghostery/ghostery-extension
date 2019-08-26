#!/bin/bash
#
# Build script for AMO reviewers
#
# Ghostery Browser Extension
# http://www.ghostery.com/
#
# Copyright 2019 Ghostery, Inc. All rights reserved.
#
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0

set -e

# Set directory paths for both projects
GHOSTERY_SOURCE_ZIP=$(find . -name "ghostery-extension-*.zip")
GHOSTERY_SOURCE_DIR="${GHOSTERY_SOURCE_ZIP%.zip*}"
CLIQZ_SOURCE_ZIP=$(find . -name "browser-core-*.zip")
CLIQZ_SOURCE_DIR="${CLIQZ_SOURCE_ZIP%.zip*}"

# Extract
if [ ! -d $GHOSTERY_SOURCE_DIR ]; then
	unzip $GHOSTERY_SOURCE_ZIP
fi

if [ ! -d $CLIQZ_SOURCE_DIR ]; then
	unzip $CLIQZ_SOURCE_ZIP
fi

#### BROWSER CORE ####
cd $CLIQZ_SOURCE_DIR

# Clean any previous builds
rm -rf build

# Clean all the exiting node_modules for a more reproducible build
rm -rf node_modules

# Install the exact versions from package-lock.json
npm ci

# Build a production version of browser-core for Ghostery
./fern.js build configs/ghostery.js --environment=production --no-debug

echo "Browser Core build complete. Please see build/ directory."

cd ..

#### GHOSTERY EXTENSION ####
cd $GHOSTERY_SOURCE_DIR

VERSION_FILE=manifest.json
MANIFEST_BACKUP=$(cat $VERSION_FILE)
RAW_VERSION=$(cat $VERSION_FILE | jq '.version')
VERSION=${RAW_VERSION//\"} # remove ""
BUILD_DIR=build
ZIP_FILE="$BUILD_DIR/ghostery-extension-v$VERSION.zip"
TMP_FILE=$(mktemp)

# Check for yarn
if ! type yarn > /dev/null; then
	abort "Please install yarn: https://yarnpkg.com/lang/en/docs/install/"
fi

# Check for jq
if ! type jq > /dev/null; then
	abort "Please install jq: https://stedolan.github.io/jq/download/"
fi

# Check for nvm
source /usr/local/opt/nvm/nvm.sh
if ! command -v nvm | grep -q 'nvm'; then
	abort "Please install nvm: https://github.com/nvm-sh/nvm"
fi

# Clean any previous builds
rm -rf build

# Clean all the exiting node_modules for a more reproducible build
rm -rf node_modules

# Set node version
nvm install lts/carbon
nvm use

# Install local npm packages
yarn install --frozen-lockfile

# Build for production
yarn build.prod

# Clean up properties from manifest.json
cat $VERSION_FILE | jq 'del(.version_name, .debug, .log, .options_page, .minimum_edge_version, .minimum_chrome_version, .minimum_opera_version, .permissions[7,8], .background.persistent)' > ${TMP_FILE}
cat ${TMP_FILE} > $VERSION_FILE # copy into manifest.json
rm -f ${TMP_FILE}

# Zip final build files
echo "Zipping to $(pwd)/$BUILD_DIR/"
test -d $BUILD_DIR || mkdir $BUILD_DIR && \
	zip --quiet -R "$ZIP_FILE" "*" -x \
		.* \
		.*/\* \
		app/content-scripts/\* \
		app/data-images/\* \
		app/panel/\* \
		app/panel-android/\* \
		app/setup/\* \
		app/scss/\* \
		app/licenses/\* \
		app/Account/\* \
		app/hub/\* \
		app/shared-components/\* \
		build/\* \
		docs/\* \
		node_modules/\* \
		src/\* \
		test/\* \
		tools/\* \
		*.log \
		*.map \
		*.md \
		babel.config.js \
		CODEOWNERS \
		Dockerfile \
		Jenkinsfile \
		jest.config.js \
		jsdoc.json \
		package.json \
		package-lock.json \
		yarn.lock \
		webpack.* \
		*.DS_Store*
echo "Zipped successfully into $BUILD_DIR/$ZIP_FILE"

# Reset manifest
echo $MANIFEST_BACKUP > $VERSION_FILE
