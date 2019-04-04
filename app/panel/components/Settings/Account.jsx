/**
 * Account Settings Component
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
/**
 * @namespace  SettingsComponents
 */
import React from 'react';
import { sendMessage } from '../../utils/msg';
import globals from '../../../../src/classes/Globals';
/**
 * @class Implement Account subview. The view opens from the
 * left-side menu of the main Settings view.
 * @memberOf SettingsComponents
 */
class Account extends React.Component {
	/**
	 * Implement handler for 'Sign In' link on the Account
	 * view to open Sign In (Login) view.
	 */
	clickSigninCreate = () => {
		this.props.settingsData.history.push('/login');
	}
	/**
	 * Implement handler for 'Edit' link on the Account
	 * view in signed in state to open Profile web page
	 * where user can adjust data of his/her account.
	 */
	clickEditAccount = () => {
		sendMessage('openNewTab', {
			url: `https:\/\/account.${globals.GHOSTERY_DOMAIN}.com/`,
			become_active: true,
		});
		window.close();
	}
	/**
	 * Trigger action to export settings in JSON format and save it to a file.
	 */
	clickExportSettings = () => {
		this.props.actions.exportSettings(this.props.settingsData.pageUrl);
	}

	/**
	 * Trigger custom Import dialog or a native Open File dialog depending on browser.
	 */
	clickImportSettings = () => {
		const browserName = globals.BROWSER_INFO.name;
		if (browserName === 'edge' || browserName === 'firefox') {
			// show ghostery dialog window for import
			this.props.actions.importSettingsDialog(this.props.settingsData.pageUrl);
		} else {
			// for chrome and opera, use the native File Dialog
			this.selectedFile.click();
		}
	}

	/**
	 * Parse settings file imported via native browser window. Called via input#select-file onChange.
	 */
	validateImportFile = () => {
		this.props.actions.importSettingsNative(this.selectedFile.files[0]);
	}
	/**
	* Render Account subview.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { settingsData } = this.props;
		const { email, firstName, lastName } = settingsData.user ? settingsData.user : {};
		const accountName = (firstName || lastName) ? (firstName ? (`${firstName} ${lastName}`) : lastName) : '';
		return (
			<div className="s-tabs-panel">
				<div className="row">
					<div className="columns">
						<h3>{ t('settings_account') }</h3>
						<div className={email ? 's-hide' : ''} >
							<p className="s-blue-header" onClick={this.clickSigninCreate} >{ t('settings_signin_create_header') }</p>
							<p>{ t('settings_sign_create_text') }</p>
							<div className="s-vgap-46" />
						</div>
						<div className={email ? '' : 's-hide'} >
							<div className="s-vgap-22" />
							<h5 className={accountName ? '' : 's-hide'} id="settings-account-name">{ t('settings_account_name') }:  <span>{ accountName }</span></h5>
							<div className="s-vgap-4" />
							<h5>{ t('settings_account_email') }: <span>{ email }</span></h5>
							<div className="s-vgap-4" />
							<p className="s-blue-header" onClick={this.clickEditAccount} >{ t('settings_edit_account') }</p>
							<div className="s-vgap-26" />
						</div>
						<div>
							<p className="s-blue-header export" onClick={this.clickExportSettings} >{ t('settings_export_header') }</p>
							<p className={`s-regular ${settingsData.exportResultText ? 's-hide' : ''}`} >{ t('settings_export_text') }</p>
							<p className="s-regular export-result" style={settingsData.actionSuccess ? { color: '#2092BF' } : { color: 'red' }} >{ settingsData.exportResultText }</p>
							<div className="s-vgap-20" />
							<p className="s-blue-header import" onClick={this.clickImportSettings}>{ t('settings_import_header') }</p>
							<p className={`s-regular ${settingsData.importResultText ? 's-hide' : ''}`} >{ t('settings_import_text') }</p>
							<p className={`s-regular ${settingsData.importResultText ? 's-hide' : ''}`} >{ t('settings_import_warning') }</p>
							<p className="s-regular import-result" style={settingsData.actionSuccess ? { color: '#2092BF' } : { color: 'red' }} >{ settingsData.importResultText }</p>
							<input ref={(input) => { this.selectedFile = input; }} type="file" id="select-file" name="select-file" onChange={this.validateImportFile} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Account;
