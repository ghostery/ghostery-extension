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

import { cookiesGet, setAllLoginCookies } from './cookies';

export const _getJSONAPIErrorsObject = e => [{ title: e.message || '', detail: e.message || '', code: e.code || e.message || '' }];

class Api {
	constructor() {
		this._refreshPromise = null;
	}

	init(config, opts) {
		this.config = config;
		const { errorHandler } = opts;
		if (typeof errorHandler === 'function') {
			this._errorHandler = errorHandler;
		}
	}

	refreshToken() {
		if (this._refreshPromise) {
			return this._refreshPromise;
		}

		const pending = (async () => {
			const fromCookie = async (name) => {
				const cookie = await cookiesGet({ name });
				if (!cookie || !cookie.value) {
					throw new Error(`Unable to refreshToken without "${name}"`);
				}
				return cookie.value;
			};
			const headers = {
				UserId: await fromCookie('user_id'),
				RefreshToken: await fromCookie('refresh_token'),
			};

			const response = await fetch(`${this.config.AUTH_SERVER}/api/v2/refresh_token`, {
				method: 'POST',
				credentials: 'omit',
				headers,
			});
			if (response.ok) {
				const data = await response.json();
				await setAllLoginCookies({
					accessToken: data.access_token,
					refreshToken: data.refresh_token,
					csrfToken: data.csrf_token,
					userId: data.user_id,
				});
			}
			return response;
		})();
		this._refreshPromise = pending;
		pending.finally(() => {
			this._refreshPromise = null;
		});
		return pending;
	}

	async _sendReq(method, path, body) {
		const headers = {
			'Content-Type': Api.JSONAPI_CONTENT_TYPE,
		};
		const	csrfTokenCookie = await cookiesGet({ name: 'csrf_token' });
		if (csrfTokenCookie) {
			headers['X-CSRF-Token'] = csrfTokenCookie.value;
		}
		const	accessTokenCookie = await cookiesGet({ name: 'access_token' });
		if (accessTokenCookie) {
			headers.Authorization = `Bearer ${accessTokenCookie.value}`;
		}
		return fetch(`${this.config.ACCOUNT_SERVER}${path}`, {
			method,
			headers,
			credentials: 'omit',
			body: JSON.stringify(body),
		});
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
			}).catch(err => reject(err));
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
							if (e.code === '10020' || e.code === '10021' || e.code === '10022') {
								// The access_token was rejected, but we can get a new one because it is
								// one of the retryable cases (not valid, expired, or missing).
								//
								// Note: "not valid" ('10020') is somewhat misleading: it does not
								// necessarily mean that the access_token is ill-formed; the server
								// will also return that code in situations where the token expired.
								shouldRefresh = true;
							}
						});
					} else {
						reject(data);
						return;
					}

					if (shouldRefresh) {
						this.refreshToken()
							.then((res) => {
								const { status } = res;
								if (status >= 400) {
									res.json().then(data2 => (
										this._errorHandler(data2.errors)
											.then(() => resolve(data2))
											.catch(err => reject(err))
									)).catch(err => reject(err));
									return;
								}
								this._sendReq(method, path, body)
									.then(Api._processResponse)
									.then(dataSecondTry => resolve(dataSecondTry))
									.catch((data3) => {
										this._errorHandler(data3.errors)
											.then(() => resolve(data3))
											.catch(err => reject(err));
									});
							})
							.catch(err => reject(err));
					} else {
						this._errorHandler(data.errors)
							.then(() => resolve(data))
							.catch(err => reject(err));
					}
				});
		});
	}

	// eslint-disable-next-line class-methods-use-this
	_errorHandler = errors => Promise.resolve(errors);

	static get JSONAPI_CONTENT_TYPE() { return 'application/vnd.api+json'; }

	get = (type, id, include = '') => {
		if (!id) { return Promise.reject(new Error('id is missing')); }
		return this._sendAuthenticatedRequest('GET', `/api/v2.1.0/${type}/${id}?${include ? `include=${include}` : ''}`);
	};

	save = (type, data) => this._sendAuthenticatedRequest('POST', `/api/v2.1.0/${type}/`, data);

	update = (type, data) => {
		// TODO check for data.id and fail
		this._sendAuthenticatedRequest('PATCH', `/api/v2.1.0/${type}/${data.id}`, { data });
	};

	remove = (type, id) => this._sendAuthenticatedRequest('DELETE', `/api/v2.1.0/${type}/${id}`);
}

export default Api;
