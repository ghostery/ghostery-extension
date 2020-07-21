chrome.runtime.sendMessage({ name: 'debug_information' }, (response) => {
	const interval = setInterval(() => {
		if (document.getElementsByTagName('a').length > 0) {
			clearInterval(interval);
			document.getElementById('debug-information').innerText = response;
		}
	}, 500);
});
