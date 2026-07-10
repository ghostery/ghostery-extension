# Usage:
# * npm run release [patch|minor|major]=patch
# * npm run release build (skip version bump)

# Create release branch from latest main
git checkout main
git pull
git checkout -b release
git checkout release

# Update npm dependencies
npm ci

# Update package version if it is not "build"
if [ "$1" != "build" ]; then
  npm version "${1:-patch}" --no-commit-hooks --no-git-tag-version
fi

# Update scriptlets
npm i @ghostery/scriptlets

# Update data dependencies
node ./scripts/data-dependencies.js

# Update xcode version
node ./scripts/xcode-version.js

# Get version from package.json
version=$(node -p "require('./package.json').version")
# Get build number from xcode
buildVersion=$(cat ./xcode/Ghostery.xcodeproj/project.pbxproj | sed -n -e 's/^.*CURRENT_PROJECT_VERSION = \([0-9][0-9]*\).*$/\1/p' | head -n 1)

# Commit changes
git add .
git commit -m "Release v$version-$buildVersion"

# Push the release branch
git push -u origin release --force

# Build PR description from commits since the last version tag (excluding this branch's commit)
lastTag=$(git describe --tags --abbrev=0 --match "v*" origin/main)
prBody=$(git log --oneline "$lastTag"..origin/main)

# Create or update the PR
prNumber=$(gh pr list --head release --state open --json number --jq '.[0].number')
if [ -n "$prNumber" ]; then
  gh pr edit "$prNumber" --title "Release v$version" --body "$prBody"
else
  gh pr create --base main --head release --title "Release v$version" --body "$prBody" --label "package" --reviewer "AdamGhst"
fi

# Open Xcode
xed xcode
