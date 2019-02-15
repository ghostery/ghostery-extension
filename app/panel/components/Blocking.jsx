/**
 * Blocking Component
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
import Categories from './Blocking/Categories';
import BlockingHeader from './Blocking/BlockingHeader';
import NotScanned from './BuildingBlocks/NotScanned';
import { updateSummaryBlockingCount } from '../utils/blocking';
/**
 * @class Implement Blocking View in the right
 * pane of the detailed (expert) panel.
 * @memberof PanelClasses
 */
class Blocking extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			blockingClasses: '',
			disableBlocking: false,
		};
	}
	/**
	 * Lifecycle event
	 */
	componentWillMount() {
		this.updateBlockingClasses(this.props);
		this.updateSiteNotScanned(this.props);
	}
	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.uiPort = chrome.runtime.connect({ name: 'blockingUIPort' });
		this.uiPort.onMessage.addListener((msg) => {
			this.props.actions.updateBlockingData(msg);
		});
		// We only need to fetch blocking data directly on instances where the user swtiches between
		// simple and expert view. Otherwise, it's fetched via Panel. Here, we check for properties that
		// are returned by PanelData::blockingView()
		// if (this.props.categories.length === 0 && typeof this.props.toggle_individual_trackers === 'undefined') {
		//	this.props.actions.getBlockingData();
		// }
	}
	/**
	 * Lifecycle event
	 */
	componentWillReceiveProps(nextProps) {
		// triggered by update to the redux store
		this.updateBlockingClasses(nextProps);
		this.updateSiteNotScanned(nextProps);
	}
	/**
	 * Lifecycle event
	 */
	componentDidUpdate(prevProps) {
		// methods here will run after categories is assigned
		if (prevProps.filter.type !== this.props.filter.type
			|| prevProps.filter.name !== this.props.filter.name) {
			this.filterTrackers();
		}

		// Update the summary blocking count whenever the blocking component updated.
		// This will also show pending blocking changes if the panel is re-opened
		// before a page refresh
		const smartBlock = this.props.smartBlockActive && this.props.smartBlock || { blocked: {}, unblocked: {} };
		updateSummaryBlockingCount(this.props.categories, smartBlock, this.props.actions.updateTrackerCounts);
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this.uiPort.disconnect();
	}

	/**
	* Filter trackers by category, or reset filters. Trigger action.
	* @param  {string} filterName
	*/
	setShow(filterName) {
		const updated_categories = JSON.parse(JSON.stringify(this.props.categories)); // deep clone

		updated_categories.forEach((category) => {
			let count = 0;
			let show = true;

			// filter by donut wheel categories
			if (filterName !== 'all' && filterName !== category.id) {
				show = false;
			}

			category.trackers.forEach((tracker) => {
				tracker.shouldShow = show;
				count++;
			});

			category.num_shown = (show) ? count : 0;
		});

		this.props.actions.updateCategories(updated_categories);
	}
	/**
	* Filter trackers in categories to show only
	* those that are blocked. Trigger action.
	*/
	setBlockedShow() {
		const updated_categories = JSON.parse(JSON.stringify(this.props.categories)); // deep clone

		updated_categories.forEach((category) => {
			let count = 0;
			category.trackers.forEach((tracker) => {
				const isSbBlocked = this.props.smartBlockActive && tracker.warningSmartBlock;
				if ((tracker.blocked && !tracker.ss_allowed) || isSbBlocked || tracker.ss_blocked) {
					tracker.shouldShow = true;
					count++;
				} else {
					tracker.shouldShow = false;
				}
			});
			category.num_shown = count;
		});

		this.props.actions.updateCategories(updated_categories);
	}
	/**
	* Filter trackers in categories to show only
	* those that have warnings. Trigger action.
	*/
	setWarningShow() {
		const updated_categories = JSON.parse(JSON.stringify(this.props.categories)); // deep clone

		updated_categories.forEach((category) => {
			let count = 0;
			category.trackers.forEach((tracker) => {
				if (tracker.warningCompatibility || tracker.warningInsecure || tracker.warningSlow) {
					tracker.shouldShow = true;
					count++;
				} else {
					tracker.shouldShow = false;
				}
			});

			category.num_shown = count;
		});

		this.props.actions.updateCategories(updated_categories);
	}
	/**
	* Filter trackers in categories to show only those
	* that have compatibility warnings. Trigger action.
	*/
	setWarningCompatibilityShow() {
		const updated_categories = JSON.parse(JSON.stringify(this.props.categories)); // deep clone

		updated_categories.forEach((category) => {
			let count = 0;
			category.trackers.forEach((tracker) => {
				if (tracker.warningCompatibility) {
					tracker.shouldShow = true;
					count++;
				} else {
					tracker.shouldShow = false;
				}
			});

			category.num_shown = count;
		});

		this.props.actions.updateCategories(updated_categories);
	}
	/**
	 * Filter trackers in categories to show only those that
	 * have slow/insecure warnings. Trigger action.
	 */
	setWarningSlowInsecureShow() {
		const updated_categories = JSON.parse(JSON.stringify(this.props.categories)); // deep clone

		updated_categories.forEach((category) => {
			let count = 0;
			category.trackers.forEach((tracker) => {
				if (tracker.warningInsecure || tracker.warningSlow) {
					tracker.shouldShow = true;
					count++;
				} else {
					tracker.shouldShow = false;
				}
			});

			category.num_shown = count;
		});

		this.props.actions.updateCategories(updated_categories);
	}
	/**
	* Set dynamic classes on .blocking-trackers. Set state.
	* @param  {Object} props
	*/
	updateBlockingClasses(props) {
		const classes = [];

		classes.push((props.toggle_individual_trackers) ? 'show-individual' : '');
		classes.push((props.paused_blocking) ? 'paused' : '');
		classes.push((props.sitePolicy) ? (props.sitePolicy === 2) ? 'trusted' : 'restricted' : '');

		this.setState({ blockingClasses: classes.join(' ') });
	}
	/**
	* Disable controls for a site that cannot be scanned by Ghostery. Set state.
	* @param {Object}	props	nextProps
	*/
	updateSiteNotScanned(props) {
		const { siteNotScanned, categories } = props;
		const pageUrl = props.pageUrl || '';

		if (siteNotScanned || !categories || pageUrl.search('http') === -1) {
			this.setState({ disableBlocking: true });
		} else {
			this.setState({ disableBlocking: false });
		}
	}
	/**
	* Filter tracker list based on filter data received from props.
	*/
	filterTrackers() {
		const { filter } = this.props;

		if (!filter || Object.keys(filter).length === 0) {
			return;
		}

		if (filter.type === 'trackers' && filter.name === 'all') {
			this.setShow(filter.name);
		} else if (filter.type === 'trackers' && filter.name === 'blocked') {
			this.setBlockedShow();
		} else if (filter.type === 'trackers' && filter.name === 'warning') {
			this.setWarningShow();
		} else if (filter.type === 'trackers' && filter.name === 'warning-compatibility') {
			this.setWarningCompatibilityShow();
		} else if (filter.type === 'trackers' && filter.name === 'warning-slow-insecure') {
			this.setWarningSlowInsecureShow();
		} else if (filter.type === 'category') {
			this.setShow(filter.name);
		}
	}
	/**
	* Render blocking panel.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { categories } = this.props;
		return (
			<div id="content-blocking">
				<BlockingHeader
					categories={categories}
					expandAll={this.props.expand_all_trackers}
					actions={this.props.actions}
					sitePolicy={this.props.sitePolicy}
					paused_blocking={this.props.paused_blocking}
					selected_app_ids={this.props.selected_app_ids}
					smartBlockActive={this.props.smartBlockActive}
					smartBlock={this.props.smartBlock}
				/>
				{(this.state.disableBlocking && this.props.is_expanded) ?
					<NotScanned />
					:
					<div className={`${this.state.blockingClasses} blocking-trackers show-warnings`}>
						{ categories.length > 0 &&
							<Categories
								categories={categories}
								actions={this.props.actions}
								show_tracker_urls={this.props.show_tracker_urls}
								sitePolicy={this.props.sitePolicy}
								paused_blocking={this.props.paused_blocking}
								language={this.props.language}
								smartBlockActive={this.props.smartBlockActive}
								smartBlock={this.props.smartBlock}
							/>
						}
					</div>
				}
			</div>
		);
	}
}

export default Blocking;
