rm -rf ./web-ext-artifacts
mkdir ./web-ext-artifacts

# Build and copy Chrome extension
npm run build
cp -r ./dist ./web-ext-artifacts/ghostery-chromium

# Build and pack Firefox extension
npm run build firefox
web-ext build --overwrite-dest -n ghostery-firefox.zip

# Run e2e tests
npm run wdio
