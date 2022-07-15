import { define, html } from 'hybrids';

import '@ghostery/ui';
import '@ghostery/ui/onboarding';

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

define({
	tag: 'gh-onboarding',
	content: () => html`<ui-onboarding onsuccess="${complete}" onskip="${skip}"></ui-onboarding>`,
});
