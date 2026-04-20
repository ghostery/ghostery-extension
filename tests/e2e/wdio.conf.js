/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/*
 * Usage:
 *   wdio tests/wdio.conf.js [--target=firefox,chrome,safari] [--debug] [--clean]
 *
 * Options:
 *   --target: comma separated list of browsers to run the tests on (default: firefox,chrome)
 *             safari requires macOS with `safaridriver --enable` and "Allow Unsigned Extensions"
 *   --debug: run the tests in debug mode (default: false)
 *   --clean: clean the build artifacts before running the tests (default: false)
 */

import os from 'node:os';
import path from 'node:path';
import {
  readFileSync,
  writeFileSync,
  cpSync,
  existsSync,
  rmSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { execSync, execFileSync, spawn } from 'node:child_process';
import { $, $$ } from '@wdio/globals';

import { setupTestPage } from './page/server.js';

import { getExtensionPageURL, setExtensionBaseUrl, PAGE_PORT, PAGE_URL } from './utils.js';

export const WEB_EXT_PATH = path.join(process.cwd(), 'web-ext-artifacts');
export const FIREFOX_PATH = path.join(WEB_EXT_PATH, 'ghostery-firefox.zip');
export const CHROME_PATH = path.join(WEB_EXT_PATH, 'ghostery-chromium');
export const SAFARI_PATH = path.join(WEB_EXT_PATH, 'ghostery-safari');

// Generate arguments from command line
export const argv = process.argv.slice(2).reduce(
  (acc, arg) => {
    if (arg.startsWith('--')) {
      if (arg.includes('=')) {
        const [key, value] = arg.slice(2).split('=');
        acc[key] = value.split(',').filter((v) => v);
      } else {
        acc[arg.slice(2)] = true;
      }
    }
    return acc;
  },
  {
    target: ['firefox', 'chrome'],
    clean: false,
    debug: false,
  },
);

function execSyncNode(command) {
  execSync(command, {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: '' },
  });
}

export function buildForFirefox() {
  if (!existsSync(FIREFOX_PATH)) {
    execSyncNode('npm run build -- firefox --silent --debug --clean');
    execSyncNode('web-ext build --overwrite-dest -n ghostery-firefox.zip');
  }
}

export function buildForChrome() {
  if (!existsSync(CHROME_PATH)) {
    execSyncNode('npm run build -- chromium --silent --debug --clean');
    rmSync(CHROME_PATH, { recursive: true, force: true });
    cpSync(path.join(process.cwd(), 'dist'), CHROME_PATH, {
      recursive: true,
    });
  }
}

const SAFARIDRIVER_PORT = 4321;
const SAFARIDRIVER_LOG_DIR = path.join(os.homedir(), 'Library/Logs/com.apple.WebDriver');
let safariDriverProcess = null;

async function findSafariDriverLog(minMtimeMs, timeoutMs = 10000) {
  // safaridriver forks, so the log filename's pid doesn't match spawn's pid.
  // Take the most recently modified log file created after we launched it.
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (existsSync(SAFARIDRIVER_LOG_DIR)) {
      const candidates = readdirSync(SAFARIDRIVER_LOG_DIR)
        .filter((name) => name.startsWith('safaridriver.') && name.endsWith('.txt'))
        .map((name) => {
          const full = path.join(SAFARIDRIVER_LOG_DIR, name);
          return { full, mtime: statSync(full).mtimeMs };
        })
        .filter(({ mtime }) => mtime >= minMtimeMs)
        .sort((a, b) => b.mtime - a.mtime);
      if (candidates.length) return candidates[0].full;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return null;
}

async function safariDriverRequest(browser, method, segment, body) {
  const url = `http://localhost:${SAFARIDRIVER_PORT}/session/${browser.sessionId}${segment}`;
  // undici's default headersTimeout is 5min; extension install on CI can
  // legitimately take longer while Safari registers the unpacked extension.
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10 * 60 * 1000),
  });
  const json = await res.json();
  if (json.value?.error) {
    throw new Error(`safaridriver ${method} ${segment} failed: ${JSON.stringify(json.value)}`);
  }
  return json.value;
}

function allowSafariExtensionPermission() {
  // Safari shows a per-site permission sheet the first time an extension runs
  // on a page. The buttons render as direct children of the Safari window
  // (not a sheet) and can be reached via System Events UI automation. If no
  // prompt appears the script returns "skipped" instead of failing.
  execFileSync('osascript', [
    '-e',
    `tell application "System Events"
       tell process "Safari"
         set w to window 1
         repeat 30 times
           if exists button "Always Allow" of w then
             if exists checkbox "Remember for other websites" of w then
               click checkbox "Remember for other websites" of w
             end if
             click button "Always Allow" of w
             return "clicked"
           end if
           delay 0.2
         end repeat
         return "skipped"
       end tell
     end tell`,
  ]);
}

export function buildForSafari() {
  if (!existsSync(SAFARI_PATH)) {
    execSyncNode('npm run build -- chromium --silent --debug --clean');
    rmSync(SAFARI_PATH, { recursive: true, force: true });
    cpSync(path.join(process.cwd(), 'dist'), SAFARI_PATH, {
      recursive: true,
    });

    // Safari does not support background.service_worker; use scripts instead.
    // Mirrors xcode/ci_scripts/build.sh
    const manifestPath = path.join(SAFARI_PATH, 'manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.background?.service_worker) {
      manifest.background = {
        scripts: [manifest.background.service_worker],
        type: 'module',
        persistent: false,
      };
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }

  }
}

export const config = {
  specs: [
    // Main features
    [
      'spec/onboarding.spec.js',
      'spec/managed.spec.js',
      'spec/main.spec.js',
      'spec/zapped.spec.js',
      'spec/adblocker.spec.js',
    ],
    // The rest explicitly defined (a pattern would match main features too)
    [
      'spec/exceptions.spec.js',
      'spec/custom-filters.spec.js',
      'spec/redirect-protection.spec.js',
      'spec/clear-cookies.spec.js',
      'spec/panel.spec.js',
      'spec/pause-assistant.spec.js',
      'spec/whotracksme.spec.js',
    ],
  ],
  reporters: [['spec', { showPreface: false, realtimeReporting: !process.env.GITHUB_ACTIONS }]],
  logLevel: argv.debug ? 'error' : 'silent',
  mochaOpts: {
    timeout: argv.debug ? 24 * 60 * 60 * 1000 : 60 * 1000,
    retries: 2,
  },
  maxInstances: 1,
  capabilities: [
    {
      browserName: 'firefox',
      browserVersion: 'stable',
      cacheDir: '.wdio',
      'moz:firefoxOptions': {
        args: argv.debug ? [] : ['-headless', '--width=1024', '--height=768'],
        prefs: {
          'browser.cache.disk.enable': false,
          'browser.cache.memory.enable': false,
          'browser.cache.offline.enable': false,
          'network.http.use-cache': false,
          'intl.accept_languages': 'en-GB',
        },
      },
    },
    {
      browserName: 'chrome',
      browserVersion: 'stable',
      cacheDir: '.wdio',
      'goog:chromeOptions': {
        args: (argv.debug ? [] : ['headless', 'disable-gpu']).concat([
          `--load-extension=${CHROME_PATH}`,
          '--accept-lang=en-GB',
          '--no-sandbox',
          '--window-size=1024,768',
        ]),
      },
    },
    {
      browserName: 'safari',
      webSocketUrl: true,
      'safari:experimentalWebSocketUrl': true,
      'safari:automaticInspection': false,
    },
  ].filter((capability) => argv.target.includes(capability.browserName)),
  onPrepare: async (config, capabilities) => {
    if (argv.clean) {
      rmSync(WEB_EXT_PATH, { recursive: true, force: true });
    }

    try {
      for (const capability of capabilities) {
        switch (capability.browserName) {
          case 'firefox': {
            buildForFirefox();
            break;
          }
          case 'chrome': {
            buildForChrome();
            break;
          }
          case 'safari': {
            buildForSafari();
            break;
          }
        }
      }

      // Safari 26's safaridriver does not implement the BiDi webExtension module,
      // so we use the classic POST /session/<id>/webextension endpoint. The driver
      // never exposes the safari-web-extension://<UUID> origin in session state,
      // so run it with --diagnose and parse the log for the origin after install.
      if (argv.target.includes('safari')) {
        process.env.WDIO_SKIP_DRIVER_SETUP = '1';
        process.env.SAFARIDRIVER_START_MS = String(Date.now());
        safariDriverProcess = spawn('safaridriver', [`--port=${SAFARIDRIVER_PORT}`, '--diagnose'], {
          stdio: 'ignore',
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setupTestPage(PAGE_PORT);
    } catch (e) {
      console.error('Error while preparing test environment', e);
      process.exit(1);
    }
  },
  onComplete: () => {
    if (safariDriverProcess) {
      safariDriverProcess.kill();
      safariDriverProcess = null;
    }
  },
  before: async (capabilities, specs, browser) => {
    try {
      if (capabilities.browserName === 'firefox') {
        const extension = readFileSync(FIREFOX_PATH);
        await browser.installAddOn(extension.toString('base64'), true);

        // Get the extension ID from extensions settings page
        await browser.url('about:debugging#/runtime/this-firefox');

        const url = (await $('>>>a.qa-manifest-url').getProperty('href')).replace(
          'manifest.json',
          'pages',
        );

        setExtensionBaseUrl(url);
      }

      // Disable cache for Chrome to avoid caching issues
      if (capabilities.browserName === 'chrome') {
        await browser.sendCommand('Network.setCacheDisabled', {
          cacheDisabled: true,
        });

        // Get the extension ID from extensions settings page
        await browser.url('chrome://extensions');

        const extensionId = await $('>>>extensions-item').getAttribute('id');
        setExtensionBaseUrl(`chrome-extension://${extensionId}/pages`);

        // Enable developer mode for reloading extension
        await $('>>>#devMode').click();
        await browser.pause(2000);
      }

      if (capabilities.browserName === 'safari') {
        // Run a watchdog that dismisses system-level confirmation prompts
        // (SecurityAgent, UserNotificationCenter) that can block safaridriver's
        // extension-install call indefinitely on fresh macOS installs.
        const watchdog = spawn(
          'osascript',
          [
            '-e',
            `repeat 60 times
               repeat with procName in {"SecurityAgent", "UserNotificationCenter", "CoreServicesUIAgent"}
                 try
                   tell application "System Events" to tell process procName
                     repeat with w in windows
                       try
                         repeat with btn in (buttons of w)
                           try
                             set bn to name of btn as text
                             if bn is in {"Allow", "Enable", "Trust", "OK", "Continue"} then
                               click btn
                             end if
                           end try
                         end repeat
                       end try
                     end repeat
                   end tell
                 end try
               end repeat
               delay 1
             end repeat`,
          ],
          { stdio: 'ignore', detached: true },
        );

        try {
          await safariDriverRequest(browser, 'POST', '/webextension', {
            type: 'path',
            path: SAFARI_PATH,
          });
        } finally {
          watchdog.kill();
        }

        // Trigger the extension on a real page so Safari prompts for permission.
        await browser.navigateTo(PAGE_URL);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        allowSafariExtensionPermission();

        // Reload so the content script runs and safaridriver logs the
        // safari-web-extension://<UUID> origin we need for extension pages.
        await browser.navigateTo(PAGE_URL);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const startMs = Number(process.env.SAFARIDRIVER_START_MS) || 0;
        const logPath = await findSafariDriverLog(startMs);
        if (!logPath) {
          throw new Error('safaridriver diagnose log not found');
        }

        const log = readFileSync(logPath, 'utf8');
        const match = log.match(/safari-web-extension:\/\/([0-9a-f-]+)/i);
        if (!match) {
          throw new Error('Could not discover safari-web-extension UUID from diagnose log');
        }

        setExtensionBaseUrl(`safari-web-extension://${match[1]}/pages`);
      }

      const SETTINGS_PAGE_URL = getExtensionPageURL('settings');

      // Modify browser.url
      browser.overwriteCommand('url', async function (fn, ...args) {
        // Generate the target url for extension pages using `ghostery:` protocol
        if (args[0].startsWith('ghostery:')) {
          const pageArgs = args[0].split(':').slice(1);
          args[0] = getExtensionPageURL(...pageArgs);
        }

        const targetUrl = args[0];

        // Force full reload when navigating to:
        // * PAGE_URL - testing page for clearing cached version of page
        // * SETTINGS_PAGE_URL - to reload the page completely so it loads the main privacy section
        if (targetUrl === PAGE_URL || targetUrl === SETTINGS_PAGE_URL) {
          await fn.call(this, 'about:blank');
        }

        // Load the target url
        const result = await fn.call(this, ...args);

        // Wait until body contents is not empty
        if (targetUrl !== 'about:blank') {
          // At first add a small pause to ensure that the navigation has started
          // and the previous page is unloaded
          await browser.pause(100);

          // Then wait until the page is fully loaded by checking
          // if body has any child elements
          await browser.waitUntil(async () => (await $$('body > *').getElements()).length > 0, {
            timeout: 10000,
            timeoutMsg: `Page did not load: ${targetUrl}`,
            interval: 200,
          });
        }

        return result;
      });
    } catch (e) {
      console.error('Error while setting up test environment', e);

      // close the browser session
      await browser.deleteSession();

      // send a signal to the parent process to stop the tests
      process.kill(process.pid, 'SIGTERM');
    }
  },
};
