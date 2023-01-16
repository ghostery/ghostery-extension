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

const checker = require('license-checker');
const fs = require('fs');

const IGNORED_PACAKGES = [
  '@ghostery/libs',
  '@ghostery/ui',
  'ghostery-common',
  '@ghostery/extension-manifest-v2',
  '@ghostery/extension-manifest-v3',
  '@types/',
];

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
        (package) => `
			<h2>${package.name}</h2>
			<ul>
				${
          package.publisher
            ? `<li><label>Publisher: </label>${package.publisher}</li>`
            : ''
        }
				${package.email ? `<li><label>Email: </label>${package.email}</li>` : ''}
				${
          package.repository
            ? `<li><label>Repository: </label>${package.repository}</li>`
            : ''
        }
				${package.url ? `<li><label>URL: </label>${package.url}</li>` : ''}
				${
          package.licenses
            ? `<li><label>License: </label>${package.licenses}</li>`
            : ''
        }
			</ul>
			${package.licenseText ? `<pre>${package.licenseText}</pre>` : ''}
		`,
      )
      .join('')}
	</body>
</html>
`;

// Build list of licenses
checker.init(
  {
    start: '.',
    production: true,
    json: true,
    direct: false,
  },
  (err, licenseJSON) => {
    if (err) {
      console.error('License Fetcher error:', err);
      return;
    }

    console.log('Generating licenses.html');
    const output = {};

    Object.keys(licenseJSON).forEach((packageName) => {
      if (IGNORED_PACAKGES.some((name) => packageName.startsWith(name))) {
        return;
      }

      output[packageName] = {
        name: packageName,
        repository: licenseJSON[packageName].repository,
        licenses: licenseJSON[packageName].licenses,
        publisher: licenseJSON[packageName].publisher,
        url: licenseJSON[packageName].url,
        email: licenseJSON[packageName].email,
      };

      if (licenseJSON[packageName].licenseFile) {
        output[packageName].licenseText = fs.readFileSync(
          licenseJSON[packageName].licenseFile,
          { encoding: 'utf8', flag: 'r' },
        );
      }
    });

    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }

    fs.writeFileSync('./dist/licenses.html', template(Object.values(output)));
    console.log('Completed licenses.html');
  },
);
