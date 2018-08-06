/**
 * General Settings Component
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

import React from 'react';
import moment from 'moment/min/moment-with-locales.min';
/**
 * @class Implement General Settings subview. The view opens from the
 * left-side menu of the main Settings view.
 * @memberOf SettingsComponents
 */
class GeneralSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dbLastUpdated: '',
		};

		// event bindings
		this.updateDatabase = this.updateDatabase.bind(this);
	}
	/**
	 * Lifecycle event.
	 */
	componentWillMount() {
		this.updateDbLastUpdated(this.props);
	}
	/**
	 * Lifecycle event.
	 */
	componentWillReceiveProps(nextProps) {
		this.updateDbLastUpdated(nextProps);
	}
	/**
	 * Trigger action to check for new DB updates.
	 */
	updateDatabase() {
		this.props.actions.updateDatabase();
	}

	/**
	 * Update DB check timestamp and save it in state.
	 * @param  {Object} props
	 */
	updateDbLastUpdated(props) {
		moment.locale(props.language).toLowerCase().replace('_', '-');
		this.setState({ dbLastUpdated: moment(props.bugs_last_updated).format('LLL') });
	}
	/**
	* Render General Settings subview.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { settingsData } = this.props;
		return (
			<div className="s-tabs-panel">
				<div className="row">
					<div className="columns">
						<h3>{ t('settings_trackers') }</h3>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-auto-update" name="enable_autoupdate" defaultChecked={settingsData.enable_autoupdate} onClick={this.props.toggleCheckbox} />
								<label htmlFor="settings-auto-update">
									{ t('settings_auto_update') }
								</label>
								<div className="s-checkbox-label">
									<span id="last-updated-span">{ t('settings_last_update') }</span> <span id="last-updated-span-value">{ this.state.dbLastUpdated }</span>
									<span id="update-now-span" className="s-blue-header" onClick={this.updateDatabase} > { settingsData.dbUpdateText }</span>
								</div>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-show-patterns" name="show_tracker_urls" defaultChecked={settingsData.show_tracker_urls} onClick={this.props.toggleCheckbox} />
								<label htmlFor="settings-show-patterns">
									<span>{ t('settings_show_patterns') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_show_patterns_tooltip')}>
									<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
						<h5>{ t('settings_highlight_trackers') }</h5>
						<div className="s-tooltip-down-click-to-play-img" data-g-tooltip={t('settings_highlight_trackers_tooltip')}>
							<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-enable-click2play" name="enable_click2play" defaultChecked={settingsData.enable_click2play} onClick={this.props.toggleCheckbox} />
								<label htmlFor="settings-enable-click2play">
									{ t('settings_required_trackers') }
								</label>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-replace-social" name="enable_click2play_social" defaultChecked={settingsData.enable_click2play_social} onClick={this.props.toggleCheckbox} />
								<label htmlFor="settings-replace-social">{ t('settings_replace_social') }</label>
							</div>
						</div>
						<h3>{ t('settings_blocking') }</h3>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-individual-trackers" name="toggle_individual_trackers" defaultChecked={settingsData.toggle_individual_trackers} onClick={this.props.toggleCheckbox} />
								<label htmlFor="settings-individual-trackers">
									<span>{ t('settings_individual_trackers') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_individual_trackers_tooltip')}>
									<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-allow-trackers" name="ignore_first_party" defaultChecked={settingsData.ignore_first_party} onClick={this.props.toggleCheckbox} />
								<label htmlFor="settings-allow-trackers">
									<span>{ t('settings_allow_trackers') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_allow_trackers_tooltip')}>
									<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-block-trackers" name="block_by_default" defaultChecked={settingsData.block_by_default} onClick={this.props.toggleCheckbox} />
								<label htmlFor="settings-block-trackers">
									{ t('settings_block_trackers') }
								</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default GeneralSettings;
