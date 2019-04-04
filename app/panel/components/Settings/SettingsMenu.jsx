/**
 * Settings Menu Component
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
import { NavLink } from 'react-router-dom';
import ClassNames from 'classnames';
/**
 * @const Implement left pane of the main Settings view as a
 * menu which allows to navigate to Setting subviews.
 * The view allows to set parameters for Ghostery purplebox.
 * @memberOf SettingsComponents
 */
const SettingsMenu = (props) => {
	const listClassNames = ClassNames('content-settings-menu menu vertical no-bullet', {
		's-hide': props.is_expanded,
	});
	return (
		<ul className={listClassNames}>
			<li className="s-tabs-title">
				<NavLink to="/settings/globalblocking">
					<span>{ t('settings_global_blocking') }</span>
				</NavLink>
			</li>
			<li className="s-tabs-title">
				<NavLink to="/settings/trustandrestrict">
					<span>{ t('settings_trust_and_restrict') }</span>
				</NavLink>
			</li>
			<li className="s-tabs-title">
				<NavLink to="/settings/generalsettings">
					<span>{ t('settings_general_settings') }</span>
				</NavLink>
			</li>
			<li className="s-tabs-title">
				<NavLink to="/settings/notifications">
					<span>{ t('settings_notifications') }</span>
				</NavLink>
			</li>
			<li className="s-tabs-title">
				<NavLink to="/settings/optin">
					<span>{ t('settings_opt_in') }</span>
				</NavLink>
			</li>
			<li className="s-tabs-title">
				<NavLink to="/settings/purplebox">
					<span>{ t('settings_purple_box') }</span>
				</NavLink>
			</li>
			<li className="s-tabs-title">
				<NavLink to="/settings/account">
					<span>{ t('settings_account') }</span>
				</NavLink>
			</li>
		</ul>
	);
};

export default SettingsMenu;
