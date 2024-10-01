import { browser, $ } from '@wdio/globals';

let extensionId = '';
export async function getExtensionId() {
  if (!extensionId) {
    await browser.url('chrome://extensions');

    const extension = await $('extensions-item:first-child');
    extensionId = await extension.getAttribute('id');
  }

  return extensionId;
}

export async function navigateToPage(page, file = 'index.html') {
  await browser.url(
    `chrome-extension://${await getExtensionId()}/pages/${page}/${file}`,
  );
}

export function getQAElement(qa) {
  return $(`[data-qa="${qa}"]`);
}
