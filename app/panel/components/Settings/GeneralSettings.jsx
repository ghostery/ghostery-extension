/**
 * General Settings Component
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
import moment from 'moment/min/moment-with-locales.min';
/**
 * @class Implement General Settings subview. The view opens from the
 * left-side menu of the main Settings view.
 * @memberOf SettingsComponents
 */
class GeneralSettings extends React.Component {
	/**
	 *	Refactoring UNSAFE_componentWillMount into Constructor
	 *	Stats:
	 *		Constructor runtime before refactor: 0.026ms
	 *		Constructor + UNSAFE_componentWillMount runtime before refactor: 2.410ms
	 *		Constructor runtime after refactor: 1.631ms
	 *
	 *	Refactoring UNSAFE_componentWillMount into componentDidMount
	 *	Stats:
	 *		Constructor runtime with no componentDidMount: 0.208ms
	 *		Constructor runtime with componentDidMount: 0.074ms
	 *
	 *	Notes:
	 *		updateDbLastUpdated takes ~2ms to run the firt time and then 0.139ms subsequent times.
	 *
	 *	Conclusion: Refactor using componentDidMount as to not do computations in the constructor
	 */
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
	componentDidMount() {
		const { settingsData } = this.props;
		this.updateDbLastUpdated(settingsData);
	}

	/**
	 * Lifecycle event.
	 */
	static getDerivedStateFromProps(prevProps, prevState) {
		const dbLastUpdated = GeneralSettings.getDbLastUpdated(prevProps.settingsData);

		if (dbLastUpdated && dbLastUpdated !== prevState.dbLastUpdated) {
			return { dbLastUpdated };
		}
		return null;
	}

	/**
	 * Trigger action to check for new DB updates.
	 */
	updateDatabase() {
		const { actions } = this.props;
		actions.updateDatabase();
	}

	/**
	 * Get DB check timestamp and return it.
	 * @param  {Object} settingsData
	 */
	static getDbLastUpdated(settingsData) {
		const { language, bugs_last_updated } = settingsData;
		moment.locale(language).toLowerCase().replace('_', '-');
		const dbLastUpdated = moment(bugs_last_updated).format('LLL');
		return dbLastUpdated;
	}

	/**
	 * Update DB check timestamp and save it in state.
	 * @param  {Object} settingsData
	 */
	updateDbLastUpdated(settingsData) {
		const { dbLastUpdated } = this.state;
		const calcDbLastUpdated = GeneralSettings.getDbLastUpdated(settingsData);

		if (calcDbLastUpdated && calcDbLastUpdated !== dbLastUpdated) {
			this.setState({ dbLastUpdated: calcDbLastUpdated });
		}
	}

	/**
	* Render General Settings subview.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { settingsData, toggleCheckbox, dbLastUpdated } = this.props;
		return (
			<div className="s-tabs-panel">
				<div className="row">
					<div className="columns">
						<h3>{ t('settings_trackers') }</h3>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-auto-update" name="enable_autoupdate" defaultChecked={settingsData.enable_autoupdate} onClick={toggleCheckbox} />
								<label htmlFor="settings-auto-update">
									{ t('settings_auto_update') }
								</label>
								<div className="s-checkbox-label">
									<span id="last-updated-span">
										{ t('settings_last_update') }
										{' '}
									</span>
									<span id="last-updated-span-value">{ dbLastUpdated }</span>
									<span id="update-now-span" className="s-blue-header" onClick={this.updateDatabase}>
										{' '}
										{ settingsData.dbUpdateText }
									</span>
								</div>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-show-patterns" name="show_tracker_urls" defaultChecked={settingsData.show_tracker_urls} onClick={toggleCheckbox} />
								<label htmlFor="settings-show-patterns">
									<span>{ t('settings_show_patterns') }</span>
								</label>
								<div className="s-tooltip-up" data-g-tooltip={t('settings_show_patterns_tooltip')}>
									<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
								</div>
							</div>
						</div>
						<h3 className="s-special">{ t('settings_highlight_trackers') }</h3>
						<div className="s-tooltip-down-click-to-play-img" data-g-tooltip={t('settings_highlight_trackers_tooltip')}>
							<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-enable-click2play" name="enable_click2play" defaultChecked={settingsData.enable_click2play} onClick={toggleCheckbox} />
								<label htmlFor="settings-enable-click2play">
									{ t('settings_required_trackers') }
								</label>
							</div>
						</div>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-replace-social" name="enable_click2play_social" defaultChecked={settingsData.enable_click2play_social} onClick={toggleCheckbox} />
								<label htmlFor="settings-replace-social">{ t('settings_replace_social') }</label>
							</div>
						</div>
						<h3>{ t('settings_blocking') }</h3>
						<div className="s-option-group">
							<div className="s-square-checkbox">
								<input type="checkbox" id="settings-individual-trackers" name="toggle_individual_trackers" defaultChecked={settingsData.toggle_individual_trackers} onClick={toggleCheckbox} />
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
								<input type="checkbox" id="settings-allow-trackers" name="ignore_first_party" defaultChecked={settingsData.ignore_first_party} onClick={toggleCheckbox} />
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
								<input type="checkbox" id="settings-block-trackers" name="block_by_default" defaultChecked={settingsData.block_by_default} onClick={toggleCheckbox} />
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
