/**
 * All Action handlers
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import {
	handleTrustButtonClick, handleRestrictButtonClick, handlePauseButtonClick, cliqzFeatureToggle, updateSitePolicy
} from './summaryActions';
import {
	trustRestrictBlockSiteTracker, anonymizeSiteTracker, blockUnblockGlobalTracker, blockUnBlockAllTrackers, resetSettings
} from './blockingActions';
import {
	updateDatabase, updateSettingCheckbox, selectItem
} from './settingsActions';

// Handle all actions in Panel.jsx
export default function handleAllActions({ actionName, actionData, state }) {
	let updated = {};

	switch (actionName) {
		case 'handleTrustButtonClick':
			updated = handleTrustButtonClick({ state });
			break;

		case 'handleRestrictButtonClick':
			updated = handleRestrictButtonClick({ state });
			break;

		case 'handlePauseButtonClick':
			updated = handlePauseButtonClick({ actionData, state });
			break;

		case 'cliqzFeatureToggle':
			updated = cliqzFeatureToggle({ actionData });
			break;

		case 'trustRestrictBlockSiteTracker':
			updated = trustRestrictBlockSiteTracker({ actionData, state });
			break;

		case 'anonymizeSiteTracker':
			updated = anonymizeSiteTracker({ actionData, state });
			break;

		case 'blockUnblockGlobalTracker':
			updated = blockUnblockGlobalTracker({ actionData, state });
			break;

		case 'blockUnBlockAllTrackers':
			updated = blockUnBlockAllTrackers({ actionData, state });
			break;

		case 'resetSettings':
			updated = resetSettings({ state });
			break;

		case 'updateSitePolicy':
			updated = updateSitePolicy({ actionData, state });
			break;

		case 'updateDatabase':
			updated = updateDatabase({ actionData, state });
			break;

		case 'updateSettingCheckbox':
			updated = updateSettingCheckbox({ actionData, state });
			break;

		case 'selectItem':
			updated = selectItem({ actionData, state });
			break;

		default:
			updated = {};
	}

	return updated;
}
