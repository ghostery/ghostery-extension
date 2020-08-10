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
import ImportExport from './ImportExport';
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
		const { settingsData } = this.props;
		settingsData.history.push('/login');
	}

	/**
	 * Implement handler for 'Edit' link on the Account
	 * view in signed in state to open Profile web page
	 * where user can adjust data of his/her account.
	 */
	clickEditAccount = () => {
		sendMessage('openNewTab', {
			url: `${globals.ACCOUNT_BASE_URL}/`,
			become_active: true,
		});
		window.close();
	}

	/**
	* Render Account subview.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { settingsData, actions } = this.props;
		const { email, firstName, lastName } = settingsData.user ? settingsData.user : {};
		const accountName = (firstName || lastName) ? (firstName ? (`${firstName} ${lastName}`) : lastName) : '';
		return (
			<div className="s-tabs-panel">
				<div className="row">
					<div className="columns">
						<h3>{ t('settings_account') }</h3>
						<div className={email ? 's-hide' : ''}>
							<p className="s-blue-header" onClick={this.clickSigninCreate}>{ t('settings_signin_create_header') }</p>
							<p>{ t('settings_sign_create_text') }</p>
							<div className="s-vgap-46" />
						</div>
						<div className={email ? '' : 's-hide'}>
							<div className="s-vgap-22" />
							<h5 className={accountName ? '' : 's-hide'} id="settings-account-name">
								{ t('settings_account_name') }
								<span>
									:
									{' '}
									{ accountName }
								</span>
							</h5>
							<div className="s-vgap-4" />
							<h5>
								{ t('settings_account_email') }
								<span>
									:
									{' '}
									{ email }
								</span>
							</h5>
							<div className="s-vgap-4" />
							<p className="s-blue-header" onClick={this.clickEditAccount}>{ t('settings_edit_account') }</p>
							<div className="s-vgap-26" />
						</div>
						<ImportExport
							settingsData={settingsData}
							actions={actions}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default Account;
