import KordInjector from '../classes/ExtMessenger';
import { log } from './common';

function promiseTimeout(timeout) {
	return new Promise((resolve, reject) => {
		setTimeout(reject, timeout);
	});
}

function runCliqzSettingsImport(cliqz, conf) {
	log('run cliqz settings importer');
	const inject = new KordInjector();
	inject.init();
	// inject modules in remote cliqz extension with which we want to communicate
	const privacyMigration = inject.module('privacy-migration');

	// fetch settings from antitracking and adblocker
	// if we don't get a response, the promise will timeout after 5s
	return Promise.race([privacyMigration.exportSettings(), promiseTimeout(5000)])
		.then((result) => {
			if (result === 'error') {
				// no settings available at the moment
				return Promise.reject();
			}
			log(result);
			const modules = ['antitracking', 'adblocker'];

			// active modules
			modules.forEach((mod) => {
				if (result[mod].enabled === true) {
					log(`import ${mod} state: enabled`);
					cliqz.enableModule(mod);
				} else {
					log(`import ${mod} state: disabled`);
					cliqz.disableModule(mod);
				}
			});

			// import site whitelists
			const existingSites = new Set(conf.site_whitelist);
			const newSites = new Set(modules.map(mod => result[mod].whitelistedSites)
				.reduce((lst, val) => lst.concat(val), [])
				.map(s => s.replace(/^(http[s]?:\/\/)?(www\.)?/, ''))
				.filter(s => !existingSites.has(s)));
			log('add whitelisted sites', [...newSites]);
			const whitelist = conf.site_whitelist;
			newSites.forEach((s) => {
				whitelist.push(s);
			});
			conf.site_whitelist = whitelist;
			privacyMigration.cleanModuleData();
			return Promise.resolve();
		}).then(() => {
			inject.unload();
		});
}

// import settings from cliqz
export function importCliqzSettings(cliqz, conf) {
	log('checking cliqz import', conf.cliqz_import_state);
	if (!conf.cliqz_import_state) {
		runCliqzSettingsImport(cliqz, conf).then(() => {
			log('cliqz settings import successful');
			conf.cliqz_import_state = 1;
		}, (e) => {
			log('cliqz import not available at present', e);
		});
	}
}
