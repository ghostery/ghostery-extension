/**
 * All Action handlers
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { handleTrustButtonClick, handleRestrictButtonClick, handlePauseButtonClick, cliqzFeatureToggle } from './summaryActions';
import { trustRestrictBlockSiteTracker, blockUnblockGlobalTracker, blockUnBlockAllTrackers, resetSettings } from './trackerActions';

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
			updated = handlePauseButtonClick({ state });
			break;

		case 'cliqzFeatureToggle':
			updated = cliqzFeatureToggle({ actionData });
			break;

		case 'trustRestrictBlockSiteTracker':
			updated = trustRestrictBlockSiteTracker({ actionData, state });
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

		default:
			updated = {};
	}

	return updated;
}
