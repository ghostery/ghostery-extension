/**
 * Comparing performance of webRequest handlers
 * of Ghostery, adblocker and antitracking
*/
console.log("AVAILABLE?", typeof self.localStorage, typeof self.indexedDB, typeof self.chrome, typeof self.storage);
let TOTAL_GH = 0;
let TOTAL_AD = 0;
let TOTAL_AN = 0;

let PAGE_TOTAL_AD = 0;
let	PAGE_TOTAL_AN = 0;
let	PAGE_TOTAL_GH = 0;

let AD2G_MAX_RATIO = 0;
const AD2G_MAX_RATIO_TRESHOLD = 10;

let AN2G_MAX_RATIO = 0;
const AN2G_MAX_RATIO_TRESHOLD = 10;

let G2AD_MAX_RATIO = 0;
const G2AD_MAX_RATIO_TRESHOLD = 1;

let G2AN_MAX_RATIO = 0;
const G2AN_MAX_RATIO_TRESHOLD = 1;

let PAGE_URL = "";

let PAGE_LEVEL = true;
let REQUEST_LEVEL = false;

const AN_TOP = {duration: 0, url: ""};
const AD_TOP = {duration: 0, url: ""};
const GH_TOP = {duration: 0, url: ""};

//Ghostery handlers
const GH_HANDLERS = [
	'ghostery.onBeforeRequest',
	'ghostery.onHeadersReceived'
];
//Adblocker handlers
const AD_HANDLERS = [
	'adblocker'
];
//Antitracking handlers 
const AN_HANDLERS = [
'antitracking.onBeforeRequest',
'antitracking.onBeforeSendHeaders',
'antitracking.onHeadersReceived',
'redirectTagger.checkRedirect',
'pageLogger.logMainDocument',
'skipInvalidSource',
'skipInternalProtocols',
'checkSameGeneralDomain',
'cancelRecentlyModified',
'subdomainChecker.checkBadSubdomain',
'pageLogger.attachStatCounter',
'pageLogger.logRequestMetadata',
'checkExternalBlocking',
'tokenExaminer.examineTokens',
'tokenTelemetry.extractKeyTokens',
'domChecker.checkDomLinks',
'domChecker.parseCookies',
'tokenChecker.findBadTokens',
'checkSourceWhitelisted',
'checkShouldBlock',
'isQSEnabled',
'blockRules.applyBlockRules',
'applyBlock',

'cookieContext.assignCookieTrust',
'redirectTagger.confirmRedirect',
'checkIsMainDocument',
'skipInvalidSource',
'skipInternalProtocols',
'checkSameGeneralDomain',
'subdomainChecker.checkBadSubdomain',
'pageLogger.attachStatCounter',
'catchMissedOpenListener',
'overrideUserAgent',
'checkHasCookie',
'checkIsCookieWhitelisted',
'cookieContext.checkCookieTrust',
'cookieContext.checkVisitCache',
'cookieContext.checkContextFromEvent',
'shouldBlockCookie',
'blockCookie',

'antitracking.onHeadersReceived',
'checkMainDocumentRedirects',
'skipInvalidSource',
'skipInternalProtocols',
'skipBadSource',
'checkSameGeneralDomain',
'redirectTagger.checkRedirectStatus',
'pageLogger.attachStatCounter',
'logResponseStats',
'checkSetCookie',
'shouldBlockCookie',
'checkIsCookieWhitelisted',
'cookieContext.checkCookieTrust',
'cookieContext.checkVisitCache',
'cookieContext.checkContextFromEvent',
'blockSetCookie'
];
/**
 * Reset all flags and report results
 * once page url changes. If not - does not do anything
 * @param  {Object} data 
  */
function Reset(data) {
	let retVal;
	const {page_url} = data;
	if(page_url && (PAGE_URL !== page_url)) {
		console.log(`\r\nOLD PAGE: ${PAGE_URL} NEW PAGE: ${page_url}`);
		if(PAGE_LEVEL) {
			const INCREASE = (PAGE_TOTAL_GH + PAGE_TOTAL_AD + PAGE_TOTAL_AN)/PAGE_TOTAL_GH;
			retVal = { INCREASE, PAGE_TOTAL_GH, GH_TOP, PAGE_TOTAL_AD, AD_TOP, PAGE_TOTAL_AN, AN_TOP };
			console.log(`
GN_LATENCY: ${PAGE_TOTAL_GH}
GH_TOP: ${GH_TOP.duration}, ${GH_TOP.url}
AD_LATENCY: ${PAGE_TOTAL_AD}
AD_TOP: ${AD_TOP.duration}, ${AD_TOP.url}
AN_LATENCY: ${PAGE_TOTAL_AN}
AN_TOP: ${AN_TOP.duration}, ${AN_TOP.url}

Increase: ${INCREASE} times

`);
		}
		GH_TOP.duration = 0;
		GH_TOP.url = 0;

		AD_TOP.duration = 0;
		AD_TOP.url = 0;

		AN_TOP.duration = 0;
		AN_TOP.url = 0;

		PAGE_URL = page_url;
		TOTAL_AD = 0;
		TOTAL_AN = 0;
		TOTAL_GH = 0;
		PAGE_TOTAL_AD = 0;
		PAGE_TOTAL_AN = 0;
		PAGE_TOTAL_GH = 0;
		AD2G_MAX_RATIO = 0;
		AN2G_MAX_RATIO = 0;
		G2AD_MAX_RATIO = 0;
		G2AN_MAX_RATIO = 0;
	}

	return retVal;
}
/**
 * Calculates total time spent in a group of handlers 
 * belonging to different modules in tht time the page is loading 
 * @param  {string} name     handler name
 * @param  {string} url  	 url of the request
 * @param  {number} duration duration  in ms[description]
 */
function Compare(data) {
	const retVal = Reset(data);
	const {handler, url, duration} = data;

	if(GH_HANDLERS.includes(handler)) {
		PAGE_TOTAL_GH += duration; 
		if(GH_TOP.duration < duration) {
			GH_TOP.duration = duration;
			GH_TOP.url = url; 
		}
	} else if (AD_HANDLERS.includes(handler)) {
		PAGE_TOTAL_AD += duration; 
		TOTAL_AD += duration;
		if(AD_TOP.duration < duration) {
			AD_TOP.duration = duration;
			AD_TOP.url = url; 
		}

	} else if(AN_HANDLERS.includes(handler)) {
		PAGE_TOTAL_AN += duration; 
		TOTAL_AN += duration;
		if(AN_TOP.duration < duration) {
			AN_TOP.duration = duration;
			AN_TOP.url = url; 
		}
	} 

	return retVal;
}
const DB_NAME = 'perfDb';
const NAVIGATION_STORE = 'navigation';
//Delete database on startup
// const oldDb = self.indexedDB.deleteDatabase('perfDB');
// oldDb.onsuccess = function () {
//     console.log("Deleted database successfully");

	let db;
	const req = self.indexedDB.open(DB_NAME, 1);
	req.onsuccess = (e) => {
		console.log('successfully opened db', e);
		db = e.target.result;
	};
	req.onupgradeneeded = (e) => {
		console.log('successfully upgraded db', e);
		db = e.target.result;

		const objectStore = db.createObjectStore(NAVIGATION_STORE, { keyPath: 'page_url' });
	};
	req.onerror = (e) => {
		console.log('database error', e);
	};

	self.onmessage = (e) => {
		const {name} = e.data;
		if(name === 'perfData') {
			const retVal = Compare(e.data);
			if(retVal) {
				console.log("WRITING TO DATABASE");
				const {page_url} = e.data;
			 	const transaction = db.transaction(NAVIGATION_STORE, 'readwrite');
			 	const objectStore = transaction.objectStore(NAVIGATION_STORE);
			 	if(page_url) {
			 		const request = objectStore.get(page_url);
					request.onerror = function (event) {
					  console.log('GET ERROR!!!!!!!!!!');
					};
					request.onsuccess = function (event) {
					  // Get the old value that we want to update
						let dbData = event.target.result;
						if (!dbData || !dbData.dataArray) {
							dbData = { page_url: page_url, dataArray: [retVal] };
						} else {
							// update the value(s) in the object that you want to change
							dbData.dataArray.push(retVal);
						}

						// Put this updated object back into the database.
						const requestUpdate = objectStore.put(dbData);
						requestUpdate.onerror = function (event) {
						    console.log('PUT ERROR!!!!!!!!!!');
						};
						requestUpdate.onsuccess = function (event) {
							console.log("Successfully updated data with", page_url, retVal);
						};
					};
				} else {
					//console.log("NO PAGE URL", e);
				}
			};
		} else if(name === 'exportData') {
		    const trans = db.transaction(NAVIGATION_STORE, 'readonly');
		    const store = trans.objectStore(NAVIGATION_STORE);
		    const items = [];
		 
		    trans.oncomplete = function(evt) { 
		    	console.log("ITEMS", items);
		    	self.postMessage({origin: 'perf-worker', name:'exportPerfData', message: items});
		    };
		 
		    var cursorRequest = store.openCursor();
		 
		    cursorRequest.onerror = function(error) {
		        console.log('CURSOR ERROR', error);
		    };
		 
		    cursorRequest.onsuccess = function(evt) {                    
		        var cursor = evt.target.result;
		        if (cursor) {
		            items.push(cursor.value);
		            cursor.continue();
		        }
		    };
		}
	}
//};
// oldDb.onerror = function () {
//     console.log("Couldn't delete database");
// };
// oldDb.onblocked = function () {
//     console.log("Couldn't delete database due to the operation being blocked");
// };



