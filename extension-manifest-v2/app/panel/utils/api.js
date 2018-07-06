import 'whatwg-fetch';
import globals from '../../../src/classes/Globals';

// TODO make this not global vars
let isRefreshing = false;
const tokenRefreshedEventType = 'tokenRefreshed';
const Config = {
	auth_server: {
		host: `https://consumerapi.${globals.GHOSTERY_DOMAIN}.com`
	},
	account_server: {
		host: `https://accountapi.${globals.GHOSTERY_DOMAIN}.com`
	},
};

const _getJSONAPIErrorsObject = e => ([{ title: 'Something went wrong.', detail: e.toString() }]);

const _refreshToken = function () {
	if (isRefreshing) {
		let bindedResolve;
		const _processRefreshTokenEvent = (resolve, e) => {
			window.removeEventListener(tokenRefreshedEventType, bindedResolve, false);
			resolve(e.detail);
		};
		return new Promise((resolve, reject) => {
			bindedResolve = _processRefreshTokenEvent.bind(null, resolve);
			window.addEventListener(tokenRefreshedEventType, bindedResolve, false);
		});
	}

	isRefreshing = true;
	return fetch(`${Config.auth_server.host}/api/v2/refresh_token`, { // eslint-disable-line no-undef
		method: 'POST',
		credentials: 'include',
	});
};

const getCsrfCookie = () => new Promise((resolve, reject) => {
	chrome.cookies.get({
		url: `https://${globals.GHOSTERY_DOMAIN}.com`, // ghostery.com || ghosterystage.com
		name: 'csrf_token',
	}, (cookie) => {
		if (cookie) {
			resolve(cookie);
			return;
		}
		reject();
	});
});

const _sendReq = (method, path, body) => getCsrfCookie()
	.then(cookie => fetch(`${Config.account_server.host}${path}`, { // eslint-disable-line no-undef
		method,
		headers: {
			'Content-Type': 'application/vnd.api+json',
			'Content-Length': Buffer.byteLength(JSON.stringify(body)),
			'X-CSRF-Token': cookie.value,
		},
		body: JSON.stringify(body),
		credentials: 'include',
	}));

const _processResponse = res => (
	new Promise((resolve, reject) => {
		const { status } = res;
		if (status === 204) {
			resolve();
			return;
		}
		res.json().then((data) => {
			if (status >= 400) {
				reject(data);
			} else {
				resolve(data);
			}
		});
	})
);

const _sendAuthenticatedRequest = (method, path, body) => (
	new Promise((resolve, reject) => {
		_sendReq(method, path, body)
			.then(_processResponse)
			.then((data) => {
				resolve(data);
			})
			.catch((data) => {
				let shouldRefresh = false;
				if (data && data.errors) {
					data.errors.forEach((e) => {
						if (e.code === '10021' || e.code === '10022') { // token is expired or missing
							shouldRefresh = true;
						}
					});
				}
				if (shouldRefresh) {
					_refreshToken()
						.then((res) => {
							isRefreshing = false;
							window.dispatchEvent(new CustomEvent(tokenRefreshedEventType, {
								detail: res,
							}));
							const { status } = res;
							if (status >= 400) {
								res.json().then((data2) => {
									reject(data2.errors);
								}).catch((err) => {
									reject(_getJSONAPIErrorsObject(err));
								});
								return;
							}
							_sendReq(method, path, body)
								.then(_processResponse)
								.then((data3) => {
									resolve(data3);
								})
								.catch((err) => {
									reject(_getJSONAPIErrorsObject(err));
								});
						});
				} else {
					reject(_getJSONAPIErrorsObject(data));
				}
			});
	})
);

export const get = function (type, id, include = '') {
	if (!id) { return Promise.reject(new Error('id is missing')); }
	return _sendAuthenticatedRequest('GET', `/api/v2/${type}/${id}?include=${include}`);
};

export const save = function (type, data) {
	return _sendAuthenticatedRequest('POST', `/api/v2/${type}/`, data);
};

export const update = function (type, data) {
	// TODO check for data.id and fail
	return _sendAuthenticatedRequest('PATCH', `/api/v2/${type}/${data.id}`, { data });
};

export const remove = function (type, id) {
	return _sendAuthenticatedRequest('DELETE', `/api/v2/${type}/${id}`);
};

export const logout = function () {
	return getCsrfCookie()
		.then(cookie => fetch(`${Config.auth_server.host}/api/v2/logout`, { // eslint-disable-line no-undef
			method: 'POST',
			credentials: 'include',
			headers: {
				'X-CSRF-Token': cookie.value,
			},
		}));
};
