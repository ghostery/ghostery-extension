//Priority Support
/**
 * Priority Support Subscription Component
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
 * @class Implement Priority Support subview as a React component.
 * The view opens from the left-side menu of the main Subscription view.
 * It allows user to access Priority Support
 * @memberOf SubscriptionComponents
 */
const PrioritySupport = (props) => {
	const { subscriptionData } = props;
	return (
		<div className="content-subscription s-tabs-panel">
			<div className="row">
				<div className="columns column-subscription">
				<h1>{ t('subscription_priority_support_title') }</h1>
				</div>
			</div>
		</div>
	);
};

export default PrioritySupport;
