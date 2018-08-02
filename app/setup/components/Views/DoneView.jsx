/**
 * Done View Component
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

/**
 * @class Implement the #done step of the setup flow.
 * @extends Component
 * @memberof SetupViews
 */
class DoneView extends Component {
	/**
	* Lifecycle event
	*/
	componentWillMount() {
		this.props.actions.updateTopContentData({
			image: '/app/images/setup/circles/check-wrench.svg',
			title: t('setup_done_view_title'),
		});
		this.props.actions.updateNavigationNextButtons([
			{
				title: t('setup_button_exit'),
				action: 'close',
			},
		]);
	}

	/**
	* Lifecycle event
	*/
	componentDidMount() {
		this.props.actions.setupStep({ key: 'setup_step', value: 6 });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #done step of the setup flow
	 */
	render() {
		return (
			<div id="done-view" className="row align-center">
				<div className="column medium-8 blue-border">
					<div className="browser-bar">
						<img className="arrow" src="/app/images/setup/arrow-up-large.svg" />
					</div>
					<h3>{ t('setup_done_view_desc') }</h3>
				</div>
			</div>
		);
	}
}

export default DoneView;
