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
import Currencies from '../../countries.json';


// import TrackerStats from './Subscription/TrackerStats';
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

	_isEmpty = (obj) => {
		if (!obj) {
			return true;
		}
		return (Object.keys(obj).length === 0 && obj.constructor === Object);
	}
	parseSubscriptionData = () => {
		if (this.props.hasOwnProperty('subscriptionData')) {
			const sd = this.props.subscriptionData;
			if (!this._isEmpty(sd)) {
				const {
					planAmount, planInterval, planCurrency, currentPeriodEnd, cancelAtPeriodEnd, status
				} = sd;
				const plan_ends = cancelAtPeriodEnd ? moment.duration(moment.unix(currentPeriodEnd).diff(moment(new Date()))).days() : '';
				let currency;
				for (let i = 0; i < Currencies.length; i++) {
					if (Currencies[i].currencyCode === planCurrency) {
						currency = Currencies[i]; break;
					}
				}

				if (currency) {
					const {
						languageCode, currencyDecimals, currencySymbol, currencySymbolAfter
					} = currency;
					const planCost = (planAmount / 10 ** currencyDecimals)
						.toLocaleString(languageCode, { minimumFractionDigits: currencyDecimals, maximumFractionDigits: currencyDecimals });
					const plan_amount = currencySymbolAfter ? `${planCost} ${currencySymbol}` : `${currencySymbol} ${planCost}`;
					return {
						plan_amount,
						plan_interval: planInterval,
						active: (status === 'active'),
						charge_date: moment.unix(currentPeriodEnd).format('MMMM Do, YYYY'),
						plan_ends,
						loading: false,
					};
				}
			}
			return {
				data_error: true,
				loading: false
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
	// TrackerStatsComponent = () => (<TrackerStats />);

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
