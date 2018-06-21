import * as utils from './utils';

//ID of Ghostery-perf extension
const RECEIVER_ID = "pdlmemohjlhncchohlaeifdmbjbngcld";
let PORT = chrome.runtime.connect(RECEIVER_ID);

function _report(perfEntry, data) {
	try {
		if(!PORT) {
			PORT = chrome.runtime.connect(RECEIVER_ID);
		} 
	} catch(e) {
		console.log("Failed to connect", e);
		PORT = undefined;
	}

	if(PORT) {
		const report = {name: 'perfData', startTime: perfEntry.startTime, duration: perfEntry.duration, handler: data.handler, page_url: data.page_url, url: data.url};
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
	console.log("PERF BEGIN CALLED FOR", name);
	window.performance.mark(`BEGIN_${name}`);
}
/**
 * Set the end mark and measure the duration.
 * @param  {string} name name of the mark
 * @return {number}      duration
 */
export function perfEnd(name, data) {
	let entry = {name: `BEGIN_${name}`, startTime: 0, duration: 0};
	const p = window.performance.getEntriesByName(`BEGIN_${name}`, 'mark') || [];
	if (p && p.length) {
		console.log("BEGIN MARK WAS FOUND FOR", name);
		window.performance.mark(`END_${name}`);
		window.performance.measure(name, `BEGIN_${name}`, `END_${name}`);

		const measures = window.performance.getEntriesByName(name, 'measure') || [];
		if (measures && measures.length) {
			entry = measures[0];
			if(entry && data) {
				data.handler = name;
				_report(entry, data);
			} 
		} else {
			console.log("BAD MEASURE");
		}
	} else {
		console.log("BEGIN MARK WAS NOT FOUND FOR", name);
	}
	window.performance.clearMarks(`BEGIN_${name}`);
	window.performance.clearMarks(`END_${name}`);

	window.performance.clearMeasures(name);
	return entry;
}

