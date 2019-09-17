/**
 * Notifications Settings Component
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
/**
 * @class Implement Notification subview as a React component.
 * The view opens from the left-side menu of the main
 * Settings view.
 * @memberOf SettingsComponents
 */
const Notifications = (props) => {
	const { settingsData } = props;
	return (
		<div className="s-tabs-panel">
			<div className="row">
				<div className="columns">
					<h3>{ t('settings_notifications') }</h3>
					<h5>{ t('settings_notify_me') }</h5>
					<div className="s-tooltip-down" data-g-tooltip={t('settings_notify_me_tooltip')}>
						<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-announcements" name="show_cmp" defaultChecked={settingsData.show_cmp} onClick={props.toggleCheckbox} />
							<label id="settings-announcements-label" htmlFor="settings-announcements">{ t('settings_announcements') }</label>
						</div>
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-new-features" name="notify_upgrade_updates" defaultChecked={settingsData.notify_upgrade_updates} onClick={props.toggleCheckbox} />
							<label id="settings-new-features-label" htmlFor="settings-new-features">{ t('settings_new_features') }</label>
						</div>
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-new-promotions" name="notify_promotions" defaultChecked={settingsData.notify_promotions} onClick={props.toggleCheckbox} />
							<label id="settings-new-features-label" htmlFor="settings-new-promotions">{ t('settings_new_promotions') }</label>
						</div>
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-new-trackers" name="notify_library_updates" defaultChecked={settingsData.notify_library_updates} onClick={props.toggleCheckbox} />
							<label id="settings-new-trackers-label" htmlFor="settings-new-trackers">{ t('settings_new_trackers') }</label>
						</div>
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-show-reload-banner" name="reload_banner_status" defaultChecked={settingsData.reload_banner_status} onClick={props.toggleCheckbox} />
							<label id="settings-show-reload-banner-label" htmlFor="settings-show-reload-banner">{ t('settings_show_reload_banner') }</label>
						</div>
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-show-trackers-banner" name="trackers_banner_status" defaultChecked={settingsData.trackers_banner_status} onClick={props.toggleCheckbox} />
							<label id="settings-show-trackers-banner-label" htmlFor="settings-show-trackers-banner">{ t('settings_show_trackers_banner') }</label>
						</div>
					</div>
					<div className="s-option-group">
						<div className="s-square-checkbox">
							<input type="checkbox" id="settings-show-count-badge" name="show_badge" defaultChecked={settingsData.show_badge} onClick={props.toggleCheckbox} />
							<label id="settings-show-count-badge-label" htmlFor="settings-show-count-badge">{ t('settings_show_tracker_count_badge') }</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Notifications;
