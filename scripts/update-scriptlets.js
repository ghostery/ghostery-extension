// To be run in Deno

const tagName = process.argv.includes('--tagName')
  ? process.argv[process.argv.findIndex((o) => o === '--tagName') + 1]
  : false;

if (!tagName) {
  throw new Error('pass argument --tagName <TAG_NAME>');
}

const { builtinScriptlets: scriptlets } = await import(
  `https://raw.githubusercontent.com/gorhill/uBlock/${tagName}/src/js/resources/scriptlets.js`
);

console.log(`/*******************************************************************************

    uBlock Origin - a comprehensive, efficient content blocker
    Copyright (C) 2019-present Raymond Hill

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/gorhill/uBlock

*/
const scriptlets = {};
${scriptlets
  .map((scriptlet) => {
    // Make full function
    const fnLiteral = scriptlet.fn.toString();
    if (fnLiteral.startsWith('class ')) {
      return fnLiteral;
    }

    // Extract function call name
    const callNameEndsAt = fnLiteral.indexOf('(');
    if (callNameEndsAt === -1) {
      return '';
    }
    const callName = fnLiteral.slice('function '.length, callNameEndsAt);

    // Handle aliases
    const names = [scriptlet.name];
    if (scriptlet.aliases !== undefined) {
      for (const alias of scriptlet.aliases) {
        names.push(alias);
      }
    }

    return `${fnLiteral}
const __${callName} = {
  callName: "${callName}",
  dependencies: ${JSON.stringify(scriptlet.dependencies || [])},
  fn: ${callName},
};
${names.map((name) => `scriptlets["${name}"] = __${callName};`).join('\n')}`;
  })
  .join('\n\n')}

export default scriptlets;`);
