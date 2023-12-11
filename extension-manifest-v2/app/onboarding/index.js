import { mount, html } from 'hybrids';
import { getBrowserInfo } from '@ghostery/libs';

import '@ghostery/ui/onboarding';
import '@ghostery/ui/onboarding/short';
import './styles.scss';

const renew = new URLSearchParams(window.location.search).get('renew') === '1';

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

getBrowserInfo().then(({ name }) => {
	if (name.toLowerCase() === 'firefox') {
		mount(document.body, {
			content: () => html`
			<ui-onboarding-short
				platform="${name}"
				onsuccess="${complete}"
				onskip="${skip}"
			></ui-onboarding-short>
		`,
		});
	} else {
		mount(document.body, {
			content: () => html`
			<ui-onboarding
				platform="${name}"
				renew=${renew}
				onsuccess="${complete}"
				onskip="${skip}"
			></ui-onboarding>
		`,
		});
	}
});
