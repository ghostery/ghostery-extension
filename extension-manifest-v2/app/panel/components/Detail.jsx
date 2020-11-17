/**
 * Detail Component
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
import { Route } from 'react-router-dom';
import ClassNames from 'classnames';
import DetailMenu from './DetailMenu';
import Blocking from '../containers/BlockingContainer';
/**
 * @class Implement wrapper of the detailed (expert) mode view.
 * @memberOf PanelClasses
 */
class Detail extends React.Component {
	constructor(props) {
		super(props);

		// event bindings
		this.toggleExpanded = this.toggleExpanded.bind(this);

		// set default tab / route based on how we got to this view
		props.history.push('/detail/blocking');
	}

	BlockingComponent = () => (<Blocking />);

	/**
	 * Click "expertTab" to enable detailed (expert) mode. Trigger action.
	 */
	toggleExpanded() {
		const { actions } = this.props;
		actions.toggleExpanded();
	}

	/**
	 * Render detailed view wrapper. Part of it is footer
	 * menu allowing to switch between blocking view and one of the
	 * not-yet-implemented-and-pretty-empty-right-now views.
	 *
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const { is_expanded, user } = this.props;
		const condensedToggleClassNames = ClassNames('condensed-toggle', {
			condensed: is_expanded,
		});

		const activeTab = 'blocking';
		const contentDetailsClassNames = ClassNames({
			expanded: is_expanded,
		});

		return (
			<div className="detail-wrap">
				<div id="content-detail" className={contentDetailsClassNames}>
					<div className="toggle-bar">
						<div className={condensedToggleClassNames} onClick={this.toggleExpanded} />
					</div>
					<Route path="/detail/blocking" render={this.BlockingComponent} />
					<DetailMenu
						plusAccess={user && user.plusAccess}
						activeTab={activeTab}
					/>
				</div>
			</div>
		);
	}
}

export default Detail;
