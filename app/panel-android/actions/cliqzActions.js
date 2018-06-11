import { sendMessageInPromise } from '../utils/msg';

export function getCliqzModuleData(tabId) {
	return sendMessageInPromise('getCliqzModuleData', {
		tabId,
	});
}
