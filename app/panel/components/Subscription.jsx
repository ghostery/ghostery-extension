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


// import TrackerStats from './Subscription/TrackerStats';
/**
 * @class Implement base Subscription view which routes navigation to all subscription subviews
 * @memberof PanelClasses
 */
class Subscription extends React.Component {
	constructor(props) {
		super(props);
		/* eslint-disable object-curly-newline */
		this.countries = [
			{ name: 'Australia', code: 'AU', languageCode: 'en-AU', currencySymbol: 'A$', currencyCode: 'aud', currencyDecimals: 2 },
			{ name: 'Austria', code: 'AT', languageCode: 'de-AT', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2 },
			{ name: 'Belgium', code: 'BE', languageCode: 'fr-BE', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Brazil', code: 'BR', languageCode: 'pt-BR', currencySymbol: 'R$', currencyCode: 'brl', currencyDecimals: 2 },
			{ name: 'Bulgaria', code: 'BG', languageCode: 'bg', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Canada', code: 'CA', languageCode: 'en-CA', currencySymbol: 'C$', currencyCode: 'cad', currencyDecimals: 2 },
			{ name: 'China', code: 'CN', languageCode: 'zh-CN', currencySymbol: '¥', currencyCode: 'cny', currencyDecimals: 2 },
			{ name: 'Croatia', code: 'HR', languageCode: 'hr', currencySymbol: 'kn', currencyCode: 'hrk', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Cyprus', code: 'CY', languageCode: 'el', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2 },
			{ name: 'Czechia', code: 'CZ', languageCode: 'cs', currencySymbol: 'Kč', currencyCode: 'czk', currencyDecimals: 2 },
			{ name: 'Denmark', code: 'DK', languageCode: 'da', currencySymbol: 'kr', currencyCode: 'dkk', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Estonia', code: 'EE', languageCode: 'et', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Finland', code: 'FI', languageCode: 'fi', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'France', code: 'FR', languageCode: 'fr', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Germany', code: 'DE', languageCode: 'de', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Greece', code: 'GR', languageCode: 'el', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Hungary', code: 'HU', languageCode: 'hu', currencySymbol: 'Ft', currencyCode: 'huf', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Ireland', code: 'IE', languageCode: 'en-IE', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2 },
			{ name: 'Italy', code: 'IT', languageCode: 'it', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Japan', code: 'JP', languageCode: 'ja', currencySymbol: '¥', currencyCode: 'jpy', currencyDecimals: 0 },
			{ name: 'Latvia', code: 'LV', languageCode: 'lv', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Lithuania', code: 'LT', languageCode: 'lt', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Luxembourg', code: 'LU', languageCode: 'de-lu', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Malta', code: 'MT', languageCode: 'mt', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2 },
			{ name: 'Netherlands', code: 'NL', languageCode: 'nl', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2 },
			{ name: 'Poland', code: 'PL', languageCode: 'pl', currencySymbol: 'zł', currencyCode: 'pln', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Portugal', code: 'PT', languageCode: 'pt', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Romania', code: 'RO', languageCode: 'ro', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Slovakia', code: 'SK', languageCode: 'sk', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Slovenia', code: 'SI', languageCode: 'sl', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Spain', code: 'ES', languageCode: 'es', currencySymbol: '€', currencyCode: 'eur', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Sweden', code: 'SE', languageCode: 'sv', currencySymbol: 'kr', currencyCode: 'sek', currencyDecimals: 2, currencySymbolAfter: true },
			{ name: 'Ukraine', code: 'UA', languageCode: 'uk', currencySymbol: '₴', currencyCode: 'uah', currencyDecimals: 2 },
			{ name: 'United Kingdom of Great Britain and Northern Ireland', code: 'GB', languageCode: 'en-GB', currencySymbol: '£', currencyCode: 'gbp', currencyDecimals: 2 },
			{ name: 'United States of America', code: 'US', languageCode: 'en-US', currencySymbol: '$', currencyCode: 'usd', currencyDecimals: 2 },
		];
		/* eslint-enable object-curly-newline */

		this.state = {
			isChecked: (props.current_theme !== 'default'),
		};
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
				planAmount, planInterval, currentPeriodEnd, cancelAtPeriodEnd, status, country,
			} = sd;
			const plan_ends = cancelAtPeriodEnd ? moment.duration(moment.unix(currentPeriodEnd).diff(moment(new Date()))).days() : '';
			let countryCurrency;
			for (let i = 0; i < this.countries.length; i++) {
				if (this.countries[i].code === country) {
					countryCurrency = this.countries[i]; break;
				}
			}
			const planCost = (planAmount / 100).toFixed(2);
			let plan_amount;
			if (countryCurrency.currencySymbolAfter) {
				plan_amount = `${planCost} ${countryCurrency.currencySymbol}`;
			} else {
				plan_amount = `${countryCurrency.currencySymbol} ${planCost}`;
			}
			return {
				plan_amount,
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
