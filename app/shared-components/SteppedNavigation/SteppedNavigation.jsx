/**
 * Stepped Navigation Component
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
import { NavLink } from 'react-router-dom';
import ExitButton from '../ExitButton';

/**
 * A Functional React component for a Stepped Navigation
 * @return {JSX} JSX for rendering a Stepped Navigation
 * @memberof SharedComponents
 */
const SteppedNavigation = (props) => {
	const {
		totalSteps,
		activeIndex,
		hrefPrev,
		hrefNext,
		hrefDone,
		textPrev,
		textNext,
		textDone,
	} = props;

	const circles = [];
	for (let i = 1; i <= totalSteps; i++) {
		// Use <a> without an href prop to prevent a call to history with the same URL
		circles.push((i === activeIndex) ?
			<a aria-label="Stepped navigation link to current page" className="active" key={`nav-${i}`}><span className="a11y-label"> Active link span text</span></a>
			: <NavLink aria-label="Stepped naivation link to another page" to={`${i}`} key={`nav-${i}`}><span className="a11y-label">Inactive stepped navigation link span text</span></NavLink>);
	}

	// ilya's notes:
	/* for (let i = 1; i <= totalSteps; i++) {
   // Use <a> without an href prop to prevent a call to history with the same URL
   circles.push((i === activeIndex) ?
      // VoiceOver on Mac does NOT read the span text
      <a aria-label="Stepped navigation link to current page" className="active" key={`nav-${i}`}><span className="a11y-label">Active link span text</span></a>
      : <NavLink aria-label="Stepped navigation link to another page" to={`${i}`} key={`nav-${i}`}><span className="a11y-label">Inactive stepped navigation link span text</span></NavLink>);
}
	*/

	return (
		<div className="row align-center">
			<div className="columns small-12">
				{hrefDone && (
					<ExitButton hrefExit={hrefDone} textExit={textDone} />
				)}
				<div className="SteppedNavigation flex-container">
					<div className="flex-child-grow flex-container flex-dir-row-reverse">
						{(hrefPrev && textPrev) ? (
							<div className="SteppedNavigation__buttonContainer flex-container align-center-middle">
								<NavLink className="button hollow secondary" to={hrefPrev}>
									{textPrev}
								</NavLink>
							</div>
						) : (
							<div className="SteppedNavigation__buttonContainer" />
						)}
					</div>
					<div className="SteppedNavigation__circles flex-container align-center-middle">
						{circles}
					</div>
					<div className="flex-child-grow">
						{(hrefNext && textNext) ? (
							<div className="SteppedNavigation__buttonContainer flex-container align-center-middle">
								<NavLink className="button success" to={hrefNext}>
									{textNext}
								</NavLink>
							</div>
						) : (
							<div className="SteppedNavigation__buttonContainer" />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
SteppedNavigation.propTypes = {
	totalSteps: PropTypes.number.isRequired,
	activeIndex: PropTypes.number.isRequired,
	hrefPrev: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.string,
	]).isRequired,
	hrefNext: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.string,
	]).isRequired,
	hrefDone: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.string,
	]).isRequired,
	textPrev: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.string,
	]).isRequired,
	textNext: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.string,
	]).isRequired,
	textDone: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.string,
	]).isRequired,
};

export default SteppedNavigation;
