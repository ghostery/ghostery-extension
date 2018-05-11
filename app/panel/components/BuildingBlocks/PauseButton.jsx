/**
 * Pause Button Component
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

import React, { Component } from 'react';
import ClassNames from 'classnames';
import Tooltip from '../Tooltip';

/**
 * @class Implements the Pause button on the Summary view.
 * @memberof PanelBuildingBlocks
 */
class PauseButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showDropdown: false,
		};

		// Event Bindings
		this.clickDropdownCaret = this.clickDropdownCaret.bind(this);
		this.clickDropdownPause = this.clickDropdownPause.bind(this);
		this.clickOutside = this.clickOutside.bind(this);
	}

	/**
	 * Handles the click event for the Dropdown Caret
	 */
	clickDropdownCaret() {
		if (!this.state.showDropdown) {
			this.setState({ showDropdown: true });
			document.body.addEventListener('click', this.clickOutside);
		} else {
			this.setState({ showDropdown: false });
			document.body.removeEventListener('click', this.clickOutside);
		}
	}

	/**
	 * Handles clicking outside the dropdown menu when the menu is exposed
	 * @param  {Object} event the click event
	 */
	clickOutside(event) {
		const classes = event.target.className || '';
		if (classes && typeof classes === 'string' && (classes.indexOf('button-caret') !== -1 || classes.indexOf('dropdown-clickable') !== -1)) {
			return;
		}
		document.body.removeEventListener('click', this.clickOutside);
		this.setState({ showDropdown: false });
	}

	/**
	 * Handles the click event for timed pause in the dropdown list
	 */
	/**
	 * Handles the click event for timed pause in the dropdown list
	 * @param  {int} time The time in minutes that Ghostery should be paused`
	 */
	clickDropdownPause(time) {
		this.setState({ showDropdown: false });
		document.body.removeEventListener('click', this.clickOutside);
		this.props.clickPause(time);
	}

	/**
	 * Helper render function for the dropdown list
	 * @return {JSX} JSX for the dropdown list
	 */
	renderDropdown() {
		const { isCondensed, isPausedTimeout } = this.props;

		function dropdownItemClassName(value) {
			return ClassNames('dropdown-item', 'clickable', 'dropdown-clickable', {
				selected: value === isPausedTimeout / 60000,
			});
		}

		const dropdownStyles = {
			width: `${this.pauseWidth + 26}px`,
		};

		return (
			<div className="dropdown" style={dropdownStyles}>
				{this.props.dropdownItems.map(item => (
					<div className={dropdownItemClassName(item.val)} key={item.name} onClick={() => { this.clickDropdownPause(item.val); }}>
						<span className="dropdown-clickable">
							{!isCondensed ? item.name : item.name_condensed}
						</span>
					</div>
				))}
			</div>
		);
	}

	/**
	 * Helper render function for Pause Button text
	 * @return {JSX} JSX for the Pause Button's text
	 */
	renderPauseButtonText() {
		const {
			isPaused,
			isCondensed,
			isAbPause,
		} = this.props;

		if (isCondensed) {
			return (<span className="pause-button-icon pause-button-text" />);
		} else if (isAbPause) {
			return (
				<span className="pause-button-icon pause-button-text">
					{isPaused ? t('summary_resume_ghostery_ab_pause') : t('summary_pause_ghostery_ab_pause')}
				</span>
			);
		}
		return (
			<span className="pause-button-text">
				{isPaused ? t('summary_resume_ghostery') : t('summary_pause_ghostery')}
			</span>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Pause Button on the Summary View
	 */
	render() {
		const pauseButtonClassNames = ClassNames('button', 'button-left', 'button-pause', {
			'g-tooltip': !this.props.isAbPause,
			active: this.props.isPaused,
			smaller: !this.props.isCentered,
			smallest: this.props.isCentered && this.props.isCondensed,
			'no-border-radius': this.props.isCentered && this.props.isCondensed,
			'dropdown-open': this.state.showDropdown,
		});
		const dropdownButtonClassNames = ClassNames('button', 'button-right', 'button-caret', {
			active: this.state.showDropdown,
			smaller: !this.props.isCentered,
			smallest: this.props.isCentered && this.props.isCondensed,
			'no-border-radius': this.props.isCentered && this.props.isCondensed,
			'dropdown-open': this.state.showDropdown,
		});
		const dropdownContainerClassNames = ClassNames('button-group', 'dropdown-container', {
			centered: this.props.isCentered,
		});
		const dropdownContainerStyles = {
			left: `${(this.props.isCentered && this.props.isAbPause) ? this.pauseLeft : 0}px`,
		};

		return (
			<div className="sub-component pause-button">
				<div className="button-group">
					<div
						className={pauseButtonClassNames}
						onClick={this.props.clickPause}
						ref={(node) => {
							this.pauseWidth = node && node.clientWidth;
							this.pauseLeft = node && node.offsetLeft;
						}}
					>
						{this.renderPauseButtonText()}
						{!this.props.isAbPause && (
							<Tooltip
								header={this.props.isPaused ? t('summary_resume_ghostery_tooltip') : t('summary_pause_ghostery_tooltip')}
								position={(this.props.isCentered) ? 'right' : 'top'}
							/>
						)}
					</div>
					<div className={dropdownButtonClassNames} onClick={this.clickDropdownCaret}>
						<span className="show-for-sr">
							{t('summary_show_menu')}
						</span>
					</div>
				</div>
				<div className={dropdownContainerClassNames} style={dropdownContainerStyles}>
					{this.state.showDropdown && this.renderDropdown()}
				</div>
			</div>
		);
	}
}

export default PauseButton;
