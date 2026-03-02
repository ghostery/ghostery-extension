import { pathToFileURL } from 'node:url';
import { resolve as pathResolve } from 'node:path';
import { existsSync } from 'node:fs';

const cwd = process.cwd();
const srcDir = pathResolve(cwd, 'src');

export async function resolve(specifier, context, defaultResolve) {
  // Resolve absolute imports, for instance:
  //
  // import { dummy } from '/utils/foo.js';
  // -->
  // import { dummy } from './src/utils/foo.js';
  if (specifier.startsWith('/')) {
    const relativePath = specifier.slice(1);
    const absolutePath = pathResolve(srcDir, relativePath);

    if (existsSync(absolutePath)) {
      const url = pathToFileURL(absolutePath);
      return {
        url: url.href,
        format: null,
        shortCircuit: true,
      };
    }
  }

  return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);

  if (result.format === 'module') {
    if (
      typeof result.source !== 'string' ||
      result.source.startsWith('#!') ||
      !result.source.includes('import.meta.glob')
    ) {
      return result;
    }
    // import.meta is defined per module and the shim has to be
    // injected right before the module loads. It's written
    // without line breaks to avoid generating source maps.
    result.source = 'import.meta.glob ??= function () {return [];};' + result.source;
  }

  return result;
}
