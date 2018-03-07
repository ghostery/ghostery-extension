/**
 * Additional Features View Component
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
import { Link } from 'react-router-dom';
import { msg } from '../utils';

/**
 * @class The Top Content for the Setup flow.  This is where the content is displayed
 * that is not the header, footer, alert callout, or nagivation.
 * @extends Component
 * @memberof SetupViews
 */
class TopContent extends Component {
	constructor(props) {
		super(props);
		this.onUnload = this.onUnload.bind(this);
	}

	/**
	* Lifecycle event
	*/
	componentDidMount() {
		window.addEventListener('beforeunload', this.onUnload);
	}

	/**
	* Lifecycle event
	*/
	componentWillUnmount() {
		window.removeEventListener('beforeunload', this.onUnload);
	}

	/**
	* Lifecycle event
	*/
	onUnload() {
		msg.sendMessage('setupStep', { final: true });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Top Content
	 */
	render() {
		return (
			<div className="row align-center">
				<div className="columns">
					<div className="row align-middle align-center">
						<div className="columns shrink">
							<img src={this.props.image} />
						</div>
						<div className="columns shrink">
							<h3 dangerouslySetInnerHTML={{ __html: this.props.title }} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default TopContent;
