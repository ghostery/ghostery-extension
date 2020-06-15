/**
 * Blocking Header Component
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
/**
 * @namespace  BlockingComponents
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { updateSummaryBlockingCount } from '../../utils/blocking';
import ClickOutside from '../BuildingBlocks/ClickOutside';

/**
 * @class Implement Blocking Header component. This component is shared
 * by Blocking view and Global Blocking subview in Settings.
 * @memberOf BlockingComponents
 */
class BlockingHeader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			allBlocked: false,
			fromHere: false,
			filtered: false,
			searchValue: '',
			filterMenuOpened: false,
		};

		// event bindings
		this.clickBlockAll = this.clickBlockAll.bind(this);
		this.clickExpandAll = this.clickExpandAll.bind(this);
		this.updateValue = this.updateValue.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.clickFilterText = this.clickFilterText.bind(this);
		this.filterAll = this.filterAll.bind(this);
		this.filterBlocked = this.filterBlocked.bind(this);
		this.filterUnblocked = this.filterUnblocked.bind(this);
		this.filterNew = this.filterNew.bind(this);
	}

	/**
	 * Lifecycle event
	 */
	static getDerivedStateFromProps(prevProps, prevState) {
		return BlockingHeader.updateBlockAll(prevProps.categories, prevState.fromHere);
	}

	/**
	 * Get appropriate initial text ("Block All" or "Unblock All") in Blocking header
	 * when Blocking or Global Blocking view opens. Return object to set in state.
	 */
	static updateBlockAll(categories, fromHere) {
		if (categories) {
			let totalShown = 0;
			let totalBlocked = 0;
			let filtered = false;

			categories.forEach((category) => {
				category.trackers.forEach((tracker) => {
					if (tracker.shouldShow) {
						totalShown++;
						if (tracker.blocked) {
							totalBlocked++;
						}
					} else {
						filtered = true;
					}
				});
			});
			if (fromHere || totalShown === totalBlocked || totalBlocked === 0) {
				return {
					allBlocked: (totalShown === totalBlocked),
					fromHere: false,
					filtered
				};
			}
		}
		return null;
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		const {
			actions, categories, smartBlock, smartBlockActive
		} = this.props;
		const { fromHere } = this.state;
		if (categories) {
			const updates = BlockingHeader.updateBlockAll(categories, fromHere);
			if (updates) {
				this.setState({
					allBlocked: updates.allBlocked,
					fromHere: updates.fromHere,
					filtered: updates.filtered
				});
			}
		}

		if (typeof actions.updateTrackerCounts === 'function') {
			// if we're on GlobalSettings, we don't need to run this function
			const calcSmartBlock = (smartBlockActive && smartBlock) || { blocked: {}, unblocked: {} };
			updateSummaryBlockingCount(categories, calcSmartBlock, actions.updateTrackerCounts);
		}
	}

	/**
	 * Implement handler for "Expand All/Collapse All" in the Blocking header.
	 * Trigger action which expands/contracts all categories.
	 */
	clickExpandAll() {
		const { actions, expandAll } = this.props;
		const newState = !expandAll;
		actions.toggleExpandAll(newState);
	}

	/**
	 * Implement handler for "Block All/Unblock All" text in Blocking header.
	 * Trigger action which blocks/unblocks all trackers currently in the
	 * blocking view. Update counters in Summary view accordingly.
	 */
	clickBlockAll() {
		const {
			actions,
			categories,
			globalBlocking,
			paused_blocking,
			sitePolicy,
			smartBlock,
			smartBlockActive,
			showToast
		} = this.props;
		const globalBlockingBool = !!globalBlocking;
		if (categories) {
			this.setState({ fromHere: true }, () => {
				const { allBlocked } = this.state;
				if ((paused_blocking || sitePolicy) && !globalBlockingBool) {
					return;
				}

				actions.updateBlockAllTrackers({
					smartBlockActive,
					smartBlock,
					allBlocked,
				});

				if (typeof actions.updateTrackerCounts === 'function') {
					// if we're on GlobalSettings, we don't need to run this function
					const calcSmartBlock = (smartBlockActive && smartBlock) || { blocked: {}, unblocked: {} };
					updateSummaryBlockingCount(categories, calcSmartBlock, actions.updateTrackerCounts);
				}

				actions.showNotification({
					updated: 'globalBLockAll',
					reload: true,
				});

				if (globalBlockingBool) {
					showToast({
						text: t('global_settings_saved')
					});
				}
			});
		}
	}

	/**
	 * Handle RETURN for search box. For non-empty value expands all categories.
	 * Applicable to Global Tracking view in Settings.
	 */
	handleSubmit(event) {
		const { actions } = this.props;
		const { searchValue } = this.state;
		if (event.keyCode === 13) {
			if (searchValue) {
				actions.toggleExpandAll(true);
			}
		}
	}

	/**
	 * Update state with value currently typed in search box. For empty
	 * value also collapses all categories. Triggers action which filters
	 * trackers according to the current search term.
	 * Applicable to Global Tracking view in Settings.
	 *
	 * @param {Object} event   	keyboard event
	 */
	updateValue(event) {
		const { actions } = this.props;
		const query = event.currentTarget.value ? event.currentTarget.value.toLowerCase() : '';
		this.setState({ searchValue: query });
		actions.updateSearchValue(query);
	}

	/**
	 * Implement handler for "All" text under the search box on the right side,
	 * Update state with alternative value of menu flag which ultimately
	 * results in toggling of the drop-down menu.
	 * Applicable to Global Tracking view in Settings.
	 *
	 * @param {Object} event   	mouseclick event
	 */
	clickFilterText() {
		this.setState(prevState => ({ filterMenuOpened: !prevState.filterMenuOpened }));
	}

	/**
	 * Implement handler for "All Trackers" item of the filtering menu.
	 * Triggers "all" filtering action which returns all trackers
	 * and closes menu. Applicable to Global Tracking view in Settings.
	 *
	 * @param {Object} event   	mouseclick event
	 */
	filterAll() {
		const { actions } = this.props;
		actions.filter('all');
		this.setState({ filterMenuOpened: false });
	}

	/**
	 * Implement handler for "Blocked Trackers" item of the filtering menu.
	 * Triggers "blocked" filtering action which select subset of
	 * blocked trackers and closes menu.
	 * Applicable to Global Tracking view in Settings.
	 *
	 * @param {Object} event   	mouseclick event
	 */
	filterBlocked() {
		const { actions } = this.props;
		actions.filter('blocked');
		this.setState({ filterMenuOpened: false });
	}

	/**
	 * Implement handler for "Unblocked Trackers" item of the filtering menu.
	 * Triggers "unblocked" filtering action which select subset of
	 * unblocked trackers and closes menu.
	 * Applicable to Global Tracking view in Settings.
	 *
	 * @param {Object} event   	mouseclick event
	 */
	filterUnblocked() {
		const { actions } = this.props;
		actions.filter('unblocked');
		this.setState({ filterMenuOpened: false });
	}

	/**
	 * Implement handler for "New Since Last Update" item of the filtering menu.
	 * Triggers "new" filtering action which select subset of all new trackers
	 * added by the last tracker database update and closes menu.
	 * Applicable to Global Tracking view in Settings.
	 *
	 * @param {Object} event   	mouseclick event
	 */
	filterNew() {
		const { actions } = this.props;
		actions.filter('new');
		this.setState({ filterMenuOpened: false });
	}

	/**
	* Render appropriate Blocking Header to be part of Blocking or Global Blblocking view.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const {
			globalBlocking, categories, expandAll, filterText
		} = this.props;
		const {
			allBlocked, filtered, searchValue, filterMenuOpened
		} = this.state;
		const globalBlockingBool = !!globalBlocking;
		const blockText = allBlocked ?
			(filtered ? t('blocking_unblock_shown') : t('blocking_unblock_all')) :
			(filtered ? t('blocking_block_shown') : t('blocking_block_all'));
		return (
			<div className="blocking-header">
				<div className="row align-middle">
					<div className="columns">
						<div className="title">
							{ globalBlockingBool ? t('settings_global_blocking') : t('blocking_trackers') }
							{' '}
							<Link to="/settings/globalblocking" className="gear-icon" />
						</div>
					</div>
					<div className="shrink columns align-self-justify text-right">
						{categories && categories.length > 0 && (
							<div
								className="block-text"
								onClick={this.clickBlockAll}
							>
								{blockText}
							</div>
						)}
					</div>
				</div>
				{
					globalBlockingBool && (
						<div className="row align-middle s-search-box-container">
							<div className="columns">
								<div className="s-search-box">
									<div className="s-search-icon" />
									<input type="text" value={searchValue} placeholder={t('settings_searh_by_tracker')} onChange={this.updateValue} onKeyDown={this.handleSubmit} />
								</div>
							</div>
						</div>
					)
				}
				<div className="row footer">
					<div className="columns">
						{categories && categories.length > 0 && (
							<span className="expand-all-text" onClick={this.clickExpandAll}>
								{ (!expandAll) ? t('expand_all') : t('collapse_all') }
							</span>
						)}
					</div>
					{
						globalBlockingBool && (
							<div className="shrink columns relative">
								<ClickOutside
									onClickOutside={filterMenuOpened ? this.clickFilterText : () => {}}
								>
									<div className={filterMenuOpened ? 'filter-text-show-menu' : 'filter-text'} onClick={this.clickFilterText}>
										<span>{filterText}</span>
										<span className="caret-down" />
									</div>
									<div className={filterMenuOpened ? 'filter-menu' : 'hide'}>
										<div className="filter-menu-item" title={t('settings_filter_all')} onClick={this.filterAll}>{t('settings_filter_all')}</div>
										<div className="filter-menu-item" title={t('settings_filter_blocked')} onClick={this.filterBlocked}>{t('settings_filter_blocked')}</div>
										<div className="filter-menu-item" title={t('settings_filter_unblocked')} onClick={this.filterUnblocked}>{t('settings_filter_unblocked')}</div>
										<div className="filter-menu-item-new" title={t('settings_filter_new')} onClick={this.filterNew}>{t('settings_filter_new')}</div>
									</div>
								</ClickOutside>
							</div>
						)
					}
				</div>
			</div>
		);
	}
}

export default BlockingHeader;
