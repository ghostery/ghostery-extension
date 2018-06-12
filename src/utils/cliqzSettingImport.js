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
			newSites.forEach((s) => {
				conf.site_whitelist.push(s);
			});
			return privacyMigration.cleanModuleData();
		}).then(() => {
			inject.unload();
		});
}

// import settings from cliqz
export function importCliqzSettings(cliqz, conf) {
	const IMPORT_RUN_FLAG = 'cliqzImportState';
	chrome.storage.local.get([IMPORT_RUN_FLAG], (result) => {
		log(IMPORT_RUN_FLAG, result);
		if (!result[IMPORT_RUN_FLAG]) {
			runCliqzSettingsImport(cliqz, conf).then(() => {
				log('cliqz settings import successful');
				chrome.storage.local.set({ [IMPORT_RUN_FLAG]: 1 });
			}, (e) => {
				log('cliqz import not available at present');
				console.error(e);
			});
		}
	});
}
