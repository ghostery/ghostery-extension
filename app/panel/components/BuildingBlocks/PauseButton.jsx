/**
 * Pause Button Component
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
	 * @param {Object} event the click event
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
	 * @param {int} time The time in minutes that Ghostery should be paused`
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
		} = this.props;
		let buttonEl;
		if (isCondensed) {
			buttonEl = <span className="pause-button-icon pause-button-text" />;
		} else {
			buttonEl = (
				<span className="pause-button-text">
					{isPaused ? t('summary_resume_ghostery') : t('summary_pause_ghostery')}
				</span>
			);
		}
		return (
			<span className="flex-container align-center-middle full-height">
				{buttonEl}
			</span>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Pause Button on the Summary View
	 */
	render() {
		const {
			isPaused,
			isCentered,
			isCondensed
		} = this.props;
		const { showDropdown } = this.state;
		const centeredAndCondensed = isCentered && isCondensed;

		const sharedClassNames = {
			button: true,
			smaller: !isCentered,
			smallest: centeredAndCondensed,
			'no-border-radius': centeredAndCondensed,
			'dropdown-open': showDropdown,
		};
		const pauseButtonClassNames = ClassNames('button-left', 'button-pause', 'g-tooltip', sharedClassNames, {
			active: isPaused,
		});
		const dropdownButtonClassNames = ClassNames('button-right', 'button-caret', sharedClassNames, {
			active: showDropdown,
		});
		const dropdownContainerClassNames = ClassNames('button-group', 'dropdown-container', {
			centered: isCentered,
		});

		const togglePauseButton = (
			<div
				className={pauseButtonClassNames}
				onClick={this.props.clickPause}
				ref={(node) => { this.pauseWidth = node && node.clientWidth; }}
			>
				{this.renderPauseButtonText()}
				<Tooltip
					body={isPaused ? t('summary_resume_ghostery_tooltip') : t('summary_pause_ghostery_tooltip')}
					position={(isCentered) ? 'right' : 'top'}
				/>
			</div>
		);

		const pauseDurationSelectionDropdownCaret = (
			<div className={dropdownButtonClassNames} onClick={this.clickDropdownCaret}>
				<span className="show-for-sr">
					{t('summary_show_menu')}
				</span>
			</div>
		);

		const pauseDurationSelectionDropdown = (
			<div className={dropdownContainerClassNames}>
				{this.renderDropdown()}
			</div>
		);

		return (
			<div className="sub-a-dub-component pause-button">
				<div className="button-group">
					{togglePauseButton}
					{pauseDurationSelectionDropdownCaret}
				</div>
				{showDropdown && pauseDurationSelectionDropdown}
			</div>
		);
	}
}

export default PauseButton;
