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

const index = new Map();
for (const scriptlet of scriptlets) {
  index.set(scriptlet.name, scriptlet);
  for (const name of scriptlet.aliases || []) {
    index.set(name, scriptlet);
  }
}

console.log(`
/*******************************************************************************

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
  .filter(scriptlet => scriptlet.name.endsWith('.js'))
  .map((scriptlet) => {
    const allDependencies = new Set();

    const addDeps = (aScriptlet) => {
      for (const dep of aScriptlet.dependencies || []) {
        allDependencies.add(dep);
        const bScriptlet = index.get(dep);
        addDeps(bScriptlet);
      }
    };

    addDeps(scriptlet);

    const deps = [...allDependencies].reverse().map((dep) => index.get(dep).fn);

    return `
scriptlets['${scriptlet.name}'] = {
func: function (...args) {
const scriptletGlobals = {};
${deps.map((dep) => dep.toString()).join('\n')}
${scriptlet.fn.toString()};
${scriptlet.fn.name}(...args);
},
aliases: ${JSON.stringify(scriptlet.aliases || [])},
${scriptlet.world ? `world: '${scriptlet.world}',` : '' }
requiresTrust: ${scriptlet.requiresTrust || false},
};
`;
  })
  .join('\n')}

export default scriptlets;
`);
