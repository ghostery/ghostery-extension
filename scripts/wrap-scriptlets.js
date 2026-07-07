import scriptlets from '@ghostery/scriptlets';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTFILE = join(
  dirname(fileURLToPath(import.meta.url)),
  '../src/rule_resources/scriptlets.js',
);

const __CALLEE__ = function () {};

function handleIsolatedContext(scriptletGlobals = {}, ...args) {
  /* __CALLEE__ */

  const markers = (globalThis[scriptletGlobals.__secret] ??= new Set());
  const key = JSON.stringify([scriptletGlobals.__funcName, args]);

  if (markers.has(key)) {
    return;
  }

  markers.add(key);

  return __CALLEE__(scriptletGlobals, ...args);
}

function handleMainContext(scriptletGlobals = {}, ...args) {
  /* __CALLEE__ */

  const key = JSON.stringify([scriptletGlobals.__funcName, args]);

  // ** Uncomment the following line to test the handler **
  // debugger

  // Check if the script is already executed:
  if (Number.isSafeInteger(scriptletGlobals.__secret, key) === true) {
    return;
  }

  // Check if the trap is already installed by other scripts:
  if (Number.isSafeInteger(scriptletGlobals.__secret) === true) {
    // Command to add the key into the list.
    Number.isSafeInteger(scriptletGlobals.__secret, key);
  } else {
    const storage = new Set([key]);
    const isSafeIntegerSign = Function.prototype.toString.call(Number.isSafeInteger);
    const toStringSign = Function.prototype.toString.call(Function.prototype.toString);

    const isSafeIntegerProxy = new Proxy(Number.isSafeInteger, {
      apply(target, thisArg, argArray) {
        if (argArray[0] === scriptletGlobals.__secret) {
          if (argArray.length === 1) {
            return true;
          }

          if (typeof argArray[1] === 'string') {
            const result = storage.has(argArray[1]);
            storage.add(argArray[1]);

            return result;
          }
        }

        return Reflect.apply(target, thisArg, argArray);
      },
    });

    // Patch `Function.prototype.toString.call`
    const toStringProxy = new Proxy(Function.prototype.toString, {
      apply(target, thisArg, argArray) {
        if (thisArg === isSafeIntegerProxy) {
          return isSafeIntegerSign;
        } else if (thisArg === toStringProxy) {
          return toStringSign;
        }

        return Reflect.apply(target, thisArg, argArray);
      },
    });

    Object.defineProperty(Number, 'isSafeInteger', {
      value: isSafeIntegerProxy,
      configurable: true,
      enumerable: false,
      writable: true,
    });
    Object.defineProperty(Function.prototype, 'toString', {
      value: toStringProxy,
      configurable: true,
      enumerable: false,
      writable: true,
    });
  }

  return __CALLEE__(scriptletGlobals, ...args);
}

function replacer(key, value) {
  if (typeof value === 'function') {
    return '__FUNCTION__';
  }

  return value;
}

// String.prototype.replace does handle dollar sign specially and
// this function removes the complexity
function replaceStringWithDollarSign(str, a, b) {
  const index = str.indexOf(a);
  if (index === -1) {
    return str;
  }

  return str.slice(0, index) + b + str.slice(index + a.length);
}

const props = Object.entries(scriptlets).map(function ([key, details]) {
  // Grab the proper handler and replace `__FUNCTION_LOCATOR__` with actual function
  const handler = (
    details.world === 'ISOLATED' ? handleIsolatedContext : handleMainContext
  ).toString();
  const source = replaceStringWithDollarSign(
    handler.toString(),
    '/* __CALLEE__ */',
    `const __CALLEE__ = ${details.func.toString()}`,
  );

  // Use replacer to set `__FUNCTION_LOCATOR__` and put the function source
  return `"${key}": ${replaceStringWithDollarSign(JSON.stringify(details, replacer, 2), '"__FUNCTION__"', source)}`;
});

writeFileSync(
  OUTFILE,
  `export default {
  ${props.join(',\n')}
}`,
  'utf8',
);
