/**
 * Settings Component
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
import { ReactSVG } from 'react-svg';
import TrustAndRestrict from '../../../panel/components/Settings/TrustAndRestrict';
import GeneralSettings from '../../../panel/components/Settings/GeneralSettings';
import AdBlocker from '../../../panel/components/Settings/AdBlocker';
import Notifications from '../../../panel/components/Settings/Notifications';
import OptIn from '../../../panel/components/Settings/OptIn';
import ImportExport from '../../../panel/components/Settings/ImportExport';
import Help from '../../../panel/components/Help';
import About from '../../../panel/components/About';
import globals from '../../../../src/classes/Globals';

const { IS_CLIQZ } = globals;

class Settings extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			view: 'settings-home',
		};
	}

	clickBack = () => {
		const { clickHome } = this.props;
		const { view } = this.state;

		if (view === 'settings-home') {
			clickHome();
		} else {
			this.setState({ view: 'settings-home' });
		}
	}

	updateSitePolicy = ({ type, pageHost }) => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'updateSitePolicy',
			actionData: { type, pageHost },
		});
	}

	updateDatabase = () => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'updateDatabase',
		});
	}

	toggleCheckbox = (event) => {
		const { callGlobalAction } = this.props;
		const { name, checked } = event.currentTarget;

		callGlobalAction({
			actionName: 'updateSettingCheckbox',
			actionData: { name, checked },
		});
	}

	selectItem = ({ event, value }) => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'selectItem',
			actionData: { event, value },
		});
	}

	exportSettings = () => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'exportSettings',
		});
	}

	importSettingsDialog = () => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'importSettingsDialog',
		});
	}

	importSettingsNative = (importFile) => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'importSettingsNative',
			actionData: importFile,
		});
	}

	_renderSettingsHeader() {
		const { view } = this.state;

		let headerText;
		switch (view) {
			case 'settings-home':
				headerText = t('panel_menu_settings');
				break;
			case 'settings-trust-restrict':
				headerText = t('settings_trust_and_restrict');
				break;
			case 'settings-general':
				headerText = t('settings_general_settings');
				break;
			case 'settings-adblocker':
				headerText = t('settings_adblocker');
				break;
			case 'settings-notifications':
				headerText = t('settings_notifications');
				break;
			case 'settings-opt-in':
				headerText = t('settings_opt_in');
				break;
			case 'settings-import-export':
				headerText = t('settings_import_export');
				break;
			case 'settings-help':
				headerText = t('panel_menu_help');
				break;
			case 'settings-about':
				headerText = t('panel_menu_about');
				break;
			default:
				headerText = '';
		}

		return (
			<div className="SettingsHeader">
				<ReactSVG
					className="SettingsHeader__icon"
					src="/app/images/panel/header-back-arrow.svg"
					onClick={this.clickBack}
				/>
				<span className="SettingsHeader__text">{headerText}</span>
			</div>
		);
	}

	_renderSettingsHome() {
		return (
			<div className="row">
				<div className="column">
					<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-trust-restrict' }); }}>
						{ t('settings_trust_and_restrict') }
					</div>
					<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-general' }); }}>
						{ t('settings_general_settings') }
					</div>
					{!IS_CLIQZ && (
						<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-adblocker' }); }}>
							{ t('settings_adblocker') }
						</div>
					)}
					<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-notifications' }); }}>
						{ t('settings_notifications') }
					</div>
					<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-opt-in' }); }}>
						{ t('settings_opt_in') }
					</div>
					<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-import-export' }); }}>
						{ t('settings_import_export') }
					</div>
					<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-help' }); }}>
						{ t('panel_menu_help') }
					</div>
					<div className="Settings__link clickable" onClick={() => { this.setState({ view: 'settings-about' }); }}>
						{ t('panel_menu_about') }
					</div>
				</div>
			</div>
		);
	}

	_renderSettingsTrustRestrict() {
		const { summary } = this.props;
		const { site_whitelist, site_blacklist } = summary;
		const actions = {
			updateSitePolicy: this.updateSitePolicy,
		};

		return (
			<TrustAndRestrict
				actions={actions}
				site_whitelist={site_whitelist}
				site_blacklist={site_blacklist}
			/>
		);
	}

	_renderSettingsGeneral() {
		const { settings } = this.props;
		const actions = {
			updateDatabase: this.updateDatabase,
		};

		return (
			<GeneralSettings
				actions={actions}
				toggleCheckbox={this.toggleCheckbox}
				settingsData={settings}
			/>
		);
	}

	_renderSettingsAdBlocker() {
		const { settings } = this.props;
		const actions = {
			selectItem: this.selectItem,
		};

		return (
			<AdBlocker
				actions={actions}
				settingsData={settings}
			/>
		);
	}

	_renderSettingsNotification() {
		const { settings } = this.props;

		return (
			<Notifications
				toggleCheckbox={this.toggleCheckbox}
				settingsData={settings}
			/>
		);
	}

	_renderSettingsOptIn() {
		const { settings } = this.props;

		return (
			<OptIn
				toggleCheckbox={this.toggleCheckbox}
				settingsData={settings}
			/>
		);
	}

	_renderSettingsImportExport() {
		const { summary, settings } = this.props;
		const { pageUrl = '' } = summary;
		const {
			exportResultText = '',
			importResultText = '',
			actionSuccess = false,
		} = settings;
		const settingsData = {
			pageUrl,
			exportResultText,
			importResultText,
			actionSuccess,
		};
		const actions = {
			exportSettings: this.exportSettings,
			importSettingsDialog: this.importSettingsDialog,
			importSettingsNative: this.importSettingsNative,
		};

		return (
			<div className="s-tabs-panel">
				<div className="row">
					<div className="column">
						<ImportExport
							settingsData={settingsData}
							actions={actions}
						/>
					</div>
				</div>
			</div>
		);
	}

	render() {
		const { view } = this.state;

		return (
			<div id="content-settings" className="Settings">
				{this._renderSettingsHeader()}
				{view === 'settings-home' && this._renderSettingsHome()}
				{view === 'settings-trust-restrict' && this._renderSettingsTrustRestrict()}
				{view === 'settings-general' && this._renderSettingsGeneral()}
				{view === 'settings-adblocker' && this._renderSettingsAdBlocker()}
				{view === 'settings-notifications' && this._renderSettingsNotification()}
				{view === 'settings-opt-in' && this._renderSettingsOptIn()}
				{view === 'settings-import-export' && this._renderSettingsImportExport()}
				{view === 'settings-help' && (<Help />)}
				{view === 'settings-about' && (<About />)}
			</div>
		);
	}
}

Settings.propTypes = {
	summary: PropTypes.shape({
		site_whitelist: PropTypes.arrayOf(PropTypes.string).isRequired,
		site_blacklist: PropTypes.arrayOf(PropTypes.string).isRequired,
	}).isRequired,
	settings: PropTypes.shape({}).isRequired,
	clickHome: PropTypes.func.isRequired,
	callGlobalAction: PropTypes.func.isRequired,
};

export default Settings;
