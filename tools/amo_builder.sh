#!/bin/bash
#
# Build script for AMO Reviewers
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
GHOSTERY_SOURCE_ZIP=`find . -name "ghostery-extension-*.zip"`
GHOSTERY_SOURCE_DIR="${GHOSTERY_SOURCE_ZIP%.zip*}"
CLIQZ_SOURCE_ZIP=`find . -name "browser-core-*.zip"`
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
rm -fr build

# Clean all the exiting node_modules for a more reproducible build
rm -fr node_modules

# Install the exact versions from package-lock.json
npm ci

# Build a production version of browser-core for Ghostery
./fern.js build configs/ghostery.js --no-maps --no-debug --environment=production

echo "Browser Core build complete. Please see build/ directory."

cd ..

#### GHOSTERY EXTENSION ####
cd $GHOSTERY_SOURCE_DIR

VERSION_FILE=manifest.json
MANIFEST=`cat $VERSION_FILE`
CWD=$(pwd)
VERSION=`cat $VERSION_FILE | jq '.version'`
BUILD_DIR=build
ZIP_FILE="$BUILD_DIR/ghostery-extension-v$VERSION.zip"

# Install yarn
if ! type yarn > /dev/null; then
	if ! type brew > /dev/null; then
		brew install yarn
	else 
		curl -o- -L https://yarnpkg.com/install.sh | bash
	fi
fi

# Install jq
if ! type jq > /dev/null; then
	if ! type brew > /dev/null; then
		brew install jq
	else
		abort "Please install jq: https://stedolan.github.io/jq/download/"
	fi
fi

# Clean any previous builds
rm -fr build

# Clean all the exiting node_modules for a more reproducible build
rm -fr node_modules

# Install local npm packages
yarn install --frozen-lockfile

# Build for production
yarn build.prod

# Clean up manifest.json
sed -i '' '/^\([[:space:]]*"debug": \).*$/d' $VERSION_FILE
sed -i '' '/^\([[:space:]]*"log": \).*$/d' $VERSION_FILE
sed -i '' '/^\([[:space:]]*"options_page": \).*$/d' $VERSION_FILE
sed -i '' '/^\([[:space:]]*"minimum_edge_version": \).*$/d' $VERSION_FILE
sed -i '' '/^\([[:space:]]*"minimum_chrome_version": \).*$/d' $VERSION_FILE
sed -i '' '/^\([[:space:]]*"minimum_opera_version": \).*$/d' $VERSION_FILE

# Zip final build files
echo "Zipping to $BUILD_DIR/ directory"
test -d $BUILD_DIR || mkdir $BUILD_DIR && \
	zip --quiet -R "$ZIP_FILE" "*" -x \
		^.*\
		app/content-scripts/\* \
		app/data-images/\* \
		app/panel/\* \
		app/setup/\* \
		app/scss/\* \
		app/licenses/\* \
		app/Account/\* \
		app/hub/\* \
		app/shared-components/\* \
		build/\* \
		dist/*.js.map \
		docs/\* \
		node_modules/\* \
		src/\* \
		test/\* \
		tools/\* \
		*.log$ \
		*.md$ \
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
		*.DS_Store* \
		&& \
	cd "$CWD" || \
	{
		abort "Error occurred creating ghostery-extension zip"
	}
echo "Zipped successfully into $BUILD_DIR/$ZIP_FILE"

# Reset manifest
echo $MANIFEST > $VERSION_FILE
