export async function sendShowIframeMessage(tabId, url) {
  try {
    await chrome.tabs.sendMessage(
      tabId,
      { action: 'showIframe', url },
      { frameId: 0 },
    );
  } catch (e) {
    console.warn('Could not show iframe for tab', tabId, e);
  }
}
