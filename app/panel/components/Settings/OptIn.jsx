/**
 * Opt-In Settings Component
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

import React from 'react';
import PropTypes from 'prop-types';
import globals from '../../../../src/classes/Globals';

const { IS_CLIQZ } = globals;

const TOOLTIP_SVG_FILEPATH = '../../app/images/panel/icon-information-tooltip.svg';

/**
 * @class Implement Opt In subview as a React component.
 * The view opens from the left-side menu of the main Settings view.
 * It invites user to opt in for telemetry options and human web
 * @memberOf SettingsComponents
 */
const OptIn = ({ settingsData, toggleCheckbox }) => {
	const checkbox = (opt, name) => (
		<input
			type="checkbox"
			id={`settings-${opt}`}
			name={name}
			defaultChecked={settingsData[name]}
			onClick={toggleCheckbox}
		/>
	);

	const labelFor = (opt, text) => (
		<label htmlFor={`settings-${opt}`}>
			<span>{text}</span>
		</label>
	);

	const tooltipSVG = (text, dir) => (
		<div className={`s-tooltip-${dir}`} data-g-tooltip={text}>
			<img src={TOOLTIP_SVG_FILEPATH} className="s-question" />
		</div>
	);

	const option = (cbox, label, tooltip, id = '') => (
		<div className="s-option-group" id={id}>
			<div className="s-square-checkbox">
				{cbox}
				{label}
				{tooltip}
			</div>
		</div>
	);

	return (
		<div className="s-tabs-panel">
			<div className="row">
				<div className="columns">
					<h3>{t('settings_support_ghostery')}</h3>
					<h5>
						{t('settings_support_ghostery_by')}
						:
					</h5>
					{option(
						checkbox('share-usage', 'enable_metrics'),
						labelFor('share-usage', t('settings_share_usage')),
						tooltipSVG(t('settings_share_usage_tooltip'), 'down')
					)}
					{!IS_CLIQZ && option(
						checkbox('share-human-web', 'enable_human_web'),
						labelFor('share-human-web', t('settings_share_human_web')),
						tooltipSVG(t('settings_human_web_tooltip'), 'up'),
						'human-web-section'
					)}
					{option(
						checkbox('allow-abtests', 'enable_abtests'),
						labelFor('allow-abtests', t('settings_allow_abtests')),
						tooltipSVG(t('settings_abtests_tooltip'), 'up'),
						'abtests-section'
					)}
				</div>
			</div>
		</div>
	);
};

OptIn.propTypes = {
	toggleCheckbox: PropTypes.func.isRequired,
	settingsData: PropTypes.shape({
		enable_metrics: PropTypes.bool.isRequired,
		enable_human_web: PropTypes.bool.isRequired,
		enable_abtests: PropTypes.bool.isRequired,
	}).isRequired,
};

export default OptIn;
