export function sendMessage(name, message, callback = function () {}) {
	return chrome.runtime.sendMessage({
		name,
		message,
	}, callback);
}

export function sendMessageInPromise(name, message) {
	return new Promise(((resolve, reject) => {
		chrome.runtime.sendMessage({
			name,
			message,
		}, (response) => {
			if (chrome.runtime.lastError) {
				resolve(null);
			}
			resolve(response);
		});
	}));
}
