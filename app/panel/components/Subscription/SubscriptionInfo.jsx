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
import { openSupporterPage } from '../../utils/msg';

/**
 * @class Implement Subscription Info in subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It invites user to examine the status of his subscription
 * @memberOf SubscriptionComponents
 */
const SubscriptionInfo = (props) => {
	const {
		active, plan_amount, plan_interval, charge_date, plan_ends, loading
	} = props.subscriptionData;
	return (
		<div className="content-subscription s-tabs-panel">
			<div className="row">
				<div className="columns column-subscription">
					<h1>{ t('subscription_info_title') }</h1>
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
									<span className="status-value red">{ t('subscription_days_left', plan_ends.toString()) }</span>
									<div style={{ marginTop: '20px' }}>
										<span className="status-value blue resubscribe" onClick={openSupporterPage}>{ t('subscription_resubscribe') }</span>
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
											<li className="list-item">{t('subscription_midnight_theme')}</li>
											<li className="list-item">{t('subscription_priority_support')}</li>
											{/* <li className="list-item">{t('subscription_tracker_stats')}</li> */}
										</ul>
									</div>
									<div className="manage-row">
										<div className="manage-icon" />
										<span className="manage-link" onClick={openSupporterPage}>{t('subscription_manage')}</span>
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
