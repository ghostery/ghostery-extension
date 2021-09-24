importScripts('../vendor/tldts/index.umd.min.js'); // exports `tldts`
importScripts('../vendor/@cliqz/adblocker/adblocker.umd.min.js'); // exports `adblocker`

const { parse } = tldts;
const { FiltersEngine } = adblocker;

let AdsEngine;

async function injectStylesWebExtension(
  styles,
  {
    tabId,
    frameId,
    allFrames = false,
  }
) {
  // Abort if stylesheet is empty.
  if (styles.length === 0) {
    return;
  }

  // Proceed with stylesheet injection.
  return new Promise((resolve) => {
    const target = {
      tabId,
    };

    if (frameId) {
      target.frameIds = [frameId];
    } else {
      target.allFrames = allFrames;
    }

    chrome.scripting.insertCSS({
      css: styles,
      origin: 'USER',
      target,
    }, () => resolve);
  });
}

// copied from https://github.com/cliqz-oss/adblocker/blob/0bdff8559f1c19effe278b8982fb8b6c33c9c0ab/packages/adblocker-webextension/adblocker.ts#L297
function adblockerOnMessage(msg, sender, sendResponse) {
  const promises = [];

  if (msg.action === 'getCosmeticsFilters') {
    // Extract hostname from sender's URL
    const { url = '', frameId } = sender;
    const parsed = parse(url);
    const hostname = parsed.hostname || '';
    const domain = parsed.domain || '';

    // Once per tab/page load we inject base stylesheets. These are always
    // the same for all frames of a given page because they do not depend on
    // a particular domain and cannot be cancelled using unhide rules.
    // Because of this, we specify `allFrames: true` when injecting them so
    // that we do not need to perform this operation for sub-frames.
    if (frameId === 0 && msg.lifecycle === 'start') {
      const { active, styles } = AdsEngine.getCosmeticsFilters({
        domain,
        hostname,
        url,

        classes: msg.classes,
        hrefs: msg.hrefs,
        ids: msg.ids,

        // This needs to be done only once per tab
        getBaseRules: true,
        getInjectionRules: false,
        getExtendedRules: false,
        getRulesFromDOM: false,
        getRulesFromHostname: false,
      });

      if (active === false) {
        return;
      }

      promises.push(
        injectStylesWebExtension(styles, {
          tabId: sender.tab.id,
          allFrames: true,
        }),
      );
    }

    // Separately, requests cosmetics which depend on the page it self
    // (either because of the hostname or content of the DOM). Content script
    // logic is responsible for returning information about lists of classes,
    // ids and hrefs observed in the DOM. MutationObserver is also used to
    // make sure we can react to changes.
    {
      const { active, styles, scripts, extended } = AdsEngine.getCosmeticsFilters({
        domain,
        hostname,
        url,

        classes: msg.classes,
        hrefs: msg.hrefs,
        ids: msg.ids,

        // This needs to be done only once per frame
        getBaseRules: false,
        getInjectionRules: msg.lifecycle === 'start',
        getExtendedRules: msg.lifecycle === 'start',
        getRulesFromHostname: msg.lifecycle === 'start',

        // This will be done every time we get information about DOM mutation
        getRulesFromDOM: msg.lifecycle === 'dom-update',
      });

      if (active === false) {
        return;
      }

      promises.push(
        injectStylesWebExtension(styles, { tabId: sender.tab.id, frameId }),
      );

      // Inject scripts from content script
      if (scripts.length !== 0) {
        sendResponse({
          active,
          extended,
          scripts,
          styles: '',
        });
      }
    }
  }

  return promises;
}

(async function () {
  AdsEngine = await FiltersEngine.fromLists(fetch, [
    'https://easylist.to/easylist/easylist.txt'
  ]);
})();
