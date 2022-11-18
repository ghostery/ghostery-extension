[![Ghostery](app/images/hub/side-navigation/ghostery-logo.svg)](https://www.ghostery.com)
---

[![Build Status](https://travis-ci.com/ghostery/ghostery-extension.svg?branch=master)](https://travis-ci.com/ghostery/ghostery-extension) &nbsp; ![GitHub manifest version](https://img.shields.io/github/manifest-json/v/ghostery/ghostery-extension.svg?style=flat-square) &nbsp; [![Twitter Follow](https://img.shields.io/twitter/follow/ghostery.svg?style=social&maxAge=3600)](https://twitter.com/ghostery)

Ghostery helps you browse smarter by giving you control over ads and tracking technologies to speed up page loads, eliminate clutter, and protect your data. This is the unified code repository for the Ghostery browser extensions in Chrome, Firefox, Opera and Edge.

## Downloads
**Firefox** &ndash; [Download](https://addons.mozilla.org/en-US/firefox/addon/ghostery/)

**Chrome** &ndash; [Download](https://chrome.google.com/webstore/detail/ghostery-%E2%80%93-privacy-ad-blo/mlomiejdfkolichcflejclcbmpeaniij)

**Opera** &ndash; [Download](https://addons.opera.com/en/extensions/details/ghostery/)

**Edge** &ndash; [Download](https://microsoftedge.microsoft.com/addons/detail/fclbdkbhjlgkbpfldjodgjncejkkjcme)

## Installation

Node.js 18 (or higher) is required to build the extension.

#### Install local npm packages

```sh
$ (cd ../libs && npm ci)
$ npm ci
```

## Building
```sh
# Build all sources
$ npm run build.dev
```

```sh
# Build for production
$ npm run build.prod
```

```sh
# Build and watch for changes
$ npm run build.watch
```

## Enable Debugging / Logging
```javascript
// In manifest.json set
"debug": true,
```

## Testing and Linting
```sh
# Update Jest snapshot artifacts
$ npm run test.snapshot
```

```sh
# Run unit tests
$ npm run test
```

```sh
# Run linter over the ./app and ./src folders
$ npm run lint
```

```sh
# Lint a specific file
$ npm run lint.raw src/utils/matcher.js
```

```sh
# Test i18n string lengths for panel UI
$ npm run leet
# Reset back to original en language file
$ npm run leet.reset
```

## Build Docs
```sh
# Build JSDoc files to ./docs
$ npm run docs
```

## Internationalization

This project is configured to use the Transifex CLI. See their [documentation](https://docs.transifex.com/client/installing-the-client) to get started. *Note*:  You do not need to run `tx config` as the project [configuration file](.tx/config) has already been generated.

Generate a Transifex API Token [link](https://www.transifex.com/user/settings/api/)

```sh
# Configure the Transifex CLI
$ tx init
```

```sh
# Submit translation files to Transifex
$ tx push -s
```

```sh
# Download translated files from Transifex
$ tx pull -a
```

```sh
# Add the placeholders into the downloaded translation files.
$ node tools/transifex.js
```

### Building Common Libraries for Ghostery
Common libraries are pre-built and included under the `ghostery-common` NPM dependency in [package.json](package.json). To reproduce this build process, download the appropriate Ghostery release from the [ghostery-common](https://github.com/ghostery/common/releases) project.

```sh
$ npm ci
$ ./fern.js build configs/ghostery.js --environment=production --no-debug
```

## Compatibility

+ Firefox: 68+
+ Firefox Android: 68+
+ Chrome: 69+
+ Opera: 56+
+ Edge: 79+

## Contribute

See [CONTRIBUTING](CONTRIBUTING.md) and [CODE OF CONDUCT](CODE-OF-CONDUCT.md)

## Tracker Databases
The [databases](/databases) folder contains JSON skeletons to show the schema expected by the extension pattern [matcher](/src/utils/matcher.js). See the [Database README](/databases/README.md) for more information.
Ghostery's production tracker databases have been purposely excluded from this project, as they remain proprietary to Ghostery, Inc. Which leads us to this grim, yet obligatory...

**Copyright Notice**

The proprietary databases are the intellectual property of Ghostery, Inc. and are protected by copyright and other applicable laws. All rights to them are expressly reserved by Ghostery, Inc. You may not use these databases or any portion thereof for any purpose that is not expressly granted in writing by Ghostery, Inc. All inquires should be sent to [legal@ghostery.com](legal@ghostery.com).  Ghostery, Inc. retains the sole discretion in determining whether or not to grant permission to use the databases. Unauthorized use of the databases, or any portion of them, will cause irreparable harm to Ghostery, Inc. and may result in legal proceedings against you, seeking monetary damages and an injunction against you, including the payment of legal fees and costs.

[![Ghostery](https://user-images.githubusercontent.com/44045911/180158789-b1b9a31e-2445-40bc-af76-5fefa6daef3d.jpg)](https://www.ghostery.com)
