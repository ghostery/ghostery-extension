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

const { IS_CLIQZ, BROWSER_INFO } = globals;
const IS_ANDROID = (BROWSER_INFO.os === 'android');

const TOOLTIP_SVG_FILEPATH = '../../app/images/panel/icon-information-tooltip.svg';

/**
 * @class Implement Opt In subview as a React component.
 * The view opens from the left-side menu of the main Settings view.
 * It invites user to opt in for telemetry options, human web and offers
 * @memberOf SettingsComponents
 */
const OptIn = ({ settingsData, toggleCheckbox }) => {
	const checkbox = (id, name) => (
		<input
			type="checkbox"
			id={id}
			name={name}
			defaultChecked={settingsData[name]}
			onClick={toggleCheckbox}
		/>
	);

	const labelFor = inputId => (
		<label htmlFor={inputId}>
			<span>{t(inputId.replaceAll('-', '_'))}</span>
		</label>
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
					<div className="s-option-group">
						<div className="s-square-checkbox">
							{checkbox('settings-share-usage', 'enable_metrics')}
							{labelFor('settings-share-usage')}
							<div className="s-tooltip-down" data-g-tooltip={t('settings_share_usage_tooltip')}>
								<img src={TOOLTIP_SVG_FILEPATH} className="s-question" />
							</div>
						</div>
					</div>
					{!IS_CLIQZ && (
						<div className="s-option-group" id="human-web-section">
							<div className="s-square-checkbox">
								{checkbox('settings-share-usage', 'enable_human_web')}
								{labelFor('settings-share-human-web')}
								<div className="s-tooltip-up" data-g-tooltip={t('settings_human_web_tooltip')}>
									<img src={TOOLTIP_SVG_FILEPATH} className="s-question" />
								</div>
							</div>
						</div>
					)}
					{!IS_CLIQZ && !IS_ANDROID && (
						<div className="s-option-group" id="offers-section">
							<div className="s-square-checkbox">
								{checkbox('settings-allow-offers', 'enable_offers')}
								{labelFor('settings-allow-offers')}
								<div className="s-tooltip-up" data-g-tooltip={t('settings_offers_tooltip')}>
									<img src={TOOLTIP_SVG_FILEPATH} className="s-question" />
								</div>
							</div>
						</div>
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
		enable_offers: PropTypes.bool.isRequired,
	}).isRequired,
};

export default OptIn;
