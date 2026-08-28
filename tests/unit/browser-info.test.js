import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

const originalNavigator = global.navigator;
const originalFirefox = global.__FIREFOX__;
const originalChromium = global.__CHROMIUM__;

async function assertBrowserInfo(
  { caseName, userAgent, platform, maxTouchPoints, firefox = false },
  { os, isWebkit: expectedIsWebkit, name, version, osVersion },
) {
  Object.defineProperty(global, 'navigator', {
    value: { userAgent, platform, maxTouchPoints, brave: undefined },
    configurable: true,
    writable: true,
  });
  global.__FIREFOX__ = firefox;
  global.__CHROMIUM__ = !firefox;

  const {
    default: getBrowserInfo,
    getBrowser,
    getOS,
    isMobile,
    isWebkit,
    // cache-bust the import so each test gets a fresh module (browser-info.js caches UA/os internally)
  } = await import(`../../src/utils/browser-info.js?case=${caseName}`);

  assert.equal(getOS(), os);
  assert.equal(isWebkit(), expectedIsWebkit);
  assert.equal(isMobile(), ['android', 'ios', 'ipados'].includes(os));
  assert.equal(getBrowser().name, name);

  const info = getBrowserInfo();
  assert.equal(info.os, os);
  assert.equal(info.name, name);
  assert.equal(info.version, version);
  assert.equal(info.osVersion, osVersion);

  Object.defineProperty(global, 'navigator', {
    value: originalNavigator,
    configurable: true,
    writable: true,
  });
  global.__FIREFOX__ = originalFirefox;
  global.__CHROMIUM__ = originalChromium;
}

describe('Mac', () => {
  test('Chrome in the page', () =>
    assertBrowserInfo(
      {
        caseName: 'desktop-chrome-page',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      },
      {
        os: 'mac',
        isWebkit: false,
        name: 'chrome',
        version: 152,
        osVersion: '10.15.7',
      },
    ));

  test('Chrome in the background', () =>
    assertBrowserInfo(
      {
        caseName: 'desktop-chrome-background',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
        platform: 'MacIntel',
        maxTouchPoints: undefined,
      },
      {
        os: 'mac',
        isWebkit: false,
        name: 'chrome',
        version: 152,
        osVersion: '10.15.7',
      },
    ));

  // Firefox reports the same navigator data in the page and the service worker
  test('Firefox in the page & service worker', () =>
    assertBrowserInfo(
      {
        caseName: 'firefox-mac',
        firefox: true,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:154.0) Gecko/20100101 Firefox/154.0',
        platform: 'MacIntel',
        maxTouchPoints: 0, // undefined in service worker
      },
      {
        os: 'mac',
        isWebkit: false,
        name: 'firefox',
        version: 154,
        osVersion: '10.15',
      },
    ));

  // Opera reports the same navigator data in the page and the service worker
  test('Opera in the page & service worker', () =>
    assertBrowserInfo(
      {
        caseName: 'opera-mac',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36 OPR/132.0.0.0',
        platform: 'MacIntel',
        maxTouchPoints: 0, // undefined in service worker
      },
      {
        os: 'mac',
        isWebkit: false,
        name: 'opera',
        version: 132,
        osVersion: '10.15.7',
      },
    ));

  // Edge reports the same navigator data in the page and the service worker
  test('Edge in the page & service worker', () =>
    assertBrowserInfo(
      {
        caseName: 'edge-mac',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0',
        platform: 'MacIntel',
        maxTouchPoints: undefined,
      },
      {
        os: 'mac',
        isWebkit: false,
        name: 'edge',
        version: 151,
        osVersion: '10.15.7',
      },
    ));
});

describe('Android', () => {
  test('Firefox in the page', () =>
    assertBrowserInfo(
      {
        caseName: 'firefox-android-page',
        firefox: true,
        userAgent: 'Mozilla/5.0 (Android 17; Mobile; rv:154.0) Gecko/154.0 Firefox/154.0',
        platform: 'Linux armv81',
        maxTouchPoints: 5,
      },
      {
        os: 'android',
        isWebkit: false,
        name: 'firefox',
        version: 154,
        osVersion: '17',
      },
    ));

  test('Firefox in the background', () =>
    assertBrowserInfo(
      {
        caseName: 'firefox-android-background',
        firefox: true,
        userAgent: 'Mozilla/5.0 (Android 17; Mobile; rv:154.0) Gecko/154.0 Firefox/154.0',
        platform: 'Linux armv81',
        maxTouchPoints: 0,
      },
      {
        os: 'android',
        isWebkit: false,
        name: 'firefox',
        version: 154,
        osVersion: '17',
      },
    ));

  test('Edge in the page', () =>
    assertBrowserInfo(
      {
        caseName: 'edge-android-page',
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36 EdgA/154.0.0.0',
        platform: 'Linux armv81',
        maxTouchPoints: 5,
      },
      {
        os: 'android',
        isWebkit: false,
        name: 'edge',
        version: 154,
        osVersion: '10',
      },
    ));

  test('Edge in the background', () =>
    assertBrowserInfo(
      {
        caseName: 'edge-android-background',
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36 EdgA/154.0.0.0',
        platform: 'Linux armv81',
        maxTouchPoints: undefined,
      },
      {
        os: 'android',
        isWebkit: false,
        name: 'edge',
        version: 154,
        osVersion: '10',
      },
    ));
});

describe('iPad', () => {
  test('Safari in the page & page background process', () =>
    assertBrowserInfo(
      {
        caseName: 'safari-ipados',
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      },
      {
        os: 'ipados',
        isWebkit: true,
        name: 'safari',
        version: 26,
        osVersion: '10.15.7',
      },
    ));

  // NOTICE: We don't use service workers in Safari, but this test
  // is here to ensure that if we do, the browser detection still works.
  test('Safari in the service worker', () =>
    assertBrowserInfo(
      {
        caseName: 'safari-ipados-sw',
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1',
        platform: 'iPad',
        maxTouchPoints: undefined,
      },
      {
        os: 'ipados',
        isWebkit: true,
        name: 'safari',
        version: 26,
        osVersion: '18.7',
      },
    ));

  // TODO: Replace with real data from the extension
  test('Edge in the page', () =>
    assertBrowserInfo(
      {
        caseName: 'edge-ipad',
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/151.0.4129.96 Version/26.0 Mobile/15E148 Safari/604.1',
        platform: 'iPad',
        maxTouchPoints: 5,
      },
      {
        os: 'ipados',
        isWebkit: true,
        name: 'edge',
        version: 151,
        osVersion: '26.6.0',
      },
    ));

  // TODO: Get the service worker data for Edge on iPadOS
  test.skip('Edge in the service worker', () => {});

  // TODO: Replace with real data from the extension
  test('Chrome in the page', () =>
    assertBrowserInfo(
      {
        caseName: 'chrome-ipad',
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 26_6_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/152.0.7977.64 Mobile/15E148 Safari/604.1',
        platform: 'iPad',
        maxTouchPoints: 5,
      },
      {
        os: 'ipados',
        isWebkit: true,
        name: 'chrome',
        version: 152,
        osVersion: '26.6.0',
      },
    ));
});

describe('iOS', () => {
  test('Safari in the page & page background process', () =>
    assertBrowserInfo(
      {
        caseName: 'safari-ios-page',
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Mobile/15E148 Safari/604.1',
        platform: 'iPhone',
        maxTouchPoints: 5,
      },
      {
        os: 'ios',
        isWebkit: true,
        name: 'safari',
        version: 26,
        osVersion: '18.7',
      },
    ));

  // TODO: Get the page data for Edge on iOS
  test.skip('Edge in the page', () => {});

  // TODO: Get the service worker data for Edge on iOS
  test.skip('Edge in the service worker', () => {});
});
