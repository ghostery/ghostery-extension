import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import zlib from 'node:zlib';

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

  if (!fs.existsSync(addonPath) && url.endsWith('zip')) {
    console.log('LOG: Unpacking addon');
    fs.mkdirSync(addonPath);
    const unzip = zlib.createUnzip();
    const source = fs.createReadStream(addonFilePath);
    const destination = fs.createWriteStream(path.join(addonPath, 'addon'));

    source.pipe(unzip).pipe(destination);
  }

  console.log('LOG: Addon path:', addonPath);
  return addonPath;
};

// '/settings/index.html';

export const getExtensionUrl = async (pages, extensionPage, extensionUrl) => {
  for (const p of pages) {
    if (p.url().startsWith('chrome-extension://')) {
      extensionPage = p;
      await p.bringToFront();
      console.info(`INFO: Focused on tab with URL: ${p.url()}`);
      extensionUrl = p.url().split('/').slice(0, 4).join('/');
      break;
    }
  }

  return { extensionPage, extensionUrl };
};
