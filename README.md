# Ghostery Browser Extension

> A powerful privacy extension that blocks ads, prevents trackers, and accelerates website loading

Ghostery is a powerful Tracker & Adblocker extension for Chrome with over 100 million downloads. Block ads, stop trackers, and speed up websites. Privacy at its best.

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

## Additional Open Source Ghostery Projects

* [Ghostery Desktop Browser](https://github.com/ghostery/user-agent-desktop)
* [Ghostery iOS Browser](https://github.com/ghostery/user-agent-ios)
* [Ghostery Android Browser](https://github.com/ghostery/user-agent-android)

## Development

To start the local version of the extension in Chrome, run the following commands:

```bash
npm i && npm start
```

Add the target after the command to run the extension in a different browser:

* Firefox - `npm start firefox`
* Opera - `npm start -- --browser=opera`
* Edge - `npm start -- --browser=edge`
* Safari (MacOS) - `npm start safari-macos`
* Safari (iOS) - `npm start safari-ios`

> The build script assumes that you are using macOS, and browsers are installed in the default locations

To run it locally in Safari, you have to use Xcode as well. The project files are available in the `xcode` folder, but Apple's ecosystem is more complex. Fortunately, most changes can be tested reliably in Chrome.

## Ghostery Team

Ghostery relies on [contributions](https://github.com/ghostery/ghostery-extension/graphs/contributors) from lots of talented people.

## License

[MPL-2.0](https://www.mozilla.org/en-US/MPL/2.0/) Copyright 2017-present Ghostery GmbH. All rights reserved.

See [LICENSE](LICENSE)
