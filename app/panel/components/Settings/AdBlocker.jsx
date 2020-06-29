/**
 * Ad Blocker Settings Component
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

import React from 'react';
import PropTypes from 'prop-types';
import { RadioButtonGroup } from '../BuildingBlocks';

/**
 * @class Implement Ad Blocker Settings subview as a React component.
 * The view opens from the left-side menu of the main Settings view.
 * It allows the user to choose their Ad Blocker filter lists.
 * @memberOf SettingsComponents
 */
const AdBlocker = (props) => {
	const { settingsData } = props;

	const handleListSelection = (index) => {
		props.actions.selectItem({
			event: 'cliqz_adb_mode',
			value: index,
		});
	};

	return (
		<div className="s-tabs-panel">
			<div className="row">
				<div className="columns">
					<h3>{ t('settings_adblocker') }</h3>
					<h5>{ t('settings_adblocker_lists') }</h5>
					<RadioButtonGroup
						labels={['settings_adblocker_list_1', 'settings_adblocker_list_2', 'settings_adblocker_list_3']}
						handleItemClick={handleListSelection}
						indexClicked={settingsData.cliqz_adb_mode}
					/>
				</div>
			</div>
		</div>
	);
};

AdBlocker.propTypes = {
	actions: PropTypes.shape({
		selectItem: PropTypes.func.isRequired,
	}).isRequired,
	settingsData: PropTypes.shape({
		cliqz_adb_mode: PropTypes.number,
	}),
};

AdBlocker.defaultProps = {
	settingsData: {
		cliqz_adb_mode: 0,
	},
};

export default AdBlocker;
