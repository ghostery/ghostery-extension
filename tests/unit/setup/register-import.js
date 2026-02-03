import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./tests/unit/setup/loader.js', pathToFileURL('./'));
