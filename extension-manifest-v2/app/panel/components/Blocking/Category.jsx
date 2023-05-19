/**
 * Category Component
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
import ClassNames from 'classnames';
import ThemeContext from '../../contexts/ThemeContext';
import Trackers from './Trackers';

/**
 * @class Implement Category component, which represents a
 * container for the list of trackers. This component is shared
 * by Blocking view and Global Blocking subview in Settings.
 * @memberOf BlockingComponents
 */
class Category extends React.Component {
	static contextType = ThemeContext;

	constructor(props) {
		super(props);

		const { expandAll } = this.props;
		this.state = {
			allShownBlocked: false,
			totalShownBlocked: false,
			showTooltip: false,
			isExpanded: expandAll
		};

		// event bindings
		this.toggleCategoryTrackers = this.toggleCategoryTrackers.bind(this);
		this.clickCategoryStatus = this.clickCategoryStatus.bind(this);
		this.showTooltip = this.showTooltip.bind(this);
		this.hideTooltip = this.hideTooltip.bind(this);
	}

	/**
	 * Lifecycle event.
	 */
	static getDerivedStateFromProps(prevProps) {
		const {
			allShownBlocked,
			totalShownBlocked,
		} = Category.updateCategoryCheckbox(prevProps.category);

		return {
			allShownBlocked,
			totalShownBlocked
		};
	}

	/**
	 * Calculate and save in state the number of blocked trackers
	 * and if this number covers all trackers in the category.
	 * Based on this numbers category checkbox will be render appropriately.
	 * Called in lifecycle events.
	 * @param {Object}		category object containg the list of tracker objects
	 */
	static updateCategoryCheckbox(category) {
		let totalShownBlocked = 0;
		let allShownBlocked = true;
		let shownCount = 0;
		category.trackers.forEach((tracker) => {
			if (tracker.shouldShow) {
				shownCount++;
				if (tracker.blocked && !tracker.ss_allowed) {
					totalShownBlocked++;
				}
			}
		});

		allShownBlocked = (shownCount === totalShownBlocked);
		return {
			allShownBlocked,
			totalShownBlocked,
		};
	}

	/**
	 * Lifecycle event. When view is opening we save in state
	 * new values related to tracker blocking to ensure correct rendering.
	 */
	componentDidMount() {
		const { category } = this.props;
		if (category) {
			const {
				allShownBlocked,
				totalShownBlocked,
			} = Category.updateCategoryCheckbox(category);
			this.setState({ allShownBlocked, totalShownBlocked });
		}
	}

	/**
	 * Lifecycle event
	 */
	componentDidUpdate(prevProps) {
		this.updateCategoryExpanded(prevProps);
	}

	/**
	 * Set tooltip showing state to true in state which results in actual showing
	 * of the tooltip.
	 * @param  {Object} event mouseover event
	 */
	showTooltip() {
		this.setState({ showTooltip: true });
	}

	/**
	 * Set tooltip showing state to false in state which results in eventual hiding
	 * of the tooltip.
	 * @param  {Object} event mouseover event
	 */
	hideTooltip() {
		this.setState({ showTooltip: false });
	}

	/**
	 * Implement handler for clicking on the category name or on the chevron.
	 */
	toggleCategoryTrackers() {
		this.setState(state => ({
			isExpanded: !state.isExpanded
		}));
	}

	/**
	 * Implement handler for clicking on the category block/unblock icon.
	 * Trigger action which will block/unblock all trackers in the category.
	 * Display alert that new settings were successfully persisted.
	 */
	clickCategoryStatus() {
		const {
			actions,
			category,
			globalBlocking,
			sitePolicy,
			paused_blocking,
			smartBlock,
			smartBlockActive,
			showToast
		} = this.props;
		const { allShownBlocked } = this.state;
		const globalBlockingBool = !!globalBlocking;
		const blocked = !allShownBlocked;

		if ((paused_blocking || sitePolicy) && !globalBlockingBool) {
			return;
		}

		actions.updateCategoryBlocked({
			smartBlockActive,
			smartBlock,
			category: category.id,
			blocked,
		});

		actions.showNotification({
			updated: `cat_${category.id}_blocked`,
			reload: true,
		});

		if (globalBlockingBool) {
			showToast({
				text: t('global_settings_saved_category')
			});
		}
	}

	/**
	 *	Update showTrackers state attribute with the value coming from nextProps.
	 *	Called in lifecycle events.
	 *	@param {boolean}     global expanded state
	 */
	updateCategoryExpanded(prevProps) {
		const { expandAll } = this.props;
		const { isExpanded } = this.state;
		if (expandAll !== prevProps.expandAll && expandAll !== isExpanded) {
			this.setState({
				isExpanded: expandAll
			});
		}
	}

	_renderCaret() {
		const { isExpanded } = this.state;
		const { isUnidentified } = this.props;
		const caretClasses = ClassNames(this.context, {
			'caret-down': !isExpanded,
			'caret-up': isExpanded,
			Category__antiTrackingCaret: isUnidentified
		});
		return (
			<svg className={caretClasses} onClick={this.toggleCategoryTrackers} width="11" height="7" viewBox="0 0 11 7" xmlns="http://www.w3.org/2000/svg">
				<path d={isExpanded ? 'M1.283 7L0 5.676 5.5 0 11 5.676 9.717 7 5.5 2.649z' : 'M1.21.02L-.02 1.25l5.27 5.27 5.27-5.27L9.29.02 5.25 4.06'} fillRule="evenodd" />
			</svg>
		);
	}

	/**
	* Render a list of categories. Pass globalBlocking flag to all trackers
	* in the category so that they would know which view they are part of.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const {
			actions,
			category,
			paused_blocking,
			sitePolicy,
			isUnidentified,
			globalBlocking,
			index,
			filtered,
			showToast,
			show_tracker_urls,
			language,
			smartBlockActive,
			smartBlock,
			setup_complete,
		} = this.props;
		const {
			totalShownBlocked,
			allShownBlocked,
			showTooltip,
			isExpanded,
		} = this.state;

		const globalBlockingBool = !!globalBlocking;

		const checkBoxStyle = `${(totalShownBlocked && allShownBlocked) ? 'all-blocked ' : (totalShownBlocked ? 'some-blocked ' : '')} checkbox-container`;
		const filteredText = { color: 'red' };

		let trackersBlockedCount;
		if (paused_blocking || sitePolicy === 2) {
			trackersBlockedCount = 0;
		} else if (sitePolicy === 1) {
			trackersBlockedCount = category.num_total || 0;
		} else {
			trackersBlockedCount = category.num_blocked || 0;
		}

		return (
			<div className={`${category.num_shown === 0 ? 'hide' : ''} blocking-category`}>
				<div className={`sticky-category${showTooltip ? ' no-sticky' : ''}${isUnidentified ? ' anti-tracking-header' : ''}`}>
					{isUnidentified && (
						<div className="Category__antiTrackingDivider" />
					)}
					<div className="row align-middle">
						<div className="columns shrink align-self-top">
							<div className="cat-image-wrapper">
								<div className="cat-image-background" style={{ backgroundColor: category.color }} />
								<img className="cat-image" src={`/app/images/panel/categories/${category.img_name}.svg`} />
							</div>
						</div>
						<div className="columns collapse-left collapse-right align-self-top">
							<div className={`cat-name ${globalBlocking ? 'has-tooltip' : ''}`} onClick={this.toggleCategoryTrackers}>
								{category.name}
							</div>
							<div className={globalBlocking ? (index ? 'cat-tooltip-up' : 'cat-tooltip-down') : 'hide'} data-g-tooltip={category.description} onMouseOver={this.showTooltip} onMouseOut={this.hideTooltip}>
								<img src="/app/images/panel/icon-information-tooltip.svg" className="cat-question" />
							</div>
							<div className="counts">
								<div className="total-count">
									{filtered && (
										<span className="text" style={filteredText}>
											{t('blocking_category_tracker_found')}
										</span>
									)}
									<span className="count">{`${category.num_total} `}</span>
									<span className="text">
										{ (category.num_total === 1) ? t('blocking_category_tracker') : t('blocking_category_trackers') }
									</span>
								</div>
							</div>
						</div>
						<div className="columns collapse-left collapse-right shrink align-self-justify">
							{ this._renderCaret() }
						</div>
					</div>
				</div>
				{isExpanded && (
					<Trackers
						globalBlocking={globalBlockingBool}
						trackers={category.trackers}
						cat_id={category.id}
						actions={actions}
						showToast={showToast}
						show_tracker_urls={show_tracker_urls}
						sitePolicy={sitePolicy}
						paused_blocking={paused_blocking}
						language={language}
						smartBlockActive={smartBlockActive}
						smartBlock={smartBlock}
						isUnidentified={isUnidentified}
						setup_complete={setup_complete}
					/>
				)}
			</div>
		);
	}
}

Category.defaultProps = {
	category: {},
};

export default Category;
