import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

import './init-chrome.js';

register('./tests/unit/setup/loader.js', pathToFileURL('./'));
