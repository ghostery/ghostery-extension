/**
 * Subscription Info Component
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
import { sendMessage, openSubscriptionPage } from '../../utils/msg';

/**
 * Helper function to handle clicking on the Resubscribe button
 */
function _handleResubscribeClick() {
	sendMessage('ping', 'resubscribe');
	openSubscriptionPage();
}

/**
 * Helper function to handle clicking on the Manage Subscription button
 */
function _handleManageClick() {
	sendMessage('ping', 'manage_subscription');
	openSubscriptionPage();
}

/**
 * @class Implement Subscription Info in subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It invites user to examine the status of his subscription
 * @memberOf SubscriptionComponents
 */
const SubscriptionInfo = (props) => {
	const {
		productName, active, plan_amount, plan_interval, charge_date, plan_ends, loading
	} = props.subscriptionData;
	const subscriptionExpiration = (plan_ends > 1) ? t('subscription_days_left', plan_ends.toString()) : t('subscription_one_day_left');
	return (
		<div className="content-subscription s-tabs-panel">
			<div className="row">
				<div className="columns column-subscription">
					{productName === 'Ghostery Premium' && (
						<h1>{ t('panel_detail_premium_title') }</h1>
					)}
					{productName === 'Ghostery Plus' && (
						<h1>{ t('ghostery_plus') }</h1>
					)}
					{loading ? (
						<div className="loading" />
					) : (
						<div>
							<div className="status-row">
								<span className="status-label">{`${t('subscription_plan')}: `}</span>
								<span className="status-value blue">{`${plan_amount} / ${plan_interval}`}</span>
							</div>
							{ plan_ends ? (
								<div className="status-row">
									<span className="status-label">{`${t('subscription_status')}: `}</span>
									<span className="status-value red">{ subscriptionExpiration }</span>
									<div style={{ marginTop: '20px' }}>
										<span className="status-value blue resubscribe" onClick={_handleResubscribeClick}>{ t('subscription_resubscribe') }</span>
									</div>
								</div>
							) : (
								<div>
									<div className="status-row">
										<span className="status-label">{`${t('subscription_status')}: `}</span>
										<span className="status-value blue">{active ? t('subscription_active') : t('subscription_inactive') }</span>
									</div>
									<div className="status-row">
										<span className="status-label">{active ? `${t('subscription_charge_date')}: ` : `${t('subscription_expired')}: `}</span>
										<span className="status-value blue">{charge_date}</span>
									</div>
									<div className="list-row">
										<ul>
											<li className="list-item">{t('subscription_dark_blue_theme')}</li>
											<li className="list-item">{t('historical_stats')}</li>
											<li className="list-item">{t('priority_support')}</li>
										</ul>
									</div>
									<div className="manage-row">
										<div className="manage-icon" />
										<span className="manage-link" onClick={_handleManageClick}>{t('subscription_manage')}</span>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default SubscriptionInfo;
