rm -rf ./web-ext-artifacts
mkdir ./web-ext-artifacts

# Build and copy Chrome extension
npm run build -- --silent
cp -r ./dist ./web-ext-artifacts/ghostery-chromium

# Build and pack Firefox extension
npm run build -- firefox --silent
web-ext build --overwrite-dest -n ghostery-firefox.zip

# Run e2e tests
npm run wdio
