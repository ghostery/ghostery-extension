import { mount, html } from 'hybrids';
import { getBrowserInfo } from '@ghostery/libs';

import '@ghostery/ui/onboarding';
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
	mount(document.body, {
		render: () => html`
				<ui-onboarding
					platform="${name}"
					renew=${renew}
					onsuccess="${complete}"
					onskip="${skip}"
				></ui-onboarding>
			`,
	});
});
