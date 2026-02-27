import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

import './init-chrome.js';

register('./scripts/setup/loader.js', pathToFileURL('./'));
