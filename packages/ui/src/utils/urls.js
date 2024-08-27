// TODO: remove this when @ghostery/ui is moved to the extension source
export const GHOSTERY_DOMAIN = chrome.runtime.getManifest().debug
  ? 'ghosterystage.com'
  : 'ghostery.com';
