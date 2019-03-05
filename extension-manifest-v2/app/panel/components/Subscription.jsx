/**
 * Subcription Component
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
import { Route } from 'react-router-dom';
import moment from 'moment';
import { sendMessage } from '../utils/msg';

import SubscriptionMenu from './Subscription/SubscriptionMenu';
import SubscriptionInfo from './Subscription/SubscriptionInfo';
import SubscriptionThemes from './Subscription/SubscriptionThemes';
import PrioritySupport from './Subscription/PrioritySupport';

/**
 * @class Implement base Subscription view which routes navigation to all subscription subviews
 * @memberof PanelClasses
 */
class Subscription extends React.Component {
	constructor(props) {
		super(props);
		this.state = { isChecked: (props.current_theme !== 'default') };
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.props.history.push('/subscription/info');
		this.props.actions.getUserSubscriptionData();
	}

	/**
	 * Lifecycle event.
	 */
	componentWillReceiveProps = (nextProps) => {
		if (!nextProps.loggedIn) {
			this.props.history.push('/detail');
		}
	}
	parseSubscriptionData = () => {
		const sd = this.props.subscriptionData;
		if (sd) {
			const {
				planAmount, planInterval, planCurrency, currentPeriodEnd, cancelAtPeriodEnd, status
			} = sd;
			const plan_ends = cancelAtPeriodEnd ? moment.duration(moment.unix(currentPeriodEnd).diff(moment(new Date()))).days() : '';
			let planAmountAdjusted = planAmount;
			if (planCurrency !== 'jpy') {
				planAmountAdjusted = planAmount / 100;
			}
			const amountWithCurrency = planAmountAdjusted.toLocaleString(undefined, {
				style: 'currency',
				currency: planCurrency
			});
			return {
				plan_amount: amountWithCurrency,
				plan_interval: planInterval,
				active: (status === 'active'),
				charge_date: moment.unix(currentPeriodEnd).format('MMMM Do, YYYY'),
				plan_ends,
				loading: false,
			};
		}
		return { loading: true };
	}

	toggleThemes = () => {
		const newChecked = !this.state.isChecked;
		this.setState({ isChecked: newChecked });
		const updated_theme = newChecked ? 'midnight-theme' : 'default';
		this.props.actions.getTheme(updated_theme).then(() => {
			sendMessage('ping', 'theme_change');
		});
	}

	SubscriptionInfoComponent = () => (<SubscriptionInfo subscriptionData={this.parseSubscriptionData()} />);
	SubscriptionThemesComponent = () => (<SubscriptionThemes isChecked={this.state.isChecked} toggleThemes={this.toggleThemes} />);
	PrioritySupportComponent = () => (<PrioritySupport />);

	/**
	 * Render top level component of the Subscription view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div>
				<div id="content-settings">
					<SubscriptionMenu />
					<Route path="/subscription/info" render={this.SubscriptionInfoComponent} />
					<Route path="/subscription/themes" render={this.SubscriptionThemesComponent} />
					<Route path="/subscription/prioritysupport" render={this.PrioritySupportComponent} />
				</div>
			</div>
		);
	}
}

export default Subscription;
