import { sendMessageInPromise } from '../utils/msg';

export function getPanelData(tabId) {
	return sendMessageInPromise('getPanelData', {
		tabId,
		view: 'panel',
	});
}

export function getSummaryData(tabId) {
	return sendMessageInPromise('getPanelData', {
		tabId,
		view: 'summary',
	});
}

export function getBlockingData(tabId) {
	return sendMessageInPromise('getPanelData', {
		tabId,
		view: 'blocking',
	});
}

export function getSettingsData() {
	return sendMessageInPromise('getPanelData', {
		view: 'settings',
	});
}
