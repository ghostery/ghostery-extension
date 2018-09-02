// SubscriptionInfo
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

import React from 'react';
import globals from '../../../../src/classes/Globals';
/**
 * @class Implement Subscription Info in subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It invites user to examine the status of his subscription
 * @memberOf SubscriptionComponents
 */
const SubscriptionInfo = (props) => {
	const {
		active, next_charge_date, expired_date, auto_renewal
	} = props.subscriptionData;
	return (
		<div className="content-subscription s-tabs-panel">
			<div className="row">
				<div className="columns column-subscription">
					<h1>{ t('subscription_info_title') }</h1>
					<div className="status-row">
						<span className="status-label">{`${t('subscription_status')}: `}</span>
						<span className="status-value blue">{active ? t('subscription_active') : t('subscription_inactive') }</span>
						<div className="s-tooltip-down-right" data-g-tooltip={active ? t('subscription_active_tooltip') : t('subscription_inactive_tooltip')}>
							<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
						</div>
					</div>
					<div className="status-row">
						<span className="status-label light">{active ? `${t('subscription_charge_date')}: ` : `${t('subscription_expired')}: `}</span>
						<span className="status-value light">{active ? next_charge_date : expired_date}</span>
					</div>
					<div className="status-row">
						<span className="status-label light">{`${t('subscription_auto_renewal')}: `}</span>
						<span className="status-value light">{auto_renewal ? t('subscription_active') : t('subscription_inactive') }</span>
					</div>
					<div className="list-row">
						<ul>
							<li className="list-item">{t('subscription_midnight_theme')}</li>
							<li className="list-item">{t('subscription_priority_support')}</li>
							{/* <li className="list-item">{t('subscription_tracker_stats')}</li> */}
						</ul>
					</div>
					<div className="manage-row">
						<div className="manage-icon" />
						<a className="manage-link" href={`https:\/\/account.${globals.GHOSTERY_DOMAIN}.com/en/subscription`} target="_blank" rel="noopener noreferrer">
							<span>{t('subscription_manage')}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionInfo;
