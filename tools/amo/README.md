# Ghostery Source Code Builder for AMO Review

This package includes source code for the Ghostery extension along with Cliqz browser-core. Although browser-core is included in the Ghostery project as an NPM dependency, we provide the full source code here for easier review.

## `build.sh`

Use this script to install dependencies and build production code for the browser-core and ghostery-extension projects.

#### Requirements

This build script was tested on macOS Mojave with the following configuration:

+ [Homebrew](https://brew.sh/)
+ [nvm](https://github.com/nvm-sh/nvm")
	+ `brew install nvm`
+ [Yarn](https://yarnpkg.com/)
	+ `brew install yarn`
+ [jq](https://stedolan.github.io/jq/)
	+ `brew install jq`

#### Notes on `browser-core-X.X.X`

After running `build.sh`, you should see the production files in the `browser-core-X.X.X/build/` directory. This should match the code found in `ghostery-extension-X.X.X/node_modules/browser-core/build/`.

#### Notes on `ghostery-extension-X.X.X`

After running `build.sh`, you should see the production build archive in the `ghostery-extension-X.X.X/build/` directory. This file should match the archive that was submitted to AMO.

Compiled assets live in the `ghostery-extension-X.X.X/dist/` folder. Assets from Cliqz browser-core (see above) are copied into the `ghostery-extension-X.X.X/cliqz/` directory from `node_modules/browser-core/build/assets` using the `vendor-copy` npm package. That copy is triggered when running `yarn install`. See `package.json`:

```json
"vendorCopy": [
   {
      "from": "node_modules/browser-core/build/assets",
      "to": "cliqz"
    }
]
```

## `generate.sh` (Not included in submission)

Fetches source code from GitHub and packages it along with `build.sh` and this README. This creates the complete source code archive that Ghostery sends along with its AMO submissions.
