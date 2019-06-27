[![Ghostery](https://www.ghostery.com/wp-content/themes/ghostery/images/ghostery_logo_black.svg)](https://www.ghostery.com)
---

[![Build Status](https://travis-ci.org/ghostery/ghostery-extension.svg?branch=master)](https://travis-ci.org/ghostery/ghostery-extension) &nbsp; ![GitHub manifest version](https://img.shields.io/github/manifest-json/v/ghostery/ghostery-extension.svg?style=flat-square) &nbsp; [![Chat on Gitter](https://img.shields.io/gitter/room/ghostery/ghostery-expenstion.svg?style=flat-square)](https://gitter.im/ghostery/ghostery-extension) &nbsp; [![Twitter Follow](https://img.shields.io/twitter/follow/ghostery.svg?style=social&maxAge=3600)](https://twitter.com/ghostery)

Ghostery helps you browse smarter by giving you control over ads and tracking technologies to speed up page loads, eliminate clutter, and protect your data. This is the unified code repository for the Ghostery browser extensions in Chrome, Firefox, Opera and Edge.

## Downloads
**Firefox** &ndash; [Download](https://addons.mozilla.org/en-US/firefox/addon/ghostery/)

**Chrome** &ndash; [Download](https://chrome.google.com/webstore/detail/ghostery-%E2%80%93-privacy-ad-blo/mlomiejdfkolichcflejclcbmpeaniij)

**Cliqz** &ndash; [Download](https://s3.amazonaws.com/cdncliqz/update/browser/firefox%40ghostery.com/latest.xpi)

**Opera** &ndash; [Download](https://addons.opera.com/en/extensions/details/ghostery/)

**Edge** &ndash; [Download](https://www.microsoft.com/en-us/store/p/ghostery/9nblggh52ngz)

## Installation

#### Install yarn
**https://yarnpkg.com/en/docs/install**

#### Install local npm packages
```sh
$ yarn install --frozen-lockfile
```

#### Upgrade packages
```sh
# Upgrade packages according to package.json version range
# https://yarnpkg.com/en/docs/cli/upgrade/
$ yarn upgrade
```

## Building
```sh
# Build all sources
$ yarn build.dev
```

```sh
# Build for production
$ yarn build.prod
```

```sh
# Build and watch for changes
$ yarn build.watch
```

## Enable Debugging / Logging
```javascript
// In manifest.json set
"debug": true,
"log": true,
```

## Testing and Linting
```sh
# Update Jest snapshot artifacts
$ yarn test.snapshot
```

```sh
# Run unit tests
$ yarn test.unit
```

```sh
# Run linter over the ./app and ./src folders
$ yarn lint
```

```sh
# Lint a specific file
$ yarn lint.raw src/utils/matcher.js
```

```sh
# Test i18n string lengths for panel UI
$ yarn leet
# Reset back to original en language file
$ yarn leet.reset
```

## Build Docs
```sh
# Build JSDoc files to ./docs
$ yarn docs
```

## Internationalization
We use Transifex and their CLI to manage our translation files. Follow
[these instructions](https://docs.transifex.com/client/installing-the-client)
to get started.

Note: There is no need to run `tx config` as the project has already been
configured to work with Transifex. See the configuration file in `.tx/config`.

Next, [generate an API Token](https://www.transifex.com/user/settings/api/),
run `tx init`, and paste the generated API Token when prompted.  This will
allow the computer to push (Submit) and pull (Download) files to/from Transifex.

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

## Cliqz Source Code
Ghostery implements the following open-source products from [Cliqz](https://cliqz.com/en/)

[**Human Web**](https://cliqz.com/en/whycliqz/human-web)
+ [How it works](https://cliqz.com/en/magazine/techblog-human-web-reliably-removes-uids)
+ [GitHub](https://github.com/cliqz-oss/browser-core/blob/master/modules/human-web/)

[**Anti-Tracking**](https://cliqz.com/en/whycliqz/anti-tracking)
+ [How it works](https://cliqz.com/en/magazine/how-we-at-cliqz-protect-users-from-web-tracking)
+ [GitHub](https://github.com/cliqz-oss/browser-core/blob/master/modules/antitracking)

[**Ad Blocker**](https://cliqz.com/en/whycliqz/adblocking)
+ [GitHub](https://github.com/cliqz-oss/adblocker)

[**MyOffrz**](https://cliqz.com/en/cliqz-angebote)
+ [GitHub](https://github.com/cliqz-oss/browser-core/blob/master/modules/offers-v2)

### Building Cliqz Modules for Ghostery
Cliqz modules are pre-built and included under the `browser-core` NPM dependency in [package.json](package.json). To reproduce this build process, grab the appropriate Ghostery release (v7.x.x) from the [browser-core](https://github.com/cliqz-oss/browser-core/releases) project.

```sh
$ npm install
$ ./fern.js build configs/ghostery.js --no-maps --environment=production
$ ./fern.js pack configs/ghostery.js
```

## Compatibility

+ Firefox: 52+
+ Firefox Android: 55+
+ Chrome: 58+
+ Opera: 45+
+ Edge: 34.14291+

## Contribute

See [CONTRIBUTING](CONTRIBUTING.md) and [CODE OF CONDUCT](CODE-OF-CONDUCT.md)

## Links
+ [Website](https://ghostery.com/)
+ [Support](mailto:support@ghostery.com)
+ [Twitter (@ghostery)](https://twitter.com/ghostery)
+ [Facebook](https://www.facebook.com/ghostery)
+ [Privacy Policy](https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/)

## Additional Open Source Ghostery Projects
+ [Ghostery Android Browser](https://github.com/ghostery/browser-android)
+ [Ghostery iOS Browser](https://github.com/ghostery/browser-ios)
+ [Cliqz Desktop Browser](https://github.com/cliqz-oss/browser-f)
+ [Ghostery Lite for Safari](https://github.com/ghostery/GhosterySafari)

## Ghostery Team
Ghostery relies on [contributions](https://github.com/ghostery/ghostery-extension/graphs/contributors) from lots of talented people. Our core development team looks like this:

![Christopher Tino](https://static.cliqz.com/wp-content/uploads/2017/08/chris.jpg) | ![José María Signanini](https://static.cliqz.com/wp-content/uploads/2017/08/jose.jpg) | ![Serge Zarembsky](https://static.cliqz.com/wp-content/uploads/2017/08/serge.jpg) | ![Patrick Lawler](https://static.cliqz.com/wp-content/uploads/2017/08/patrick.jpg) | ![Caleb Richelson](https://static.cliqz.com/wp-content/uploads/2018/03/caleb.jpg)
:---:|:---:|:---:|:---:|:---:
[Christopher Tino](http://github.com/christophertino) | [José María Signanini](https://github.com/jsignanini) | [Serge Zarembsky](https://github.com/zarembsky) | [Patrick Lawler](https://github.com/trickpattyFH20) | [Caleb Richelson](https://github.com/IAmThePan)
![Aziz Aithsaine](https://static.cliqz.com/wp-content/uploads/2017/08/aziz.jpg) | ![Ethan Gooding](https://static.cliqz.com/wp-content/uploads/2018/12/Ethan.jpg) | ![Frank Chiarulli](https://static.cliqz.com/wp-content/uploads/2018/12/Frank-Chiarulli.jpg) | ![Ilya Zarembsky](https://static.cliqz.com/wp-content/uploads/2018/12/Ilya-Zarembsky.jpg) | ![Valmik Patel](https://static.cliqz.com/wp-content/uploads/2018/07/Valmik.jpg)
Aziz Aithsaine | [Ethan Gooding](https://github.com/Eden12345) | [Frank Chiarulli](https://github.com/fcjr) | [Ilya Zarembsky](https://github.com/wlycdgr) | [Valmik Patel](https://github.com/valmikkpatel)

See the full montage of uncommonly attractive Ghosterians/Cliqzers [here](https://www.cliqz.com/about/team).

## License
[MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/) Copyright 2019 Ghostery, Inc. All rights reserved.

See [LICENSE](LICENSE)

## Tracker Databases
The [databases](/databases) folder contains JSON skeletons to show the schema expected by the extension pattern [matcher](/src/utils/matcher.js). See the [Database README](/databases/README.md) for more information.
Ghostery's production tracker databases have been purposely excluded from this project, as they remain proprietary to Ghostery, Inc. Which leads us to this grim, yet obligatory...

**Copyright Notice**

The proprietary databases are the intellectual property of Ghostery, Inc. and are protected by copyright and other applicable laws. All rights to them are expressly reserved by Ghostery, Inc. You may not use these databases or any portion thereof for any purpose that is not expressly granted in writing by Ghostery, Inc. All inquires should be sent to [legal@ghostery.com](legal@ghostery.com).  Ghostery, Inc. retains the sole discretion in determining whether or not to grant permission to use the databases. Unauthorized use of the databases, or any portion of them, will cause irreparable harm to Ghostery, Inc. and may result in legal proceedings against you, seeking monetary damages and an injunction against you, including the payment of legal fees and costs.

[![Ghostery](https://www.ghostery.com/wp-content/themes/ghostery/images/github/ghosty_coder.jpg)](https://www.ghostery.com)
