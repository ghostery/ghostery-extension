/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import path from 'node:path';
import url from 'node:url';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export function setupTestPage(port = 6789) {
  // Determine content type based on file extension using a lookup object
  const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  };

  const server = createServer((req, res) => {
    // Default to index.html if no specific file is requested
    const fileName = req.url === '/' ? 'index.html' : req.url.slice(1);
    const filePath = path.resolve(__dirname, fileName);

    try {
      // Prevent path traversal by ensuring filePath starts with baseDir
      if (filePath.startsWith(__dirname) && existsSync(filePath)) {
        const ext = path.extname(fileName).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const file = readFileSync(filePath);

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(file);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      }
    } catch (error) {
      console.error('Error serving test page:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  });

  // starts a simple http server locally on port 6789
  server.listen(port, '127.0.0.1', () => {
    console.log(`Testing page server listening on ${port} port.\n`);
  });
}

// Detect if this module is being run directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  setupTestPage();
}
