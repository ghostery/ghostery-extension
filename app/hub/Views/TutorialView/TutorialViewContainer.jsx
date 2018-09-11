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
 */

import React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import TutorialView from './TutorialView';

// Component Views
import TutorialVideoView from '../TutorialViews/TutorialVideoView';
import TutorialTrackerListView from '../TutorialViews/TutorialTrackerListView';
import TutorialBlockingView from '../TutorialViews/TutorialBlockingView';
import TutorialLayoutView from '../TutorialViews/TutorialLayoutView';
import TutorialTrustView from '../TutorialViews/TutorialTrustView';
import TutorialAntiSuiteView from '../TutorialViews/TutorialAntiSuiteView';

/**
 * @class Implement the Tutorial View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class TutorialViewContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			sendMountActions: false,
		};

		if (!props.preventRedirect) {
			this.props.history.push('/tutorial/1');
		}

		const title = t('hub_tutorial_page_title');
		window.document.title = title;

		this.props.actions.initTutorialProps(this.props.tutorial).then(() => {
			this.setState({ sendMountActions: true });
		});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Tutorial View of the Hub app
	 */
	render() {
		const { sendMountActions } = this.state;
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
				bodyComponent: TutorialBlockingView,
			},
			{
				index: 4,
				path: '/tutorial/4',
				bodyComponent: TutorialLayoutView,
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

		return <TutorialView steps={steps} sendMountActions={sendMountActions} />;
	}
}

// PropTypes ensure we pass required props of the correct type
// Note: isRequired is not needed when a prop has a default value
TutorialViewContainer.propTypes = {
	preventRedirect: PropTypes.bool,
	tutorial: PropTypes.shape({
		navigation: PropTypes.shape({
			activeIndex: PropTypes.number,
			hrefPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			hrefNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			hrefDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
		}),
	}),
	actions: PropTypes.shape({
		initTutorialProps: PropTypes.func.isRequired,
		setTutorialNavigation: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used throughout the Tutorial flow
TutorialViewContainer.defaultProps = {
	preventRedirect: false,
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
