export const _getJSONAPIErrorsObject = e => [{ title: 'Something went wrong.', detail: e.toString() }];

class Api {
	constructor() {
		this.isRefreshing = false;
		this.tokenRefreshedEventType = 'tokenRefreshed';
	}

	init(config, handlers) {
		this.config = config;
		this.handlers = handlers;
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
		return this.getCsrfCookie()
			.then(cookie => fetch(`${this.config.ACCOUNT_SERVER}${path}`, {
				method,
				headers: {
					'Content-Type': 'application/vnd.api+json',
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
						this._refreshToken()
							.then((res) => {
								this.isRefreshing = false;
								window.dispatchEvent(new CustomEvent(this.tokenRefreshedEventType, {
									detail: res,
								}));
								const { status } = res;
								if (status >= 400) {
									res.json().then((data2) => {
										if (this.handlers.errorHandler) {
											return this.handlers.errorHandler(data2.errors);
										}
										return reject(data2.errors);
									}).catch((err) => {
										reject(_getJSONAPIErrorsObject(err));
									});
									return;
								}
								this._sendReq(method, path, body)
									.then(this._processResponse)
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
		});
	}

	getCsrfCookie = (csrfDomain = this.config.CSRF_DOMAIN) => new Promise((resolve, reject) => {
		chrome.cookies.get({
			url: `https://${csrfDomain}.com`,
			name: 'csrf_token',
		}, (cookie) => {
			if (!cookie) {
				reject(new Error('CSRF Token cookie not found'));
				return;
			}
			resolve(cookie.value);
		});
	});

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
