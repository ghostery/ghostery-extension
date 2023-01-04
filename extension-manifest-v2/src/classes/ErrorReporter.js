import * as Sentry from '@sentry/browser';

import globals from './Globals';

const manifest = chrome.runtime.getManifest();

const hostRegexp = new RegExp(window.location.host, 'g');

const config = {
	tunnel: 'https://crashreporting.ghostery.net/',
	dsn: 'https://05c74f55666649f0b6d671b9c37f6da1@o475874.ingest.sentry.io/6447378',
	release: `ghostery-extension@${manifest.version}`,
	debug: manifest.debug,
	environment: manifest.debug ? 'development' : 'production',
	// We use Sentry to track critical errors only.
	// That means we want to prevent default configuration from
	// sending additional messages like session logs, activity pings, etc
	autoSessionTracking: false,
	defaultIntegrations: false,
	sampleRate: 0.05,
	attachStacktrace: true,
};

Sentry.init(config);

globals.BROWSER_INFO_READY.then(() => {
	Sentry.setTag('ua', globals.BROWSER_INFO.token);
});

export default {
	captureException(error) {
		if (error.stack) {
			// eslint-disable-next-line no-param-reassign
			error.stack = error.stack.replace(hostRegexp, 'filtered');
		}
		Sentry.captureException(error);
	},
};
