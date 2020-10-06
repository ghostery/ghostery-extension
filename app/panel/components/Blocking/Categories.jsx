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
			actions,
			categories,
			expandAll,
			unknownCategory,
			enable_anti_tracking,
			sitePolicy,
			globalBlocking,
			filtered,
			showToast,
			show_tracker_urls,
			paused_blocking,
			language,
			smartBlockActive,
			smartBlock,
		} = this.props;
		const globalBlockingBool = !!globalBlocking;
		const filteredBool = !!filtered;

		const renderCategory = (category, index, isUnknown) => {
			let whitelistedTotal = 0;
			const unknownCategoryMapping = isUnknown ? (
				{
					id: 'unknown',
					name: t('unidentified'),
					description: t('unidentified_description'),
					img_name: 'unknown',
					num_total: unknownCategory.unidentifiedTrackers.length,
					num_blocked: unknownCategory.unidentifiedTrackerCount,
					num_shown: unknownCategory.hide ? 0 : unknownCategory.unidentifiedTrackers.length,
					trackers: unknownCategory.unidentifiedTrackers.map((unidentifiedTracker) => {
						if (unidentifiedTracker.whitelisted) { whitelistedTotal++; }
						return {
							name: unidentifiedTracker.name,
							domains: unidentifiedTracker.domains,
							whitelisted: unidentifiedTracker.whitelisted,
							type: unidentifiedTracker.type,
							siteRestricted: sitePolicy === 1,
							blocked: false,
							catId: 'unknown',
							description: '',
							id: unidentifiedTracker.name + unidentifiedTracker.domains[0],
							shouldShow: true,
							cliqzAdCount: unidentifiedTracker.ads,
							cliqzCookieCount: unidentifiedTracker.cookies,
							cliqzFingerprintCount: unidentifiedTracker.fingerprints,
						};
					}),
					whitelistedTotal,
				}
			) : null;

			return (
				<Category
					expandAll={expandAll}
					globalBlocking={globalBlockingBool}
					index={index}
					category={isUnknown ? unknownCategoryMapping : category}
					actions={actions}
					key={isUnknown ? unknownCategoryMapping.id : category.id}
					filtered={filteredBool}
					showToast={showToast}
					show_tracker_urls={show_tracker_urls}
					sitePolicy={sitePolicy}
					paused_blocking={paused_blocking}
					language={language}
					smartBlockActive={smartBlockActive}
					smartBlock={smartBlock}
					enable_anti_tracking={enable_anti_tracking}
					isUnknown={isUnknown}
				/>
			);
		};

		const categoryList = categories.map((category, index) => renderCategory(category, index));
		const renderUnknownCategory = unknownCategory && unknownCategory.unidentifiedTrackers.length
			? renderCategory(null, categoryList.length, true) : null;

		return (
			<div className="scroll-content">
				{categoryList}
				{renderUnknownCategory}
			</div>
		);
	}
}

Categories.defaultProps = {
	categories: [],
};

export default Categories;
