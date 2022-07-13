function complete() {
	chrome.runtime.sendMessage({
		name: 'setup_complete',
		message: null,
		origin: 'onboarding',
	});
}

document.getElementById('complete').addEventListener('click', complete);
