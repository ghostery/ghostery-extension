import { handleTrustButtonClick, handleRestrictButtonClick, handlePauseButtonClick, cliqzFeatureToggle } from './summaryActions';
import { trustRestrictBlockSiteTracker, blockUnblockGlobalTracker, blockUnBlockAllTrackers, resetSettings } from './trackerActions';

// Handler center
export default function handleAllActions({ actionName, actionData, state }) {
	let updated = {};

	switch(actionName) {
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
