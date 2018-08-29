/**
 * Tutorial View Container
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
 * ToDo: Add Proptypes
 */

import React from 'react';
import { withRouter } from 'react-router-dom';
import TutorialView from './TutorialView';

// Component Views
import TutorialVideoView from '../TutorialViews/TutorialVideoView';
import TutorialTrackerListView from '../TutorialViews/TutorialTrackerListView';
import TutorialLayoutView from '../TutorialViews/TutorialLayoutView';
import TutorialBlockingView from '../TutorialViews/TutorialBlockingView';
import TutorialTrustView from '../TutorialViews/TutorialTrustView';
import TutorialAntiSuiteView from '../TutorialViews/TutorialAntiSuiteView';

/**
 * @class Implement the Tutorial View Container for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class TutorialViewContainer extends React.Component {
	constructor(props) {
		super(props);
		const title = '';
		window.document.title = title;
		this.props.actions.initTutorialProps(this.props.tutorial);
		this.props.history.push('/tutorial/1');
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Tutorial View of the Hub app
	 */
	render() {
		const steps = [
			{
				index: 1,
				path: '/tutorial/1',
				bodyComponent: TutorialVideoView,
			},
			{
				index: 2,
				path: '/tutorial/2',
				bodyComponent: TutorialTrackerListView,
			},
			{
				index: 3,
				path: '/tutorial/3',
				bodyComponent: TutorialLayoutView,
			},
			{
				index: 4,
				path: '/tutorial/4',
				bodyComponent: TutorialBlockingView,
			},
			{
				index: 5,
				path: '/tutorial/5',
				bodyComponent: TutorialTrustView,
			},
			{
				index: 6,
				path: '/tutorial/6',
				bodyComponent: TutorialAntiSuiteView,
			},
		];

		return <TutorialView steps={steps} />;
	}
}

// Default props used throughout the Tutorial flow
TutorialViewContainer.defaultProps = {
	tutorial: {
		navigation: {
			activeIndex: 0,
			hrefPrev: false,
			hrefNext: false,
			hrefDone: false,
			textPrev: false,
			textNext: false,
			textDone: false,
		},
	},
};


export default withRouter(TutorialViewContainer);
