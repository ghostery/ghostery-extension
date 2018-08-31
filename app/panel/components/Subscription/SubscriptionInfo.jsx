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

/**
 * @class Implement Subscription Info in subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It invites user to examine the status of his subscription
 * @memberOf SubscriptionComponents
 */
const SubscriptionInfo = () => {
	// let { subscriptionData } = props;
	// subscriptionData = subscriptionData || {};
	// Get it from background eventually
	const subscriptionData = {};
	subscriptionData.active = true;
	subscriptionData.next_charge_date = 'April 5, 2019';
	subscriptionData.expired_date = 'April 5, 2018';
	subscriptionData.auto_renewal = true;
	return (
		<div className="content-subscription s-tabs-panel">
			<div className="row">
				<div className="columns column-subscription">
					<h1>{ t('subscription_info_title') }</h1>
					<div className="status-row">
						<span className="status-label">{`${t('subscription_status')}: `}</span>
						<span className="status-value blue">{subscriptionData.active ? t('subscription_active') : t('subscription_inactive') }</span>
						<div className="s-tooltip-down-right" data-g-tooltip={subscriptionData.active ? t('subscription_active_tooltip') : t('subscription_inactive_tooltip')}>
							<img src="../../app/images/panel/icon-information-tooltip.svg" className="s-question" />
						</div>
					</div>
					<div className="status-row">
						<span className="status-label light">{subscriptionData.active ? `${t('subscription_charge_date')}: ` : `${t('subscription_expired')}: `}</span>
						<span className="status-value light">{subscriptionData.active ? subscriptionData.next_charge_date : subscriptionData.expired_date}</span>
					</div>
					<div className="status-row">
						<span className="status-label light">{`${t('subscription_auto_renewal')}: `}</span>
						<span className="status-value light">{subscriptionData.auto_renewal ? t('subscription_active') : t('subscription_inactive') }</span>
					</div>
					<div className="list-row">
						<ul>
							<li className="list-item">{t('subscription_midnight_theme')}</li>
							<li className="list-item">{t('subscription_priority_support')}</li>
							<li className="list-item">{t('subscription_tracker_stats')}</li>
						</ul>
					</div>
					<div className="manage-row">
						<div className="manage-icon" />
						<a className="manage-link" href="https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/" target="_blank" rel="noopener noreferrer">
							<span>{t('subscription_manage')}</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionInfo;
