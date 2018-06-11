import { sendMessage } from '../utils/msg';
import { updateObject } from '../utils/utils';
import { resetTrustRestrictPause } from './summaryActions';

function trustRestrictTracker({ pageHost, blocking, app_ids, trust, restrict }) {
	const siteSpecificUnblocks = blocking.site_specific_unblocks;
	const siteSpecificBlocks = blocking.site_specific_blocks;

	const pageUnblocks = siteSpecificUnblocks[pageHost] && siteSpecificUnblocks[pageHost].slice(0) || []; // clone
	const pageBlocks = siteSpecificBlocks[pageHost] && siteSpecificBlocks[pageHost].slice(0) || []; // clone
	let updated_site_specific_unblocks = {};
	let updated_site_specific_blocks = {};

	// Site specific un-blocking
	app_ids.forEach((app_id) => {
		if (trust) {
			if (!pageUnblocks.includes(app_id)) {
				pageUnblocks.push(app_id);
			}
		} else if (pageUnblocks.includes(app_id)) {
			pageUnblocks.splice(pageUnblocks.indexOf(app_id), 1);
		}

		// Site specific blocking
		if (restrict) {
			if (!pageBlocks.includes(app_id)) {
				pageBlocks.push(app_id);
			}
		} else if (pageBlocks.includes(app_id)) {
			pageBlocks.splice(pageBlocks.indexOf(app_id), 1);
		}
	});

	updated_site_specific_unblocks = updateObject(siteSpecificUnblocks, pageHost, pageUnblocks);
	updated_site_specific_blocks = updateObject(siteSpecificBlocks, pageHost, pageBlocks);

	return {
		updated_site_specific_unblocks,
		updated_site_specific_blocks,
	};
}

function calculateDelta(oldState, newState) {
	if (oldState && !newState) { // From block to unblock
		return -1;
	}

	if (!oldState && newState) { // From unblock to block
		return 1;
	}

	// State doesn't change
	return 0;
}

export function trustRestrictBlockSiteTracker({ actionData, state }) {
	const { blocking, summary, settings } = state;
	const pageHost = summary.pageHost;

	const { app_id, cat_id, block, trust, restrict } = actionData;

	const updated_app_ids = JSON.parse(JSON.stringify(blocking.selected_app_ids)) || {};

	const updated_blocking_categories = JSON.parse(JSON.stringify(blocking.categories)); // deep clone
	const updated_blocking_category = updated_blocking_categories.find(category => category.id === cat_id);

	// update tracker category for site-specific blocking
	const selectedBlockingTracker = updated_blocking_category.trackers
																	.find(tracker => tracker.shouldShow && tracker.id === app_id);
	if (selectedBlockingTracker) {
		const oldState = selectedBlockingTracker.blocked || selectedBlockingTracker.ss_blocked;
		selectedBlockingTracker.ss_allowed = trust;
		selectedBlockingTracker.ss_blocked = restrict;
		selectedBlockingTracker.blocked = block;

		const key = selectedBlockingTracker.id;
		if (block) {
			updated_app_ids[key] = 1;
		} else {
			delete updated_app_ids[key];
		}

		const newState = selectedBlockingTracker.blocked || selectedBlockingTracker.ss_blocked;
		const delta = calculateDelta(oldState, newState);
		updated_blocking_category.num_blocked += delta;
	}

	// Also update global trackers *****
	const updated_settings_categories = JSON.parse(JSON.stringify(settings.categories)); // deep clone
	const updated_settings_category = updated_settings_categories.find(category => category.id === cat_id);

	const selectedSettingsTracker = updated_settings_category.trackers
																	.find(tracker => tracker.shouldShow && +tracker.id === app_id);
	if (selectedSettingsTracker && !trust && !restrict) { // Only update global if this action is blocking
		const oldState = selectedSettingsTracker.blocked;
		selectedSettingsTracker.blocked = block;

		const newState = selectedSettingsTracker.blocked;
		const delta = calculateDelta(oldState, newState);
		updated_settings_category.num_blocked += delta;
	}

	const { updated_site_specific_unblocks, updated_site_specific_blocks }
				= trustRestrictTracker({ pageHost, blocking, app_ids: [app_id], trust, restrict });

	// persist to background - note that categories are not included
	sendMessage('setPanelData', {
		selected_app_ids: updated_app_ids,
		site_specific_unblocks: updated_site_specific_unblocks,
		site_specific_blocks: updated_site_specific_blocks,
	});

	let updatedSummary = {};

	// Only reset if there is conflict
	if (!((trust && summary.sitePolicy === 2) || (restrict && summary.sitePolicy === 1))) {
		updatedSummary = resetTrustRestrictPause(state);
	}

	return {
		blocking: {
			categories: updated_blocking_categories,
		},
		settings: {
			categories: updated_settings_categories,
		},
		...updatedSummary,
	};
}

export function blockUnblockGlobalTracker({ actionData, state }) {
	const { block, cat_id, app_id, type } = actionData;
	const { blocking, settings } = state;

	const updated_app_ids = JSON.parse(JSON.stringify(settings.selected_app_ids)) || {};

	const updated_settings_categories = JSON.parse(JSON.stringify(settings.categories)) || []; // deep clone
	const updated_settings_category = updated_settings_categories.find(category => category.id === cat_id);

	const selectedSettingsTracker = updated_settings_category.trackers
																	.find(tracker => tracker.shouldShow && tracker.id === app_id);

	if (selectedSettingsTracker) {
		const oldState = selectedSettingsTracker.blocked;
		selectedSettingsTracker.blocked = block;

		const key = selectedSettingsTracker.id;
		if (block) {
			updated_app_ids[key] = 1;
		} else {
			delete updated_app_ids[key];
		}

		const newState = selectedSettingsTracker.blocked;
		const delta = calculateDelta(oldState, newState);
		updated_settings_category.num_blocked += delta;
	}

	// Also update site trackers *****
	// If we do this, we also need to reset trust/restrict/pause buttons
	const updated_blocking_categories = JSON.parse(JSON.stringify(blocking.categories)) || []; // deep clone
	const updated_blocking_category = updated_blocking_categories.find(item => item.id === cat_id);

	const selectedBlockingTracker = updated_blocking_category.trackers
																	.find(tracker => tracker.shouldShow && tracker.id === +app_id && !tracker.ss_allowed && !tracker.ss_blocked);
	// Only update if the site tracker is neither trusted nor restricted
	if (selectedBlockingTracker) {
		const oldState = selectedBlockingTracker.blocked || selectedBlockingTracker.ss_blocked;
		selectedBlockingTracker.blocked = block;
		const newState = selectedBlockingTracker.blocked || selectedBlockingTracker.ss_blocked;
		const delta = calculateDelta(oldState, newState);
		updated_blocking_category.num_blocked += delta;
	}

	// persist to background
	sendMessage('setPanelData', { selected_app_ids: updated_app_ids });

	return {
		settings: {
			categories: updated_settings_categories,
		},
		blocking: {
			categories: updated_blocking_categories,
		},
	};
}

export function blockUnBlockAllTrackers({ actionData, state }) {
	const { type, block } = actionData;
	const isSiteTrackers = type === 'site';

	const updated_app_ids = JSON.parse(JSON.stringify(state.blocking.selected_app_ids)) || {};
	const updated_blocking_categories = JSON.parse(JSON.stringify(state.blocking.categories)) || [];
	const updated_settings_categories = JSON.parse(JSON.stringify(state.settings.categories)) || [];

	const app_ids = [];

	if (isSiteTrackers) {
		updated_blocking_categories.forEach((category) => {
			const updated_settings_category = updated_settings_categories.find(item => item.id === category.id);
			category.num_blocked = 0;
			category.trackers.forEach((tracker) => {
				if (tracker.shouldShow) {
					tracker.blocked = block;
					const key = tracker.id;

					if (block) {
						if (!app_ids.includes(key)) {
							app_ids.push(key);
						}

						tracker.ss_allowed = false;
						tracker.ss_blocked = false;
					}

					if (block || tracker.ss_blocked) {
						category.num_blocked += 1;
						updated_app_ids[key] = 1;
					} else {
						delete updated_app_ids[key];
					}

					 // NOTE: This may affect performance
					const updated_settings_tracker = updated_settings_category.trackers.find(item => +item.id === key);
					const oldState = updated_settings_tracker.blocked;
					updated_settings_tracker.blocked = block;
					const newState = updated_settings_tracker.blocked;
					const delta = calculateDelta(oldState, newState);
					updated_settings_category.num_blocked += delta;
				}
			});
		});
	} else {
		updated_settings_categories.forEach((category) => {
			category.num_blocked = 0;
			category.trackers.forEach((tracker) => {
				if (tracker.shouldShow) {
					tracker.blocked = block;
					const key = tracker.id;

					if (block) {
						category.num_blocked += 1;
						updated_app_ids[key] = 1;
					} else {
						delete updated_app_ids[key];
					}
				}
			});
		});

		updated_blocking_categories.forEach((category) => {
			category.trackers.forEach((tracker) => {
				if (tracker.shouldShow && !tracker.ss_allowed && !tracker.ss_blocked) {
					tracker.blocked = block;
				}
			});
			category.num_blocked = category.trackers.filter(tracker => tracker.blocked || tracker.ss_blocked).length;
		});
	}

	// TODO: Do we want to unrestrict if unblock?
	const { updated_site_specific_unblocks, updated_site_specific_blocks } =
		trustRestrictTracker({
			pageHost: state.summary.pageHost,
			blocking: state.blocking,
			app_ids,
			trust: false,
			restrict: false,
		});

	// persist to background
	sendMessage('setPanelData', {
		selected_app_ids: updated_app_ids,
		site_specific_unblocks: updated_site_specific_unblocks,
		site_specific_blocks: updated_site_specific_blocks,
	});

	const updatedSummary = isSiteTrackers ? resetTrustRestrictPause(state) : {};

	return {
		blocking: {
			categories: updated_blocking_categories,
		},
		settings: {
			categories: updated_settings_categories,
		},
		...updatedSummary,
	};
}

// TODO: double check this function
export function resetSettings({ state }) {
	const { blocking, settings } = state;

	const blockingCategories = JSON.parse(JSON.stringify(blocking.categories)) || [];
	const settingsCategories = JSON.parse(JSON.stringify(settings.categories)) || [];

	blockingCategories.forEach((category) => {
		category.num_blocked = 0;
		category.trackers.forEach((tracker) => {
			if (tracker.shouldShow) {
				tracker.blocked = false;
				tracker.ss_blocked = false;
				tracker.ss_allowed = false;
			}
		});
	});

	settingsCategories.forEach((category) => {
		category.num_blocked = 0;
		category.trackers.forEach((tracker) => {
			if (tracker.shouldShow) {
				tracker.blocked = false;
				tracker.ss_blocked = false;
				tracker.ss_allowed = false;
			}
		});
	});

	sendMessage('setPanelData', {
		site_specific_unblocks: {},
		site_specific_blocks: {},
		selected_app_ids: {},
		site_whitelist: [],
		site_blacklist: [],
		paused_blocking: false,
		enable_anti_tracking: true,
		enable_ad_block: true,
		enable_smart_block: true,
	});

	return {
		summary: {
			site_whitelist: [],
			site_blacklist: [],
			paused_blocking: false,
		},
		blocking: {
			categories: blockingCategories,
		},
		settings: {
			categories: settingsCategories,
		},
		panel: {
			enable_anti_tracking: true,
			enable_ad_block: true,
			enable_smart_block: true,
		},
	};
}
