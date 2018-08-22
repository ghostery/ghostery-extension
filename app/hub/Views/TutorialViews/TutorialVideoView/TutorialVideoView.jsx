/**
 * Tutorial Video View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo: Update this file.
 */

import React, { Component } from 'react';

/**
 * @class Implement the Tutorial Video View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class TutorialVideoView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			title: ''
		};
	}

	/**
	 * Lifecycle Event
	 */
	componentWillMount() {
		const { title } = this.state;
		window.document.title = title;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Tutorial Video View of the Hub app
	 */
	render() {
		const { title } = this.state;
		return <div>{title}</div>;
	}
}

export default TutorialVideoView;
