import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import decompress from 'decompress';

export const sleep = (ms) => new Promise((r) => setTimeout(() => r(), ms));

export const switchToWindowWithUrl = async (context, url) => {
  const pages = context.pages();
  for (const page of pages) {
    if (page.url() === url) {
      await page.bringToFront();
      return page;
    }
  }
  throw new Error(`No window with URL: ${url}`);
};

export const downloadAddon = async (url) => {
  if (!url) {
    console.error('INFO: No extension selected.');
    return;
  }
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const tempPath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'extension-benchmarks'),
  );

  console.log('LOG: Addon temp path:', tempPath);

  let extension = url.endsWith('xpi') ? '.xpi' : '.zip';
  if (url.endsWith('zip')) {
    console.log('LOG: ZIP file');
  } else if (url.endsWith('xpi')) {
    console.log('LOG: XPI file');
  }

  let addonFilePath = path.join(tempPath, `${hash}${extension}`);
  let addonPath = path.join(tempPath, hash);

  if (!fs.existsSync(addonFilePath)) {
    console.log('LOG: Downloading addon');
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(addonFilePath, buffer);
  }

  if (
    !fs.existsSync(addonPath) &&
    (url.endsWith('zip') || url.endsWith('xpi'))
  ) {
    console.log('LOG: Unpacking addon');
    await decompress(addonFilePath, addonPath);
  }

  console.log('LOG: Addon path:', addonPath);
  return addonPath;
};
