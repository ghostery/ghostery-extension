# Usage:
# * npm run release [patch|minor|major]=patch
# * npm run release build (skip version bump)

# Create release branch from latest main
git checkout main
git pull
git checkout -b mv3-release
git checkout mv3-release

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

# Commit changes
git add ../package-lock.json .
git commit -m "Release $version"

# Build extension
npm run start safari
