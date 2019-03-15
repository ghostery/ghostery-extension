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
import { DynamicUIPortContext } from '../contexts/DynamicUIPortContext';
import { updateSummaryBlockingCount } from '../utils/blocking';

/**
 * @class Implement Blocking View in the right
 * pane of the detailed (expert) panel.
 * @memberof PanelClasses
 */
class Blocking extends React.Component {
	static contextType = DynamicUIPortContext;

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
		this._dynamicUIPort = this.context;
		this._dynamicUIPort.onMessage.addListener((msg) => {
			if (msg.to !== 'blocking' || !msg.body) { return; }

			this.props.actions.updateBlockingData(msg.body);
		});
		this._dynamicUIPort.postMessage({ name: 'BlockingComponentDidMount' });
	}

	/**
	 * Lifecycle event
	 */
	componentWillReceiveProps(nextProps) {
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
		this._dynamicUIPort.postMessage({ name: 'BlockingComponentWillUnmount' });
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
		const {
			actions,
			categories,
			expand_all_trackers,
			is_expanded,
			language,
			paused_blocking,
			selected_app_ids,
			show_tracker_urls,
			sitePolicy,
			smartBlock,
			smartBlockActive
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
				{(disableBlocking && is_expanded) ?
					<NotScanned />
					:
					<div className={`${blockingClasses} blocking-trackers show-warnings`}>
						{ categories.length > 0 &&
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
							/>
						}
					</div>
				}
			</div>
		);
	}
}

export default Blocking;
