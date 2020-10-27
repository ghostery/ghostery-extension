/**
 * Blocking Category Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { FixedSizeList as List } from 'react-window';
import BlockingTracker from './BlockingTracker';

class BlockingCategory extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			openTrackerIndex: -1,
		};

		this.heightTracker = 50;
		this.heightListHeader = 30;
		this.maxListHeight = 750;
	}

	getListHeight(count) {
		return Math.min(this.maxListHeight, count * this.heightTracker);
	}

	getListHeightWithHeader(count) {
		return this.heightListHeader + this.getListHeight(count);
	}

	get categorySelectStatus() {
		const { type, siteProps, category } = this.props;
		const { trackers, num_total, num_blocked } = category;

		if (type === 'site') {
			if (siteProps.isTrusted) {
				return 'trusted';
			}

			if (siteProps.isRestricted) {
				return 'restricted';
			}

			if (category.id === 'unidentified') {
				return 'unidentified';
			}

			if (trackers.every(tracker => tracker.ss_allowed)) {
				return 'trusted';
			}

			if (trackers.every(tracker => tracker.ss_blocked)) {
				return 'restricted';
			}

			if (trackers.some(tracker => tracker.ss_allowed || tracker.ss_blocked)) {
				return 'ss_mixed';
			}
		}

		if (num_blocked && num_blocked === num_total) {
			return 'blocked';
		}

		if (num_blocked && num_blocked !== num_total) {
			return 'mixed';
		}

		return '';
	}

	get numTrackersText() {
		const { category } = this.props;
		const { num_total } = category;

		return `${num_total} ${(num_total === 1) ? t('blocking_category_tracker') : t('blocking_category_trackers')}`;
	}

	get numBlockedText() {
		const { category } = this.props;
		const { num_blocked } = category;

		return `${num_blocked} ${t('blocking_category_blocked')}`;
	}

	getTrackerOpenStatus = (index) => {
		const { openTrackerIndex } = this.state;
		return index === openTrackerIndex;
	}

	toggleTrackerSelectOpen = (index) => {
		const { openTrackerIndex } = this.state;
		if (openTrackerIndex === index) {
			this.setState({ openTrackerIndex: -1 });
		} else {
			this.setState({ openTrackerIndex: index });
		}
	}

	clickCategorySelect = (event) => {
		event.stopPropagation();
		const { category, type, callGlobalAction } = this.props;
		const { id } = category;
		const selectStatus = this.categorySelectStatus;

		if (selectStatus === '' || selectStatus === 'mixed') {
			callGlobalAction({
				actionName: 'blockUnBlockAllTrackers',
				actionData: {
					block: true,
					categoryId: id,
					type,
				}
			});
		} else if (selectStatus === 'blocked') {
			callGlobalAction({
				actionName: 'blockUnBlockAllTrackers',
				actionData: {
					block: false,
					categoryId: id,
					type,
				}
			});
		}
	}

	renderCategorySelect() {
		const categorySelect = this.categorySelectStatus;
		// Hide category blocking for Unidentified trackers
		if (categorySelect === 'unidentified') {
			return false;
		}
		const categorySelectClassNames = ClassNames('BlockingSelectButton', {
			BlockingSelectButton__mixed: categorySelect === 'mixed' || categorySelect === 'ss_mixed',
			BlockingSelectButton__blocked: categorySelect === 'blocked',
			BlockingSelectButton__trusted: categorySelect === 'trusted',
			BlockingSelectButton__restricted: categorySelect === 'restricted',
		});

		return (
			<div className="BlockingCategory--noPointer">
				<div className={categorySelectClassNames} onClick={this.clickCategorySelect} />
			</div>
		);
	}

	renderToggleArrow() {
		const { open } = this.props;
		const toggleClassNames = ClassNames('BlockingCategory__toggle', {
			'BlockingCategory--open': open,
		});

		return (
			<div className={toggleClassNames} />
		);
	}

	renderBlockingTracker = ({ index, style }) => {
		const {
			category,
			type,
			siteProps,
			settings,
			callGlobalAction,
		} = this.props;
		const { id, trackers } = category;
		const tracker = trackers[index];

		return (
			<div className="BlockingCategory__tracker" key={tracker.id} style={style}>
				<BlockingTracker
					index={index}
					tracker={tracker}
					categoryId={id}
					type={type}
					toggleTrackerSelectOpen={() => { this.toggleTrackerSelectOpen(tracker.id); }}
					open={this.getTrackerOpenStatus(tracker.id)}
					siteProps={siteProps}
					settings={settings}
					callGlobalAction={callGlobalAction}
				/>
				<div className="BlockingCategory__trackerBottom" />
			</div>
		);
	}

	render() {
		const { openTrackerIndex } = this.state;
		const {
			index,
			category,
			open,
			toggleCategoryOpen,
		} = this.props;
		const {
			id,
			name,
			img_name,
			num_total,
			num_blocked,
		} = category;
		const categoryImage = `/app/images/panel-android/categories/${img_name}.svg`;

		const categoryClassNames = ClassNames('BlockingCategory', {
			BlockingCategory__unidentified: id === 'unidentified',
		});

		return (
			<div className={categoryClassNames}>
				<div className="BlockingCategory__details flex-container" onClick={() => { toggleCategoryOpen(index); }}>
					<img className="BlockingCategory__image" src={categoryImage} />
					<div className="flex-child-grow">
						<h2 className="BlockingCategory__name">{name}</h2>
						<div>
							<span className="BlockingCategory__numTrackers">{this.numTrackersText}</span>
							{ !!num_blocked && (
								<span className="BlockingCategory__numBlocked">{this.numBlockedText}</span>
							)}
						</div>
					</div>
					<div className="BlockingCategory__buttons flex-container flex-dir-column align-justify align-middle">
						{this.renderCategorySelect()}
						{this.renderToggleArrow()}
					</div>
				</div>
				<div className="BlockingCategory__list" style={{ height: open ? this.getListHeightWithHeader(num_total) : 0 }}>
					{open && (
						<div>
							<div className="BlockingCategory__listHeader flex-container align-bottom" style={{ height: this.heightListHeader }}>
								<span className="BlockingCategory--uppercase flex-child-grow">{t('blocking_category_trackers')}</span>
								<span>{category.id === 'unidentified' ? t('android_anonymized') : t('blocking_category_blocked')}</span>
							</div>
							<List
								height={this.getListHeight(num_total)}
								itemCount={num_total}
								itemSize={this.heightTracker}
								width="100%"
								itemData={{ openTrackerIndex }}
							>
								{this.renderBlockingTracker}
							</List>
						</div>
					)}
				</div>
			</div>
		);
	}
}

BlockingCategory.propTypes = {
	index: PropTypes.number.isRequired,
	category: PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		num_total: PropTypes.number.isRequired,
		num_blocked: PropTypes.number.isRequired,
		trackers: PropTypes.arrayOf(PropTypes.shape({
			id: PropTypes.oneOfType([
				PropTypes.string,
				PropTypes.number,
			]).isRequired,
			ss_allowed: PropTypes.bool,
			ss_blocked: PropTypes.bool,
		})).isRequired,
		img_name: PropTypes.string.isRequired,
	}).isRequired,
	open: PropTypes.bool.isRequired,
	toggleCategoryOpen: PropTypes.func.isRequired,
	type: PropTypes.oneOf([
		'site',
		'global',
	]).isRequired,
	siteProps: PropTypes.shape({
		isTrusted: PropTypes.bool.isRequired,
		isRestricted: PropTypes.bool.isRequired,
		isPaused: PropTypes.bool.isRequired,
	}).isRequired,
	settings: PropTypes.shape({}).isRequired,
	callGlobalAction: PropTypes.func.isRequired,
};

export default BlockingCategory;
