import Module from 'browser-core/build/core/app/module';
import baseBackground from 'browser-core/build/core/base/background';
import globals from './Globals';
import conf from './Conf';

const background = baseBackground({
	init() { },
	unload() { },
	getState() {
		return {
			paused: globals.SESSION.paused_blocking,
			whitelisted: conf.site_whitelist,
		};
	}
});

class GhosteryModule extends Module {
	get backgroundModule() {
		return background;
	}

	get WindowModule() {
		return class {
			init() {}
			unload() {}
		};
	}
}

export default GhosteryModule;
