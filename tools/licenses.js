/**
 * License Fetcher
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import fs from 'node:fs';
import checker from 'license-checker';

const IGNORED_PACKAGES = ['ghostery-common', '@types/'];

const template = (packages) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Licenses</title>
    <style>
      html {
        font-family: -apple-system,
          BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
          sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 14px;
      }

      body {
        max-width: 480px;
        margin: 1em;
      }

      pre {
        white-space: break-spaces;
      }
    </style>
  </head>
  <body>
    <h1>Licenses</h1>
    ${packages
      .map(
        (pkg) => `
      <h2>${pkg.name}</h2>
      <ul>
        ${
          pkg.publisher
            ? `<li><label>Publisher: </label>${pkg.publisher}</li>`
            : ''
        }
        ${pkg.email ? `<li><label>Email: </label>${pkg.email}</li>` : ''}
        ${
          pkg.repository
            ? `<li><label>Repository: </label>${pkg.repository}</li>`
            : ''
        }
        ${pkg.url ? `<li><label>URL: </label>${pkg.url}</li>` : ''}
        ${
          pkg.licenses ? `<li><label>License: </label>${pkg.licenses}</li>` : ''
        }
      </ul>
      ${pkg.licenseText ? `<pre>${pkg.licenseText}</pre>` : ''}
    `,
      )
      .join('')}
  </body>
</html>
`;

if (!fs.existsSync('./node_modules') && fs.existsSync('../node_modules')) {
  fs.symlinkSync('../node_modules', './node_modules', 'dir');
}

// Build list of licenses
checker.init(
  {
    start: process.cwd(),
    production: true,
    excludePrivatePackages: true,
  },
  (err, licenseJSON) => {
    if (err) {
      console.error('License Fetcher error:', err);
      return;
    }

    console.log('Generating licenses.html');

    const output = Object.entries(licenseJSON)
      .filter(
        ([packageName]) =>
          !IGNORED_PACKAGES.some((name) => packageName.startsWith(name)),
      )
      .map(([name, data]) => ({
        name,
        ...data,
        licenseText:
          data.licenseFile && fs.readFileSync(data.licenseFile, 'utf8'),
      }));

    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }

    fs.writeFileSync('./dist/licenses.html', template(output));
    fs.unlinkSync('./node_modules');

    console.log('Completed licenses.html');
  },
);
