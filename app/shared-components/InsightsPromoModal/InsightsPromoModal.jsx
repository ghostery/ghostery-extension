/**
 * Insights Promo Modal Component
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
import Modal from '../Modal/Modal';
import history from '../../panel/utils/history';
import ModalExitButton from '../ModalExitButton/ModalExitButton';

// A Functional React component for a Modal
const InsightsPromoModal = ({ toggleModal }) => {
	const clickSignIn = () => {
		history.push({
			pathname: '/login',
			state: { showInsightsPromoModal: true }
		});
		toggleModal();
	};
	return (
		<div className="InsightsModal__content flex-container flex-dir-column align-middle">
			<ModalExitButton exitModal={toggleModal} className="InsightsModal__exitButton" hrefExit="Test" textExit="" />
			<div className="InsightsModal__image" />
			<div className="InsightsModal__header">
				Try Ghostery Insights
			</div>
			<div className="InsightsModal__description">
				Speed up and clean up digital user experience with our professional tag analytics tool.
			</div>
			<div className="flex-container">
				<div className="flex-container flex-dir-column InsightsModal__feature-column-1">
					<div className="flex-container align-middle">
						<span className="InsightsModal__checkedCircleIcon" />
						<div className="InsightsModal__featureText">
							Audit marketing tags on a page
						</div>
					</div>
					<div className="flex-container align-middle">
						<span className="InsightsModal__checkedCircleIcon" />
						<span className="InsightsModal__featureText">
							Trace sources of poor performance
						</span>
					</div>
				</div>
				<div className="InsightsModal__feature-column-2 flex-container flex-dir-column">
					<div className="flex-container align-middle">
						<span className="InsightsModal__checkedCircleIcon" />
						<span className="InsightsModal__featureText">
							Watch pings fire in real-time
						</span>
					</div>
					<div className="flex-container align-middle">
						<span className="InsightsModal__checkedCircleIcon" />
						<span className="InsightsModal__featureText">
							Explore global digital trends
						</span>
					</div>
				</div>
			</div>
			<div className="InsightsModal__callToActionContainer flex-container flex-dir-column">
				<a href="https://www.ghostery.com/insights/" target="_blank" rel="noopener noreferrer" className="btn InsightsModal__callToAction align-self-middle">
					<span className="InsightsModal__callToActionText flex-container align-center">Try for free</span>
				</a>
				<div className="InsightsModal__otherOptionsContainer flex-container align-justify">
					<span onClick={clickSignIn} className="InsightsModal__link">Already a subscriber? Sign in</span>
					{/* <span onClick={this.toggleModal} className="InsightsModal__link">No thanks, maybe later</span> */}
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
Modal.propTypes = {
	show: PropTypes.bool.isRequired,
	toggleModal: PropTypes.func.isRequired
};

export default InsightsPromoModal;
