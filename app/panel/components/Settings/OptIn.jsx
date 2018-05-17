/**
 * Opt-In Settings Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import globals from '../../../../src/classes/Globals';

const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');
const IS_CLIQZ = (globals.BROWSER_INFO.name === 'cliqz');

/**
 * @class Implement Opt In subview as a React component.
 * The view opens from the left-side menu of the main Settings view.
 * It invites user to opt in for telemetry options, human web and offers
 * @memberOf SettingsComponents
 */
const OptIn = (props) => {
	const { settingsData } = props;
	return (
		<div className="s-tabs-panel">
			<div className="row">
				<div className="columns">
					<h3>{ t('settings_support_ghostery') }</h3>
					<h5>{ t('settings_support_ghostery_by') }:</h5>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-share-usage" name="enable_metrics" defaultChecked={settingsData.enable_metrics} onClick={props.toggleCheckbox} />
							<label htmlFor="settings-share-usage">
								<span>{ t('settings_share_usage') }</span>
							</label>
							<div className="s-tooltip-down" data-g-tooltip={t('settings_share_usage_tooltip')}>
								<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
							</div>
						</div>
					</div>
					{!IS_EDGE && !IS_CLIQZ &&
						<div>
							<div className="s-option-group" id="human-web-section">
								<div className="s-square-checkbox">
									<input type="checkbox" id="settings-share-human-web" name="enable_human_web" defaultChecked={settingsData.enable_human_web} onClick={props.toggleCheckbox} />
									<label htmlFor="settings-share-human-web">
										<span>{ t('settings_share_human_web') }</span>
									</label>
									<div className="s-tooltip-up" data-g-tooltip={t('settings_human_web_tooltip')}>
										<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
									</div>
								</div>
							</div>
							<div className="s-option-group" id="offers-section">
								<div className="s-square-checkbox">
									<input type="checkbox" id="settings-allow-offers" name="enable_offers" defaultChecked={settingsData.enable_offers} onClick={props.toggleCheckbox} />
									<label htmlFor="settings-allow-offers">
										<span>{ t('settings_allow_offers') }</span>
									</label>
									<div className="s-tooltip-up" data-g-tooltip={t('settings_offers_tooltip')}>
										<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
									</div>
								</div>
							</div>
						</div>
					}
				</div>
			</div>
		</div>
	);
};

export default OptIn;
