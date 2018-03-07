/**
 * Detail Component
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
import { Route } from 'react-router-dom';
import DetailMenu from './DetailMenu';
import Summary from '../containers/SummaryContainer';
import Blocking from '../containers/BlockingContainer';
import History from './History';
import Performance from './Performance';
import Rewards from './Rewards';
import Premium from './Premium';
/**
 * @class Implement wrapper of the detailed (expert) mode view.
 * @memberOf PanelClasses
 */
class Detail extends React.Component {
	constructor(props) {
		super(props);

		// event bindings
		this.toggleExpanded = this.toggleExpanded.bind(this);
	}
	/**
	 * Lifecycle event
	 */
	componentWillMount() {
		// trigger default tab (aka route)
		this.props.history.push('/detail/blocking');
	}

	BlockingComponent = () => (<Blocking />);
	HistoryComponent = () => (<History />);
	PerformanceComponent = () => (<Performance />);
	RewardsComponent = () => (<Rewards />);
	PremiumComponent = () => (<Premium />);

	/**
	 * Click "expertTab" to enable detailed (expert) mode. Trigger action.
	 */
	toggleExpanded() {
		this.props.actions.toggleExpanded();
	}
	/**
	 * Render detailed view wrapper. Part of it is footer
	 * menu allowing to switch between blocking view and one of the
	 * not-yet-implemented-and-pretty-empty-right-now views.
	 *
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div className="detail-wrap">
				<div id="content-detail" className={(this.props.is_expanded ? 'expanded' : '')}>
					<div className={`expertTab row align-middle align-right ${this.props.is_expanded ? 'expanded' : ''}`} onClick={this.toggleExpanded}>
						<div className="dash" />
						<div className="moon" />
					</div>
					<Route path="/detail/blocking" render={this.BlockingComponent} />
					<Route path="/detail/history" render={this.HistoryComponent} />
					<Route path="/detail/performance" render={this.PerformanceComponent} />
					<Route path="/detail/rewards" render={this.RewardsComponent} />
					<Route path="/detail/premium" render={this.PremiumComponent} />
					<DetailMenu />
				</div>
			</div>
		);
	}
}

export default Detail;
