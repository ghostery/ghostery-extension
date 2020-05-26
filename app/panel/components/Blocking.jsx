/**
 * Blocking Component
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
import Categories from './Blocking/Categories';
import BlockingHeader from './Blocking/BlockingHeader';
import NotScanned from './BuildingBlocks/NotScanned';
import DynamicUIPortContext from '../contexts/DynamicUIPortContext';
import { updateSummaryBlockingCount } from '../utils/blocking';

/**
 * @class Implement Blocking View in the right
 * pane of the detailed (expert) panel.
 * @memberof PanelClasses
 */
class Blocking extends React.Component {
	static contextType = DynamicUIPortContext;

	/**
	 *	Refactoring UNSAFE_componentWillMount into Constructor
	 *	Stats:
	 *		Constructor runtime before refactor: 0.038ms
	 *		Constructor + UNSAFE_componentWillMount runtime before refactor: 0.333ms
	 *		Constructor runtime after refactor: 0.129ms
	 *
	 *	Notes:
	 *		calling buildBlockingClasses and computeSiteNotScanned in the constructor takes 0.018ms.
	 *
	 *	Conclusion: Refactor using constructor as the added computation is minimal
	 */
	constructor(props) {
		super(props);

		// event bindings
		this.handlePortMessage = this.handlePortMessage.bind(this);

		const classes = Blocking.buildBlockingClasses(this.props);
		const disableBlocking = Blocking.computeSiteNotScanned(this.props);

		this.state = {
			blockingClasses: classes.join(' '),
			disableBlocking
		};
	}

	/**
	 * Lifecycle event
	 */
	static getDerivedStateFromProps(nextProps) {
		const blockingClasses = Blocking.buildBlockingClasses(nextProps).join(' ');
		const disableBlocking = Blocking.computeSiteNotScanned(nextProps);
		return { blockingClasses, disableBlocking };
	}

	/**
	* Build dynamic classes on .blocking-trackers. Return classes
	* @param  {Object} props
	*/
	static buildBlockingClasses(props) {
		const classes = [];

		classes.push((props.toggle_individual_trackers) ? 'show-individual' : '');
		classes.push((props.paused_blocking) ? 'paused' : '');
		classes.push((props.sitePolicy) ? (props.sitePolicy === 2) ? 'trusted' : 'restricted' : '');

		return classes;
	}

	/**
	* Compute whether a site cannot be scanned by Ghostery.
	* @param {Object}	props	nextProps
	*/
	static computeSiteNotScanned(props) {
		const { siteNotScanned, categories } = props;
		const pageUrl = props.pageUrl || '';

		if (siteNotScanned || !categories || pageUrl.search('http') === -1) {
			return true;
		}
		return false;
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this._dynamicUIPort = this.context;
		this._dynamicUIPort.onMessage.addListener(this.handlePortMessage);
		this._dynamicUIPort.postMessage({ name: 'BlockingComponentDidMount' });
	}

	/**
	 * Lifecycle event
	 */
	componentDidUpdate(prevProps) {
		const {
			actions, filter, categories, smartBlock, smartBlockActive
		} = this.props;
		// methods here will run after categories is assigned
		if (prevProps.filter.type !== filter.type
			|| prevProps.filter.name !== filter.name) {
			this.filterTrackers();
		}

		// Update the summary blocking count whenever the blocking component updated.
		// This will also show pending blocking changes if the panel is re-opened
		// before a page refresh
		const computedSmartBlock = (smartBlockActive && smartBlock) || { blocked: {}, unblocked: {} };
		updateSummaryBlockingCount(categories, computedSmartBlock, actions.updateTrackerCounts);
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		this._dynamicUIPort.postMessage({ name: 'BlockingComponentWillUnmount' });
		this._dynamicUIPort.onMessage.removeListener(this.handlePortMessage);
	}

	/**
	* Filter trackers by category, or reset filters. Trigger action.
	* @param  {string} filterName
	*/
	setShow(filterName) {
		const { actions, categories, unknownCategory } = this.props;
		const updated_categories = JSON.parse(JSON.stringify(categories)); // deep clone
		const updatedUnknownCategory = JSON.parse(JSON.stringify(unknownCategory)); // deep clone

		updated_categories.forEach((categoryEl) => {
			let count = 0;
			let show = true;

			// filter by donut wheel categories
			if (filterName !== 'all' && filterName !== categoryEl.id) {
				show = false;
			}

			categoryEl.trackers.forEach((trackerEl) => {
				trackerEl.shouldShow = show;
				count++;
			});

			categoryEl.num_shown = (show) ? count : 0;
		});

		updatedUnknownCategory.hide = !(filterName === 'all' || filterName === 'unknown');
		actions.updateCategories(updated_categories);
		actions.updateUnknownCategoryHide(updatedUnknownCategory);
	}

	/**
	* Filter trackers in categories to show only
	* those that are blocked. Trigger action.
	*/
	setBlockedShow() {
		const { actions, categories, smartBlockActive } = this.props;
		const updated_categories = JSON.parse(JSON.stringify(categories)); // deep clone

		updated_categories.forEach((categoryEl) => {
			let count = 0;
			categoryEl.trackers.forEach((trackerEl) => {
				const isSbBlocked = smartBlockActive && trackerEl.warningSmartBlock;
				if ((trackerEl.blocked && !trackerEl.ss_allowed) || isSbBlocked || trackerEl.ss_blocked) {
					trackerEl.shouldShow = true;
					count++;
				} else {
					trackerEl.shouldShow = false;
				}
			});
			categoryEl.num_shown = count;
		});

		actions.updateCategories(updated_categories);
	}

	/**
	* Filter trackers in categories to show only
	* those that have warnings. Trigger action.
	*/
	setWarningShow() {
		const { actions, categories } = this.props;
		const updated_categories = JSON.parse(JSON.stringify(categories)); // deep clone

		updated_categories.forEach((categoryEl) => {
			let count = 0;
			categoryEl.trackers.forEach((trackerEl) => {
				if (trackerEl.warningCompatibility || trackerEl.warningInsecure || trackerEl.warningSlow) {
					trackerEl.shouldShow = true;
					count++;
				} else {
					trackerEl.shouldShow = false;
				}
			});

			categoryEl.num_shown = count;
		});

		actions.updateCategories(updated_categories);
	}

	/**
	* Filter trackers in categories to show only those
	* that have compatibility warnings. Trigger action.
	*/
	setWarningCompatibilityShow() {
		const { actions, categories } = this.props;
		const updated_categories = JSON.parse(JSON.stringify(categories)); // deep clone

		updated_categories.forEach((categoryEl) => {
			let count = 0;
			categoryEl.trackers.forEach((trackerEl) => {
				if (trackerEl.warningCompatibility) {
					trackerEl.shouldShow = true;
					count++;
				} else {
					trackerEl.shouldShow = false;
				}
			});

			categoryEl.num_shown = count;
		});

		actions.updateCategories(updated_categories);
	}

	/**
	 * Filter trackers in categories to show only those that
	 * have slow/insecure warnings. Trigger action.
	 */
	setWarningSlowInsecureShow() {
		const { actions, categories } = this.props;
		const updated_categories = JSON.parse(JSON.stringify(categories)); // deep clone

		updated_categories.forEach((categoryEl) => {
			let count = 0;
			categoryEl.trackers.forEach((trackerEl) => {
				if (trackerEl.warningInsecure || trackerEl.warningSlow) {
					trackerEl.shouldShow = true;
					count++;
				} else {
					trackerEl.shouldShow = false;
				}
			});

			categoryEl.num_shown = count;
		});

		actions.updateCategories(updated_categories);
	}

	/**
	 * Handles messages from dynamic UI port to background
	 */
	handlePortMessage(msg) {
		const { actions } = this.props;
		if (msg.to !== 'blocking' || !msg.body) { return; }

		actions.updateBlockingData(msg.body);
	}

	/**
	* Set dynamic classes on .blocking-trackers. Set state.
	* @param  {Object} props
	*/
	updateBlockingClasses(props) {
		const { blockingClasses } = this.state;
		const classes = Blocking.buildBlockingClasses(props);
		const joinedBlockingClasses = classes.join(' ');

		if (blockingClasses !== joinedBlockingClasses) {
			this.setState({ blockingClasses: joinedBlockingClasses });
		}
	}

	/**
	* Disable controls for a site that cannot be scanned by Ghostery. Set state.
	* @param {Object}	props	nextProps
	*/
	updateSiteNotScanned(props) {
		const { disableBlocking } = this.state;
		const computeDisableBlocking = Blocking.computeSiteNotScanned(props);

		if (disableBlocking !== computeDisableBlocking) {
			this.setState({ disableBlocking: computeDisableBlocking });
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
		const {
			actions,
			categories,
			unknownCategory,
			enable_anti_tracking,
			expand_all_trackers,
			is_expanded,
			language,
			paused_blocking,
			selected_app_ids,
			show_tracker_urls,
			sitePolicy,
			smartBlock,
			smartBlockActive,
		} = this.props;

		const {
			blockingClasses,
			disableBlocking
		} = this.state;
		return (
			<div id="content-blocking">
				<BlockingHeader
					categories={categories}
					expandAll={expand_all_trackers}
					actions={actions}
					sitePolicy={sitePolicy}
					paused_blocking={paused_blocking}
					selected_app_ids={selected_app_ids}
					smartBlockActive={smartBlockActive}
					smartBlock={smartBlock}
				/>
				{(disableBlocking && is_expanded) ? (
					<NotScanned />
				) : (
					<div className={`${blockingClasses} blocking-trackers show-warnings`}>
						{(categories.length > 0 || unknownCategory.unknownTrackers.length > 0) && (
							<Categories
								expandAll={expand_all_trackers}
								categories={categories}
								actions={actions}
								show_tracker_urls={show_tracker_urls}
								sitePolicy={sitePolicy}
								paused_blocking={paused_blocking}
								language={language}
								smartBlockActive={smartBlockActive}
								smartBlock={smartBlock}
								unknownCategory={unknownCategory}
								enable_anti_tracking={enable_anti_tracking}
							/>
						)}
					</div>
				)}
			</div>
		);
	}
}

export default Blocking;
