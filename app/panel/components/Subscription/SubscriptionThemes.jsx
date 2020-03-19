/**
 * Themes Subscription Component
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
 * @class Implement Themes subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It allows to switch between available Ghostery themes.
 * @memberOf SettingsComponents
*/
const SubscriptionThemes = (props) => {
	const themes = [
		{
			name: 'default',
			text: 'subscription_default_theme',
		},
		{
			name: 'midnight-theme',
			text: 'subscription_dark_blue_theme',
		},
		{
			name: 'palm-theme',
			text: 'subscription_palm_theme',
		},
		{
			name: 'leaf',
			text: 'subscription_leaf_theme',
		}
	];

	const getSelectedIndex = () => {
		const index = themes.findIndex(theme => theme.name === props.theme);
		return index;
	};

	const handleThemeClick = (index) => {
		const theme = themes[index];
		console.log('CLICK', index, themes, theme);
		props.changeTheme(theme.name);
	};

	return (
		<div className="content-subscription s-tabs-panel">
			<div className="row">
				<div className="columns column-subscription">
					<h1 className="subscription-title">{t('subscription_themes_title')}</h1>
					<span className="tooltip-icon s-tooltip-down-right" data-g-tooltip={t('subscription_themes_tooltip')}>
						<img src="../../app/images/panel/icon-information-tooltip-blue.svg" className="s-question" />
					</span>
					<RadioButtonGroup
						items={themes}
						handleItemClick={handleThemeClick}
						selectedIndex={getSelectedIndex(props.theme)}
					/>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
SubscriptionThemes.propTypes = {
	changeTheme: PropTypes.func.isRequired,
	theme: PropTypes.string.isRequired,
};

export default SubscriptionThemes;
