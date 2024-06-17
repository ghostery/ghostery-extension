# Usage:
# * npm run release [patch|minor|major]=patch
# * npm run release build (skip version bump)

# Create release branch from latest main
git checkout main
git pull
git checkout -b release
git checkout release

# Remove local node_modules if exists
rm -rf ./node_modules

# Update npm dependencies
cd .. && npm ci
cd ./extension-manifest-v3

# Update package version if it is not "build"
if [ "$1" != "build" ]; then
  npm version "${1:-patch}"
fi

# Update xcode version
node ./scripts/xcode-version.js

# Compile, push and pull new translations
npm run locales
tx push
tx pull -f

# Get version from package.json
version=$(node -p "require('./package.json').version")
# Get build number from xcode
buildVersion=$(cat ./xcode/Ghostery.xcodeproj/project.pbxproj | sed -n -e 's/^.*CURRENT_PROJECT_VERSION = \([0-9]*\).*$/\1/p')

# Commit changes
git add ../package-lock.json .
git commit -m "Release v$version-$buildVersion"

# Open Xcode
xed xcode
