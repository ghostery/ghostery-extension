import path from 'node:path';
import url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const DEBUG = process.env.DEBUG;

export const config = {
  specs: ['specs/**/*.js'],
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        args: (DEBUG ? [] : ['headless', 'disable-gpu']).concat([
          `--load-extension=${path.join(__dirname, '..', '..', 'dist')}`,
          '--disable-search-engine-choice-screen',
        ]),
      },
    },
  ],
  injectGlobals: false,
  reporters: ['spec'],
  logLevel: DEBUG ? 'trace' : 'error',
  mochaOpts: {
    timeout: DEBUG ? 24 * 60 * 60 * 1000 : 10 * 1000,
  },
};
