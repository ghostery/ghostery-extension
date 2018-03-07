/**
 * Ghostery Click2Play
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
module.exports = function (t) {
	let n,
		l = ''; Array.prototype.join; return l += '<!doctype html>\n<html>\n<head>\n\t<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n\t<style>\n\t\tbody {\n\t\t\tmargin: 0;\n\t\t\tpadding: 0;\n\t\t}\n\t\tp {\n\t\t\tmargin: 3px;\n\t\t\tfont-family: Helvetica, Arial, sans-serif;\n\t\t\tfont-size: 13px;\n\t\t}\n\t\ttable {\n\t\t\tborder-spacing: 0;\n\t\t\twidth: 100%;\n\t\t\theight: 100%;\n\t\t\ttext-align: center;\n\t\t\tvertical-align: middle;\n\t\t}\n\t\ttd {\n\t\t\tpadding: 0;\n\t\t}\n\t</style>\n</head>\n<body>\n\t<table>\n\t\t<tr>\n\t\t\t<td>\n\n\t\t\t\t', t.button ? l += `\n\n\t\t\t\t\t<a id="action-once" href="#" onclick="return false">\n\t\t\t\t\t\t<img id="ghostery-button" src="${(n = t.allow_once_src) == null ? '' : n}" title="${(n = t.allow_once_title) == null ? '' : n}">\n\t\t\t\t\t</a>\n\n\t\t\t\t` : (l += '\n\n\t\t\t\t\t', void 0 !== t.click2play_text && t.click2play_text && (l += `\n\t\t\t\t\t\t<p id="text">${(n = t.click2play_text) == null ? '' : n}</p>\n\t\t\t\t\t`), l += `\n\n\t\t\t\t\t<img id="ghostery-blocked" src="${(n = t.ghostery_blocked_src) == null ? '' : n}" title="${(n = t.ghostery_blocked_title) == null ? '' : n}">\n\n\t\t\t\t\t<a id="action-once" href="#" onclick="return false"><img src="${(n = t.allow_once_src) == null ? '' : n}" title="${(n = t.allow_once_title) == null ? '' : n}"></a>\n\n\t\t\t\t\t`, !1 === t.blacklisted && (l += `\n\t\t\t\t\t\t<a id="action-always" href="#" onclick="return false"><img src="${(n = t.allow_always_src) == null ? '' : n}" title="${(n = t.allow_always_title) == null ? '' : n}"></a>\n\t\t\t\t\t`), l += '\n\n\t\t\t\t'), l += '\n\n\t\t\t</td>\n\t\t</tr>\n\t</table>\n</body>\n</html>\n';
};
