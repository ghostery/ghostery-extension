import globals from '../classes/Globals';

let IS_FIRST_PARTY_ISOLATION_ENABLED = false;
let IS_FIRST_PARTY_ISOLATION_TESTED = false;

function testForFirstPartyIsolation() {
	if (IS_FIRST_PARTY_ISOLATION_TESTED) {
		return;
	}
	try {
		chrome.cookies.getAll({
			domain: '',
		});
	} catch (e) {
		IS_FIRST_PARTY_ISOLATION_ENABLED = e.message.indexOf('firstPartyDomain') > -1;
	} finally {
		IS_FIRST_PARTY_ISOLATION_TESTED = true;
	}
}

function wrapDetails(args) {
	testForFirstPartyIsolation();

	const newArgs = {
		...args,
	};

	if (!newArgs.url) {
		newArgs.url = globals.COOKIE_URL;
	}

	if (IS_FIRST_PARTY_ISOLATION_ENABLED) {
		newArgs.firstPartyDomain = globals.GHOSTERY_ROOT_DOMAIN;
	}

	return newArgs;
}

function wrapFunction(func) {
	return details => (
		new Promise((resolve, reject) => {
			func(wrapDetails(details), (result) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
					return;
				}
				resolve(result);
			});
		})
	);
}

export const cookiesGet = wrapFunction(chrome.cookies.get.bind(chrome.cookies));
export const cookiesGetAll = wrapFunction(chrome.cookies.getAll.bind(chrome.cookies));
export const cookiesRemove = wrapFunction(chrome.cookies.remove.bind(chrome.cookies));
export const cookiesSet = wrapFunction(chrome.cookies.set.bind(chrome.cookies));

window.cookiesGet = cookiesGet;
