# Ghostery Browser Extension

[![Tests](https://github.com/ghostery/ghostery-extension/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/ghostery/ghostery-extension/actions/workflows/test.yml)
![GitHub Release](https://img.shields.io/github/v/release/ghostery/ghostery-extension)


Ghostery is a powerful Tracker & Adblocker browser extension with over 100 million downloads. Block ads, stop trackers, and speed up websites. Privacy at its best.

* Block all ads on websites, including YouTube and Facebook, to focus on the information that matters.
* Stop trackers from collecting your personal data.
* Automatically remove intrusive cookie pop-ups and express dissent to online tracking.
* Get detailed tracker information on any website you visit, including the number of trackers, their type, and the company operating them.
* Preview tracker information on search engine result pages to make informed choices.
* Inspect the largest database of trackers, updated fast and reliably for all users.

## Links

* [Website](https://www.ghostery.com/)
* [Broken Page Reports](https://github.com/ghostery/broken-page-reports/)
* [Support](https://www.ghostery.com/support)
* [X, formerly Twitter (@ghostery)](https://twitter.com/ghostery)
* [Privacy Policy](https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/)

## Development

First, install dependencies and download additional resources (e.g. block lists):

```bash
npm ci
```

Then, start the local version of the extension in the supported browser:

```bash
npm start [chromium|firefox]
```

> The build script assumes that you are using macOS, and browsers are installed in the default locations

You can add the target after the `start` command to run the extension in a different Chromium-based browser:

* Opera - `npm start -- --browser=opera`
* Edge - `npm start -- --browser=edge`

To run local version in Safari, you have to use Xcode. The project files are available in the `xcode` folder, but Apple's ecosystem is more complex. Fortunately, most changes can be tested reliably in Chrome.

### External Resources

The build script caches fetched resources in several directories to speed up the development process. If you need to download fresh resources, add the `--clean` flag to the build command:

```bash
npm start -- --clean
```

## Ghostery Team

Ghostery relies on [contributions](https://github.com/ghostery/ghostery-extension/graphs/contributors) from lots of talented people.

## License

[GPL-3.0](https://www.gnu.org/licenses/gpl-3.0.en.html/) Copyright 2017-present Ghostery GmbH. All rights reserved.

See [LICENSE](LICENSE)
