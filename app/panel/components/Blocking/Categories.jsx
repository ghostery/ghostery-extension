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

		const otherDataPointsCategory = (antiTracking && antiTracking.totalUnsafeCount) ? (
			<Category
				expandAll={expandAll}
				globalBlocking={globalBlocking}
				index={categoryList.length}
				category={(() => {
					const antiTrackingUrls = Object.keys(antiTracking.unknown).filter(urlKey => (
						(antiTracking.unknown[urlKey] === 'safe' && antiTracking.whitelistedUrls[urlKey])
						|| antiTracking.unknown[urlKey] === 'unsafe'
					));
					return {
						id: 'other_data_points',
						name: 'Other Data Points',
						description: 'Anonymized data points by Anti-Tracking',
						img_name: 'other_data_points',
						num_total: antiTrackingUrls.length,
						num_blocked: antiTracking.totalUnsafeCount,
						num_shown: antiTrackingUrls.length,
						trackers: antiTrackingUrls.map((url, idx) => ({
							blocked: antiTracking.unknown[url] === 'unsafe',
							catId: 'other_data_points',
							description: '',
							id: 100000000 + idx,
							name: url,
							shouldShow: true,
						})),
					};
				})()}
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
