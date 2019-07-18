/**
 * Categories Component
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
import Category from './Category';

/**
 * @class Implement Categories component, which represents a
 * container of available categories. This component is shared
 * by Blocking view and Global Blocking subview in Settings.
 * @memberOf BlockingComponents
 */
class Categories extends React.Component {
	componentDidMount() {}

	/**
	* Render a list of categories. Pass globalBlocking flag to all categories
	* in the list, so that they would know which view they are part of.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const {
			categories,
			expandAll,
			antiTracking,
			enable_anti_tracking,
		} = this.props;
		const globalBlocking = !!this.props.globalBlocking;
		const filtered = !!this.props.filtered;

		const categoryList = categories.map((cat, index) => (
			<Category
				expandAll={expandAll}
				globalBlocking={globalBlocking}
				index={index}
				category={cat}
				actions={this.props.actions}
				key={cat.id}
				filtered={filtered}
				showToast={this.props.showToast}
				show_tracker_urls={this.props.show_tracker_urls}
				sitePolicy={this.props.sitePolicy}
				paused_blocking={this.props.paused_blocking}
				language={this.props.language}
				smartBlockActive={this.props.smartBlockActive}
				smartBlock={this.props.smartBlock}
			/>
		));

		const otherDataPointsCategory = antiTracking.unknownTrackers.length ? (
			<Category
				expandAll={expandAll}
				globalBlocking={globalBlocking}
				index={categoryList.length}
				category={(() => ({
					id: 'unknown',
					name: 'Unknown',
					description: 'Unknown trackers blocked by Anti-Tracking',
					img_name: 'unknown',
					num_total: antiTracking.unknownTrackers.length,
					num_blocked: antiTracking.unknownTrackerCount,
					num_shown: antiTracking.hide ? 0 : antiTracking.unknownTrackers.length,
					trackers: antiTracking.unknownTrackers.map((otherDataPoint, idx) => ({
						name: otherDataPoint.name,
						domains: otherDataPoint.domains,
						whitelisted: otherDataPoint.whitelisted,
						blocked: !otherDataPoint.whitelisted,
						catId: 'other_data_points',
						description: '',
						id: 100000000 + idx,
						shouldShow: true,
						cliqzAdCount: otherDataPoint.ads,
						cliqzCookieCount: otherDataPoint.cookies,
						cliqzFingerprintCount: otherDataPoint.fingerprints,
					})),
				}))()}
				actions={this.props.actions}
				key="other_data_points"
				filtered={filtered}
				showToast={this.props.showToast}
				show_tracker_urls={this.props.show_tracker_urls}
				sitePolicy={this.props.sitePolicy}
				paused_blocking={this.props.paused_blocking}
				language={this.props.language}
				smartBlockActive={this.props.smartBlockActive}
				smartBlock={this.props.smartBlock}
				enable_anti_tracking={enable_anti_tracking}
			/>
		) : null;

		return (
			<div className="scroll-content">
				{categoryList}
				{otherDataPointsCategory}
			</div>
		);
	}
}

Categories.defaultProps = {
	categories: [],
};

export default Categories;
