function complete() {
	chrome.runtime.sendMessage({
		name: 'setup_complete',
		message: null,
		origin: 'onboarding',
	});
}

function skip() {
	chrome.runtime.sendMessage({
		name: 'setup_skip',
		message: null,
		origin: 'onboarding',
	});
}

document.getElementById('complete').addEventListener('click', complete);
document.getElementById('skip').addEventListener('click', skip);
