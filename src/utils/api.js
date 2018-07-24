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
			return new Promise((resolve, reject) => {
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

	_processResponse(res) {
		return new Promise((resolve, reject) => {
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
		});
	}

	_sendAuthenticatedRequest(method, path, body) {
		return new Promise((resolve, reject) => {
			this._sendReq(method, path, body)
				.then(this._processResponse)
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
									.then(this._processResponse)
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

	_getCsrfCookie = (csrfDomain = this.config.CSRF_DOMAIN) => (
		new Promise((resolve, reject) => {
			chrome.cookies.get({
				url: `https://${csrfDomain}.com`,
				name: 'csrf_token',
			}, (cookie) => {
				if (cookie === null) {
					return reject({ errors: _getJSONAPIErrorsObject(new Error(Api.ERROR_CSRF_COOKIE_NOT_FOUND)) }); // eslint-disable-line prefer-promise-reject-errors
				}
				return resolve(cookie.value);
			});
		})
	)

	_errorHandler = errors => Promise.resolve(errors)

	static get ERROR_CSRF_COOKIE_NOT_FOUND() { return '1'; }
	static get JSONAPI_CONTENT_TYPE() { return 'application/vnd.api+json'; }

	get = (type, id, include = '') => {
		if (!id) { return Promise.reject(new Error('id is missing')); }
		return this._sendAuthenticatedRequest('GET', `/api/v2/${type}/${id}?include=${include}`);
	}

	save = (type, data) => this._sendAuthenticatedRequest('POST', `/api/v2/${type}/`, data)

	update = (type, data) =>
		// TODO check for data.id and fail
		this._sendAuthenticatedRequest('PATCH', `/api/v2/${type}/${data.id}`, { data })

	remove = (type, id) => this._sendAuthenticatedRequest('DELETE', `/api/v2/${type}/${id}`)
}

export default Api;
