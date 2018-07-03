import * as utils from './utils';
import conf from '../classes/Conf';
import globals from '../classes/Globals';

// ID of Ghostery-perf extension
const RECEIVER_ID = 'pdlmemohjlhncchohlaeifdmbjbngcld';
let PORT;
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (sender.id === RECEIVER_ID) {
    	const {name} = request;
    	if(name === 'perfReady') {
    		sendResponse(_reportStaticInfo());
    		PORT = chrome.runtime.connect(RECEIVER_ID);
    		return true;
    	}
    }

    return false;
});

function _reportStaticInfo() {
	let gb;
	let hasOnes = false;
	let hasZeros = false;
	Object.keys(conf.selected_app_ids).forEach(key => {
		if(conf.selected_app_ids[key] === 1) {
			hasOnes = true;
		}
		if(conf.selected_app_ids[key] === 0) {
			hasZeros = true;
		}
	});
	gb = (hasOnes && hasZeros) ? 2 : hasOnes ? 1 : 0;
	return { name: 'perfInfo', 
		ghostery_version: chrome.runtime.getManifest().version,
		 
		at: conf.enable_anti_tracking ? "1" : "0",
		ab: conf.enable_ad_block ? "1" : "0",
		sb: conf.enable_smart_block ? "1" : "0",
		gb: gb,
		gp: globals.SESSION.paused_blocking 
	};
}

function _report(perfEntry, data) {
	if (PORT) {
		const report = {
			name: 'perfData', startTime: perfEntry.startTime, duration: perfEntry.duration, handler: data.handler, page_url: data.page_url, url: data.url
		};
		PORT.postMessage(report);
	}
}

/**
 * @namespace BackgroundUtils
 */
/**
 * Set the start mark
 * @param  {string} name name of the mark, should be unique
 */
export function perfBegin(name) {
	console.log('PERF BEGIN CALLED FOR', name);
	window.performance.mark(`BEGIN_${name}`);
}
/**
 * Set the end mark and measure the duration.
 * @param  {string} name name of the mark
 * @return {number}      duration
 */
export function perfEnd(name, data) {
	let entry = { name: `BEGIN_${name}`, startTime: 0, duration: 0 };
	const p = window.performance.getEntriesByName(`BEGIN_${name}`, 'mark') || [];
	if (p && p.length) {
		console.log('BEGIN MARK WAS FOUND FOR', name);
		window.performance.mark(`END_${name}`);
		window.performance.measure(name, `BEGIN_${name}`, `END_${name}`);

		const measures = window.performance.getEntriesByName(name, 'measure') || [];
		if (measures && measures.length) {
			entry = measures[0];
			if (entry && data) {
				data.handler = name;
				_report(entry, data);
			}
		} else {
			console.log('BAD MEASURE');
		}
	} else {
		console.log('BEGIN MARK WAS NOT FOUND FOR', name);
	}
	window.performance.clearMarks(`BEGIN_${name}`);
	window.performance.clearMarks(`END_${name}`);

	window.performance.clearMeasures(name);
	return entry;
}

