const start = Date.now();
let loadTime = 0;

window.addEventListener('load', () => {
  loadTime = Date.now() - start;
  chrome.runtime.sendMessage({ action: "updateTabStats", args: [{ loadTime }]});
});
