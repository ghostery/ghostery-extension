const COOKIE_DOMAIN = '.ghosterystage.com';
const COOKIE_URL = 'https://ghosterystage.com';
const COOKIE_DURATION = 60 * 60 * 24 * 90; // 90 days in seconds

export async function get(name) {
  const cookie = await chrome.cookies.get({ url: COOKIE_URL, name });
  return cookie || null;
}

export async function set(name, value, durationInSec = COOKIE_DURATION) {
  await chrome.cookies[value !== undefined ? 'set' : 'remove']({
    url: COOKIE_URL,
    domain: COOKIE_DOMAIN,
    path: '/',
    name,
    value,
    expirationDate: Date.now() / 1000 + durationInSec,
  });
}
