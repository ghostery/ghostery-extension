# The script will download the latest tag, unzip it, and run the extension.
# Then it will wait for the user to press enter, rebuild the extension from
# the current branch, and finally kill the browser.
#
# Usage:
#   ./scripts/update.sh [target=chromium] [tag=latest]
#
# Supported targets: chromium, firefox
#

target="${1:-chromium}"
tag=${2:-$(git describe --tags `git rev-list --tags --max-count=1`)}
version=${tag:1}

webExtTarget=$target
if [ $webExtTarget == "firefox" ]; then
  webExtTarget="firefox-desktop"
fi

# Rebuild from latest tag
echo "Downloading and unzipping the latest tag: $tag"
rm -rf ./dist ./dist.zip
curl -L -o dist.zip "https://github.com/ghostery/ghostery-extension/releases/download/$tag/ghostery-$target-$version.zip"
unzip dist.zip -d ./dist
rm dist.zip

../node_modules/.bin/web-ext run --target=$webExtTarget --no-reload --devtools >/dev/null &
pid=$!

read -p "Booting up the target browser. Press enter to rebuild from source.."

# Rebuild from source
echo "Rebuilding from source: $currentBranch"
npm run build $target

read -p "Rebuilding done. Press enter to kill the browser..."
kill -2 $pid
