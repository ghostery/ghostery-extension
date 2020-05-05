/**
 * JSON API
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

export const _getJSONAPIErrorsObject = e => [{ title: e.message || '', detail: e.message || '', code: e.code || e.message || '' }];

class Api {
	constructor() {
		this.isRefreshing = false;
		this.tokenRefreshedEventType = 'tokenRefreshed';
	}

	init(config, opts) {
		this.config = config;
		const { errorHandler } = opts;
		if (typeof errorHandler === 'function') {
			this._errorHandler = errorHandler;
		}
	}

	_refreshToken() {
		if (this.isRefreshing) {
			let bindedResolve;
			const _processRefreshTokenEvent = (resolve, e) => {
				window.removeEventListener(this.tokenRefreshedEventType, bindedResolve, false);
				resolve(e.detail);
			};
			return new Promise((resolve) => {
				bindedResolve = _processRefreshTokenEvent.bind(null, resolve);
				window.addEventListener(this.tokenRefreshedEventType, bindedResolve, false);
			});
		}

		this.isRefreshing = true;
		return fetch(`${this.config.AUTH_SERVER}/api/v2/refresh_token`, {
			method: 'POST',
			credentials: 'include',
		});
	}

	_sendReq(method, path, body) {
		return this._getCsrfCookie()
			.then(cookie => fetch(`${this.config.ACCOUNT_SERVER}${path}`, {
				method,
				headers: {
					'Content-Type': Api.JSONAPI_CONTENT_TYPE,
					'Content-Length': Buffer.byteLength(JSON.stringify(body)),
					'X-CSRF-Token': cookie,
				},
				body: JSON.stringify(body),
				credentials: 'include',
			}));
	}

	static _processResponse(res) {
		return new Promise((resolve, reject) => {
			const { status } = res;
			if (status === 204) {
				resolve();
				return;
			}
			if (status === 404) {
				// TODO resource "not-found" errors should be handled server side
				reject({ // eslint-disable-line prefer-promise-reject-errors
					errors: [
						{
							title: 'Resource not found',
							code: 'not-found',
							status: '404',
						}
					]
				});
				return;
			}

			res.json().then((data) => {
				if (status >= 400) {
					reject(data);
				} else {
					resolve(data);
				}
			});
		});
	}

	_sendAuthenticatedRequest(method, path, body) {
		return new Promise((resolve, reject) => {
			this._sendReq(method, path, body)
				.then(Api._processResponse)
				.then(dataFirstTry => resolve(dataFirstTry))
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
						this._refreshToken()
							.then((res) => {
								this.isRefreshing = false;
								window.dispatchEvent(new CustomEvent(this.tokenRefreshedEventType, {
									detail: res,
								}));
								const { status } = res;
								if (status >= 400) {
									res.json().then(data2 => (
										this._errorHandler(data2.errors)
											.then(() => resolve(data2))
											.catch(err => reject(err))
									)).catch(err => reject(err));
								}
								this._sendReq(method, path, body)
									.then(Api._processResponse)
									.then(dataSecondTry => resolve(dataSecondTry))
									.catch((data3) => {
										this._errorHandler(data3.errors)
											.then(() => resolve(data3))
											.catch(err => reject(err));
									});
							});
					} else {
						this._errorHandler(data.errors)
							.then(() => resolve(data))
							.catch(err => reject(err));
					}
				});
		});
	}

	_getCsrfCookie = (cookieUrl = this.config.COOKIE_URL) => (
		new Promise((resolve) => {
			chrome.cookies.get({
				url: cookieUrl,
				name: 'csrf_token',
			}, cookie => resolve((cookie !== null) ? cookie.value : ''));
		})
	)

	_errorHandler = errors => Promise.resolve(errors)

	static get JSONAPI_CONTENT_TYPE() { return 'application/vnd.api+json'; }

	get = (type, id, include = '') => {
		if (!id) { return Promise.reject(new Error('id is missing')); }
		return this._sendAuthenticatedRequest('GET', `/api/v2/${type}/${id}?${include ? `include=${include}` : ''}`);
	}

	save = (type, data) => this._sendAuthenticatedRequest('POST', `/api/v2/${type}/`, data)

	update = (type, data) => {
		// TODO check for data.id and fail
		this._sendAuthenticatedRequest('PATCH', `/api/v2/${type}/${data.id}`, { data });
	}

	remove = (type, id) => this._sendAuthenticatedRequest('DELETE', `/api/v2/${type}/${id}`)
}

export default Api;
