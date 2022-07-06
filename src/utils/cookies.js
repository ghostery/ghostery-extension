import globals from '../classes/Globals';
import { decodeJwt } from './common';

let IS_FIRST_PARTY_ISOLATION_ENABLED = false;
let IS_FIRST_PARTY_ISOLATION_TESTED = false;

async function testForFirstPartyIsolation() {
	if (IS_FIRST_PARTY_ISOLATION_TESTED) {
		return;
	}
	await new Promise((resolve) => {
		chrome.cookies.getAll({
			domain: '',
		}, () => {
			if (chrome.runtime.lastError) {
				IS_FIRST_PARTY_ISOLATION_ENABLED = chrome.runtime.lastError.message.indexOf('firstPartyDomain') > -1;
			}
			IS_FIRST_PARTY_ISOLATION_TESTED = true;
			resolve();
		});
	});
}

function wrapDetails(args) {
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
	return details => testForFirstPartyIsolation().then(() => {
		const wrappedDetails = wrapDetails(details);
		return new Promise((resolve, reject) => {
			func(wrappedDetails, (result) => {
				if (chrome.runtime.lastError) {
					reject(chrome.runtime.lastError);
				}
				resolve(result);
			});
		});
	});
}

export const cookiesGet = wrapFunction(chrome.cookies.get.bind(chrome.cookies));
export const cookiesGetAll = wrapFunction(chrome.cookies.getAll.bind(chrome.cookies));
export const cookiesRemove = wrapFunction(chrome.cookies.remove.bind(chrome.cookies));
export const cookiesSet = wrapFunction(chrome.cookies.set.bind(chrome.cookies));

const setLoginCookie = async (details) => {
	const {
		name, value, expirationDate, httpOnly
	} = details;
	if (!name || !value) {
		throw new Error(`One or more required values missing: ${JSON.stringify({ name, value })}`);
	}
	try {
		const cookie = await cookiesSet({
			name,
			value,
			domain: globals.COOKIE_DOMAIN,
			expirationDate,
			secure: true,
			httpOnly,
			sameSite: 'no_restriction',
		});
		if (!cookie) {
			throw new Error('no cookie');
		}
		return cookie;
	} catch (e) {
		throw new Error(`Error setting cookie ${JSON.stringify(details)}: ${e}`);
	}
};

export const setAllLoginCookies = ({
	accessToken,
	csrfToken,
	refreshToken,
	userId,
	expirationDate,
} = {}) => {
	let exp = expirationDate;

	if (!exp) {
		const decodedAccessToken = decodeJwt(accessToken);
		exp = decodedAccessToken.payload.exp;
	}

	if (!accessToken || !csrfToken || !refreshToken || !userId || !exp) {
		throw new Error('login response incomplete');
	}

	return Promise.all([
		setLoginCookie({
			name: 'refresh_token',
			value: refreshToken,
			expirationDate: exp + 604800, // + 7 days
			httpOnly: true,
		}),
		setLoginCookie({
			name: 'access_token',
			value: accessToken,
			expirationDate: exp,
			httpOnly: true,
		}),
		setLoginCookie({
			name: 'csrf_token',
			value: csrfToken,
			expirationDate: exp,
			httpOnly: false,
		}),
		setLoginCookie({
			name: 'user_id',
			value: userId,
			expirationDate: 1893456000, // Tue Jan 1 2030 00:00:00 GMT. @TODO is this the best way of hanlding this?
			httpOnly: false,
		})
	]);
};
