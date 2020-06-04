/**
 * Trackers Component
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
import Tracker from './Tracker';
import GlobalTracker from './GlobalTracker';

/**
 * @class Implement Trackers component which represents a container for trackers
 * in both Blocking view and Global Blocking subview of Settings.
 * @memberOf BlockingComponents
 */
class Trackers extends React.Component {
	/**
	 * React hook used to optimise re-rendering of the list of trackers.
	 * @param  {Object} nextProps	changed props
	 * @param  {Object} nextState   changed state
	 * @return {boolean}            true means proceed with rendering
	 */
	shouldComponentUpdate(nextProps) {
		const { trackers } = nextProps;
		if (!trackers || trackers.length === 0) {
			return false;
		}
		return true;
	}

	/**
	* Render the list of Tracker components in Blocking view or GlobalTracker components in Global Blocking view.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const {
			actions,
			trackers,
			isUnknown,
			globalBlocking,
			showToast,
			language,
			cat_id,
			show_tracker_urls,
			sitePolicy,
			paused_blocking,
			smartBlockActive,
			smartBlock,
		} = this.props;
		let trackerList;
		if (globalBlocking) {
			const trackersToShow = [];
			trackers.forEach((tracker) => {
				if (tracker.shouldShow) {
					trackersToShow.push(tracker);
				}
			});
			trackerList = trackersToShow.map((tracker, index) => (
				<GlobalTracker
					index={index}
					count={trackers.length}
					tracker={tracker}
					key={tracker.id}
					cat_id={cat_id}
					actions={actions}
					showToast={showToast}
					language={language}
				/>
			));
		} else {
			trackerList = trackers.map(tracker => (
				<Tracker
					tracker={tracker}
					key={tracker.id}
					cat_id={cat_id}
					actions={actions}
					show_tracker_urls={show_tracker_urls}
					sitePolicy={sitePolicy}
					paused_blocking={paused_blocking}
					language={language}
					smartBlockActive={smartBlockActive}
					smartBlock={smartBlock}
					isUnknown={isUnknown}
				/>
			));
		}
		return <div className="trackers-list">{ trackerList }</div>;
	}
}

Trackers.defaultProps = {
	trackers: [],
};

export default Trackers;
