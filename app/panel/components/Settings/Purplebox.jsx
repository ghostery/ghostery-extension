/**
 * Purplebox Settings Component
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
/**
 * @class Implement Purplebox subview as a React component.
 * The view allows to set parameters for Ghostery purplebox.
 * @memberOf SettingsComponents
 */
const Purplebox = (props) => {
	const { settingsData } = props;
	return (
		<div className="s-tabs-panel">
			<div className="row">
				<div className="columns">
					<h3>{ t('settings_purple_box') }</h3>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-show-purple-box" name="show_alert" defaultChecked={settingsData.show_alert} onClick={props.toggleCheckbox} />
							<label htmlFor="settings-show-purple-box"><span>{ t('settings_show_purple_box') }</span></label>
							<div className="s-tooltip-down" data-g-tooltip={t('settings_show_purple_box_tooltip')}>
								<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
							</div>
						</div>
					</div>
					<div className="s-alert-bubble-options dismiss-after-wrap">
						<div>
							{ t('settings_dismiss_after') }
						</div>
						<select id="settings-dismiss-after" name="alert_bubble_timeout" defaultValue={settingsData.alert_bubble_timeout} onChange={props.selectItem} >
							<option value="0">
								{ t('settings_never') }
							</option>
							<option value="3">
								3 { t('settings_seconds') }
							</option>
							<option value="5">
								5 { t('settings_seconds') }
							</option>
							<option value="10">
								10 { t('settings_seconds') }
							</option>
							<option value="15">
								15 { t('settings_seconds') }
							</option>
							<option value="30">
								30 { t('settings_seconds') }
							</option>
						</select>
					</div>
					<div className="s-alert-bubble-options display-in-wrap">
						<div>
							{ t('settings_display_in') }
						</div>
						<select id="settings-display-in" name="alert_bubble_pos" defaultValue={settingsData.alert_bubble_pos} onChange={props.selectItem} >
							<option value="br">
								{ t('settings_bottom_right_corner') }
							</option>
							<option value="bl">
								{ t('settings_bottom_left_corner') }
							</option>
							<option value="tr">
								{ t('settings_top_right_corner') }
							</option>
							<option value="tl">
								{ t('settings_top_left_corner') }
							</option>
						</select>
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-hide-alert-trusted" name="hide_alert_trusted" defaultChecked={settingsData.hide_alert_trusted} onClick={props.toggleCheckbox} />
							<label htmlFor="settings-hide-alert-trusted">
								<span>{ t('settings_hide_alert_trusted') }</span>
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Purplebox;
