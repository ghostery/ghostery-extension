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
		if (this.props.type === 'site-trackers') {
			if (this.context.siteProps.isTrusted) {
				return 'trusted';
			}

			if (this.context.siteProps.isRestricted) {
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

		if (this.props.numBlocked === this.props.numTotal) {
			return 'blocked';
		}

		return '';
	}

	getTrackers = (force = false) => {
		if (!this.state.isActive && !force) {
			return [];
		}

		return this.props.getTrackersFromCategory(this.props.id);
	}

	getMenuOpenStatus = index => index === this.state.openMenuIndex;

	checkAndUpdateData = () => {
		if (this.unMounted || !this.state.isActive || this.state.currentItemsLength >= this.props.numTotal) {
			return;
		}

		const needToUpdateHeight = this.nExtraItems * this.itemHeight; // Update even before the bottom is visible

		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const accordionContentNode = this.myRef.current;
		const boundingRect = accordionContentNode.getBoundingClientRect();
		// Try lo load more when needed
		if (scrollTop + window.innerHeight - (accordionContentNode.offsetTop + boundingRect.height) > -needToUpdateHeight) {
			const itemsLength = Math.min(this.state.currentItemsLength + this.nExtraItems, this.props.numTotal);
			this.setState({
				currentItemsLength: itemsLength,
			});
		}
	}

	toggleMenu = (index) => {
		if (this.state.openMenuIndex === index) {
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
		this.props.toggleAccordion(this.props.index);

		// Show some trackers when this category is expanded
		const currentState = this.state.isActive;
		const itemsLength = Math.min(this.nExtraItems, this.props.numTotal);
		this.setState({
			isActive: !currentState,
			currentItemsLength: itemsLength,
		});
	}

	handleCategoryClicked = () => {
		if (!this.blockingStatus) {
			const type = this.props.type === 'site-trackers' ? 'site' : 'global';
			this.context.callGlobalAction({
				actionName: 'blockUnBlockAllTrackers',
				actionData: {
					block: true,
					type,
					categoryId: this.props.id,
				}
			});
		} else if (this.blockingStatus === 'blocked') {
			const type = this.props.type === 'site-trackers' ? 'site' : 'global';
			this.context.callGlobalAction({
				actionName: 'blockUnBlockAllTrackers',
				actionData: {
					block: false,
					type,
					categoryId: this.props.id,
				}
			});
		}
	}

	render() {
		const titleStyle = { backgroundImage: `url(/app/images/panel-android/categories/${this.props.logo}.svg)` };
		const contentStyle = { '--trackers-length': `${this.props.open ? (this.state.currentItemsLength * this.itemHeight) + this.headerheight : 0}px` };

		return (
			<div className={`accordion ${this.props.index}`}>
				<span className={`accordionSelect ${this.blockingStatus}`} onClick={this.handleCategoryClicked} />
				<div className={`accordionTitle ${this.state.isActive ? 'active' : ''}`} style={titleStyle} onClick={this.toggleContent}>
					<h2>{this.props.name}</h2>
					<p>
						<span className="total-trackers">
							{this.props.numTotal}
							{' '}
							TRACKERS
						</span>
						{!!this.props.numBlocked && (
							<span className="blocked-trackers">
								{this.props.numBlocked}
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
						{this.getTrackers(true).slice(0, this.state.currentItemsLength).map((tracker, index) => (
							<TrackerItem
								key={tracker.id}
								index={index}
								tracker={tracker}
								showMenu={this.getMenuOpenStatus(index)}
								toggleMenu={this.toggleMenu}
								categoryId={this.props.id}
								type={this.props.type}
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
