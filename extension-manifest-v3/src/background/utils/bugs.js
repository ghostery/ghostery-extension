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
import { parse } from 'tldts-experimental';
import rules from './rules.js';

export function getTrackerFromUrl(url, origin) {
  try {
    const bugId = isBug(url);
    let trackerId = null;
    let tracker = null;

    if (bugId) {
      const { bugs, apps } = rules.get('bugs');
      const appId = bugs[bugId].aid;
      const app = apps[appId];
      trackerId = app.trackerID;
      tracker = {
        id: app.trackerID,
        name: app.name,
        category: app.cat,
      };
    } else {
      const { domain } = parse(url);

      if (domain === origin) {
        return null;
      }

      trackerId = rules.get('tracker_domains')[domain];
    }

    if (trackerId) {
      if (rules.get('trackers')[trackerId]) {
        tracker = rules.get('trackers')[trackerId];
      }
      if (!tracker.category && tracker.category_id) {
        tracker.category = rules.get('categories')[tracker.category_id];
      }
      return tracker;
    }
  } catch (e) {
    return null;
  }

  return null;
}

function processUrl(src) {
  try {
    const res = new URL(src);
    return res;
  } catch (e) {
    return {
      protocol: '',
      hostname: '',
      pathname: '',
    };
  }
}

/**
 * Determine if web request qualifies as a bug.
 *
 * @param {string} 	src		 	url of the request
 * @return {int|boolean} 		bug id or false
 */
function isBug(src) {
  const db = rules.get('bugs');
  const processedSrc = processUrl(src.toLowerCase());
  let found = false;

  const path = processedSrc.pathname ? processedSrc.pathname.substring(1) : '';

  found =
    // pattern classification 2: check host+path hash
    matchesHost(db.patterns.host_path, processedSrc.hostname, path) ||
    // class 1: check host hash
    matchesHost(db.patterns.host, processedSrc.hostname) ||
    // class 3: check path hash
    matchesPath(path) ||
    // class 4: check regex patterns
    matchesRegex(processedSrc.host + processedSrc.pathname);

  return found;
}

/**
 * Determine if a path part of an url matches to a path property
 * of a node in an array of json nodes with paths.
 * @private
 *
 * @param {array} 	roots		array of nodes with paths
 * @param {string}	src_path	path part of a url to match
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function matchesHostPath(roots, src_path) {
  let root;
  let paths;
  let i;
  let j;

  for (i = 0; i < roots.length; i++) {
    root = roots[i];
    // eslint-disable-next-line no-prototype-builtins
    if (root.hasOwnProperty('$')) {
      paths = root.$;
      for (j = 0; j < paths.length; j++) {
        if (src_path.startsWith(paths[j].path)) {
          return paths[j].id;
        }
      }
    }
  }

  return false;
}

/**
 * Use host and path parts of a url to traverse database trie node
 * looking for matching parts. Reaching the leaf would yeild bug id.
 * @private
 *
 * @param {Object} 	root		trie node
 * @param {string}	src_host	host part of a url
 * @param {string}	src_path	path part of a url
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function matchesHost(root, src_host, src_path) {
  const host_rev_arr = src_host.split('.').reverse();
  const nodes_with_paths = [];
  let host_part;
  let node = root;
  let bug_id = false;

  for (let i = 0; i < host_rev_arr.length; i++) {
    host_part = host_rev_arr[i];
    // if node has domain, advance and try to update bug_id
    // eslint-disable-next-line no-prototype-builtins
    if (node.hasOwnProperty(host_part)) {
      // advance node
      node = node[host_part];
      // eslint-disable-next-line no-prototype-builtins
      bug_id = node.hasOwnProperty('$') ? node.$ : bug_id;

      // we store all traversed nodes that contained paths in case the final
      // node does not have the matching path
      // eslint-disable-next-line no-prototype-builtins
      if (src_path !== undefined && node.hasOwnProperty('$')) {
        nodes_with_paths.push(node);
      }

      // else return bug_id if it was found
    } else {
      // handle path
      if (src_path !== undefined) {
        return matchesHostPath(nodes_with_paths, src_path);
      }

      return bug_id;
    }
  }

  // handle path
  if (src_path !== undefined) {
    return matchesHostPath(nodes_with_paths, src_path);
  }

  return bug_id;
}

/**
 * Match a path part of a url against the path property of database patterns section.
 * @private
 *
 * @param {string} 	src_path	path part of an url
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function matchesPath(src_path) {
  const paths = rules.get('bugs').patterns.path;

  // NOTE: we re-add the "/" in order to match patterns that include "/"
  const srcPath = `/${src_path}`;

  const pathArr = Object.keys(paths);
  for (let i = 0; i < pathArr.length; i++) {
    const path = pathArr[i];
    if (srcPath.includes(path)) {
      return paths[path];
    }
  }

  return false;
}

/**
 * Match a url against a list of regular expression which are mapped to bug ids.
 * @private
 *
 * @param {string} 	src			a url to find a matching entry for
 * @return {int|boolean} 		bug id or false if the match was not found
 */
function matchesRegex(src) {
  const regexes = rules.get('bugs').patterns.regex;
  const bug_ids = Object.keys(regexes);
  for (let i = 0; i < bug_ids.length; i++) {
    const bug_id = bug_ids[i];
    if (typeof regexes[bug_id] === 'string') {
      regexes[bug_id] = new RegExp(regexes[bug_id], 'i');
    }
    if (regexes[bug_id].test(src)) {
      return +bug_id;
    }
  }

  return false;
}
