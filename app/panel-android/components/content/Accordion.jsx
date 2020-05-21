/**
 * Accordion Component
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
import PropTypes from 'prop-types';

import TrackerItem from './TrackerItem';

export default class Accordion extends React.Component {
	itemHeight = 50;

	nExtraItems = 40;

	headerheight = 32;

	constructor(props) {
		super(props);
		this.myRef = React.createRef();

		this.state = {
			isActive: false,
			openMenuIndex: -1,
			currentItemsLength: 0,
		};

		this.isWaiting = false;
		this.unMounted = false;
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll);
	}

	componentWillUnmount() {
		this.unMounted = true;
		window.removeEventListener('scroll', this.handleScroll);
	}

	get blockingStatus() {
		const { type, numBlocked, numTotal } = this.props;
		const { siteProps } = this.context;
		if (type === 'site-trackers') {
			if (siteProps.isTrusted) {
				return 'trusted';
			}

			if (siteProps.isRestricted) {
				return 'restricted';
			}

			const trackers = this.getTrackers(true);
			if (trackers.every(tracker => tracker.ss_allowed)) {
				return 'trusted';
			}

			if (trackers.every(tracker => tracker.ss_blocked)) {
				return 'restricted';
			}

			if (trackers.some(tracker => tracker.ss_allowed || tracker.ss_blocked)) {
				return 'mixed';
			}
		}

		if (numBlocked === numTotal) {
			return 'blocked';
		}

		return '';
	}

	getTrackers = (force = false) => {
		const { id, getTrackersFromCategory } = this.props;
		const { isActive } = this.state;
		if (!isActive && !force) {
			return [];
		}

		return getTrackersFromCategory(id);
	}

	getMenuOpenStatus = (index) => {
		const { openMenuIndex } = this.state;
		return index === openMenuIndex;
	}

	checkAndUpdateData = () => {
		const { numTotal } = this.props;
		const { isActive, currentItemsLength } = this.state;
		if (this.unMounted || !isActive || currentItemsLength >= numTotal) {
			return;
		}

		const needToUpdateHeight = this.nExtraItems * this.itemHeight; // Update even before the bottom is visible

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const accordionContentNode = this.myRef.current;
		const boundingRect = accordionContentNode.getBoundingClientRect();
		// Try lo load more when needed
		if (scrollTop + window.innerHeight - (accordionContentNode.offsetTop + boundingRect.height) > -needToUpdateHeight) {
			this.setState((prevState) => {
				const itemsLength = Math.min(prevState.currentItemsLength + this.nExtraItems, numTotal);
				return { currentItemsLength: itemsLength };
			});
		}
	}

	toggleMenu = (index) => {
		const { openMenuIndex } = this.state;
		if (openMenuIndex === index) {
			this.setState({ openMenuIndex: -1 });
		} else {
			this.setState({ openMenuIndex: index });
		}
	}

	handleScroll = () => {
		// Don't call the checkAndUpdateData function so many times. Use throttle
		if (this.isWaiting) {
			return;
		}

		this.isWaiting = true;

		setTimeout(() => {
			this.isWaiting = false;
			this.checkAndUpdateData();
		}, 200);
	}

	toggleContent = () => {
		const { index, toggleAccordion, numTotal } = this.props;
		const { isActive } = this.state;
		toggleAccordion(index);

		// Show some trackers when this category is expanded
		const currentState = isActive;
		const itemsLength = Math.min(this.nExtraItems, numTotal);
		this.setState({
			isActive: !currentState,
			currentItemsLength: itemsLength,
		});
	}

	handleCategoryClicked = () => {
		const { id, type } = this.props;
		const { callGlobalAction } = this.context;
		if (!this.blockingStatus) {
			const blockingType = type === 'site-trackers' ? 'site' : 'global';
			callGlobalAction({
				actionName: 'blockUnBlockAllTrackers',
				actionData: {
					block: true,
					type: blockingType,
					categoryId: id,
				}
			});
		} else if (this.blockingStatus === 'blocked') {
			const blockingType = type === 'site-trackers' ? 'site' : 'global';
			callGlobalAction({
				actionName: 'blockUnBlockAllTrackers',
				actionData: {
					block: false,
					type: blockingType,
					categoryId: id,
				}
			});
		}
	}

	render() {
		const {
			index,
			open,
			numBlocked,
			name,
			numTotal,
			logo,
			id,
			type
		} = this.props;
		const { isActive, currentItemsLength } = this.state;
		const titleStyle = { backgroundImage: `url(/app/images/panel-android/categories/${logo}.svg)` };
		const contentStyle = { '--trackers-length': `${open ? (currentItemsLength * this.itemHeight) + this.headerheight : 0}px` };

		return (
			<div className={`accordion ${index}`}>
				<span className={`accordionSelect ${this.blockingStatus}`} onClick={this.handleCategoryClicked} />
				<div className={`accordionTitle ${isActive ? 'active' : ''}`} style={titleStyle} onClick={this.toggleContent}>
					<h2>{name}</h2>
					<p>
						<span className="total-trackers">
							{numTotal}
							{' '}
							TRACKERS
						</span>
						{!!numBlocked && (
							<span className="blocked-trackers">
								{numBlocked}
								{' '}
								Blocked
							</span>
						)}
					</p>
					<p>
						On this site
					</p>
				</div>
				<div ref={this.myRef} className="accordionContent" style={contentStyle}>
					<p>
						<span>TRACKERS</span>
						<span>Blocked</span>
					</p>
					<ul className="trackers-list">
						{this.getTrackers(true).slice(0, currentItemsLength).map((tracker, ind) => (
							<TrackerItem
								key={tracker.id}
								index={ind}
								tracker={tracker}
								showMenu={this.getMenuOpenStatus(ind)}
								toggleMenu={this.toggleMenu}
								categoryId={id}
								type={type}
							/>
						))}
					</ul>
				</div>
			</div>
		);
	}
}

Accordion.propTypes = {
	toggleAccordion: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
	getTrackersFromCategory: PropTypes.func.isRequired,
	open: PropTypes.bool,
	numBlocked: PropTypes.number,
	name: PropTypes.string,
	numTotal: PropTypes.number,
	logo: PropTypes.string,
	id: PropTypes.string,
	type: PropTypes.string,
};

Accordion.defaultProps = {
	open: false,
	numBlocked: 0,
	name: '',
	numTotal: 0,
	logo: '',
	id: '',
	type: '',
};

Accordion.contextTypes = {
	siteProps: PropTypes.shape,
	callGlobalAction: PropTypes.func,
};
