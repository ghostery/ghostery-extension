//SubscriptionInfo
/**
 * Subscription Info Component
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
 * @class Implement Subscription Info in subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It invites user to examine the status of his subscription 
 * @memberOf SubscriptionComponents
 */
const SubscriptionInfo = (props) => {
	//const { subscriptionData } = props;
	const subscriptionData = {};
	subscriptionData.canceled = "August 5, 2018";
	return (
		<div className="content-subscription s-tabs-panel">
			<div className="row">
				<div className="columns column-subscription">
					<h1>{ t('subscription_info_title') }</h1>
					<div>
						<span>{`${t('subscription_account_status')}: `}</span>
						<span>{subscriptionData.canceled ? `${t ('subscription_account_canceled')} ${subscriptionData.canceled}` :  t('subscription_account_active') }</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionInfo;
