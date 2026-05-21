export function detectConsentBanners() {
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const viewportArea = vw * vh;
  const MIN_AREA_RATIO = 0.15;
  const BUTTON_RX = /\b(?:accept all|reject all|accept (?:&|and) continue|accept cookies|reject cookies|manage (?:cookies|preferences|consent|options|choices)|save (?:preferences|choices|my choices)|do not sell(?: or share)?|customize my (?:choices|preferences)|agree (?:&|and) (?:continue|proceed)|your privacy choices|cookies and similar technologies|under state laws|state privacy (?:notice|choices|supplement)|us state supplement)\b/i;
  const CMP_IFRAME_RX = /(?:cdn\.privacy-mgmt\.com|sourcepoint\.com|cookielaw\.org|cookiebot\.com|consentcdn\.cookiebot\.com|usercentrics\.eu|app\.usercentrics\.eu|api\.consentmanager\.net|delivery\.consentmanager\.net|cdn\.consentmanager\.net|consent-pref\.trustarc\.com|sdk\.privacy-center\.org|consent\.faithlife\.com|consensu\.org|\/cmp(?:[?\/]|$))/i;
  const candidates = [];
  const all = document.querySelectorAll('body *');
  for (let i = 0; i < all.length; i++) {
    const el = all[i];
    const style = window.getComputedStyle(el);
    const pos = style.position;
    if (pos !== 'fixed' && pos !== 'sticky') continue;
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true, contentVisibilityAuto: true })) continue;
    } else {
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const opacity = parseFloat(style.opacity || '1');
      if (!(opacity >= 0.1)) continue;
    }
    const rect = el.getBoundingClientRect();
    if (rect.right <= 0 || rect.bottom <= 0 || rect.left >= vw || rect.top >= vh) continue;
    const area = rect.width * rect.height;
    if (!viewportArea || area / viewportArea < MIN_AREA_RATIO) continue;
    const elText = (el.innerText || '').slice(0, 4000);
    const innerIframe = el.querySelector('iframe');
    const innerIframeSrc = innerIframe ? (innerIframe.src || innerIframe.getAttribute('data-src') || '') : '';
    const matchedByText = BUTTON_RX.test(elText);
    const matchedByIframe = !!innerIframeSrc && CMP_IFRAME_RX.test(innerIframeSrc);
    if (!matchedByText && !matchedByIframe) continue;
    const zStr = style.zIndex;
    const z = zStr === 'auto' ? null : parseInt(zStr, 10);
    candidates.push({
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      cls: typeof el.className === 'string' ? el.className.slice(0, 100) : null,
      role: el.getAttribute('role') || null,
      ariaModal: el.getAttribute('aria-modal') || null,
      w: Math.round(rect.width),
      h: Math.round(rect.height),
      z: Number.isFinite(z) ? z : null,
      areaPct: Math.round((area / viewportArea) * 100),
      matchedBy: matchedByText ? 'text' : 'iframe-cmp',
      cmpIframeSrc: matchedByIframe ? innerIframeSrc.slice(0, 200) : null,
      textSample: elText.replace(/\s+/g, ' ').slice(0, 200),
    });
    if (candidates.length >= 5) break;
  }
  return { detected: candidates.length > 0, candidates };
}
