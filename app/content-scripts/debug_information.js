chrome.runtime.sendMessage({ name: 'debug_information' }, (response) => {
	document.body.innerText = response;
});
