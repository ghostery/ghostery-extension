/**
 * Premium Promo Modal Component
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
import ClassNames from 'classnames';
import Modal from '../Modal/Modal';
import ModalExitButton from '../../panel/components/BuildingBlocks/ModalExitButton';

/**
 * A functional React component for a Premium Promo Modal that may be displayed in the Hub and/or Panel
 * @return {JSX} JSX for rendering a Premium Promo Modal
 * @memberof SharedComponents
 */
const PremiumPromoModal = (props) => {
	const {
		show,
		location,
		isPlus,
		handleTryMidnightClick,
		handleGetPlusClick,
		handleKeepBasicClick,
		handleGoAwayClick,
		handleXClick,
	} = props;

	const isInHub = location === 'hub';
	const isInPanel = location === 'panel';

	const contentClassNames = ClassNames(
		'PremiumPromoModal__content',
		'flex-container',
		'flex-dir-column',
		'align-middle',
	);

	return (
		<Modal show={show}>
			<div className={contentClassNames}>
				{isInPanel && (
					<ModalExitButton className="InsightsModal__exitButton" toggleModal={handleXClick} />
				)}
				<div className="PremiumPromoModal__midnight-logo" />
				<div className="PremiumPromoModal__main-content-container">
					<div className="PremiumPromoModal__header">
						<div className="PremiumPromoModal__header-text">
							<span>{t('try_ghostery_midnight')}</span>
							<div className="PremiumPromoModal__header-beta-icon" />
						</div>
					</div>
					<div className="PremiumPromoModal__sub-header" dangerouslySetInnerHTML={{ __html: `${t('full_coverage_protection_promise')}. ${t('seven_day_free_trial')}` }} />
					<div className="PremiumPromoModal__features-container">
						<div className="PremiumPromoModal__feature-column">
							<div className="PremiumPromoModal__feature">
								<span className="PremiumPromoModal__checked-circle-icon" />
								<div className="PremiumPromoModal__feature-text">
									{t('system_wide_tracker_and_ad_blocking')}
								</div>
							</div>
							<div className="PremiumPromoModal__feature">
								<span className="PremiumPromoModal__checked-circle-icon" />
								<div className="PremiumPromoModal__feature-text">
									{t('built_in_vpn')}
								</div>
							</div>
						</div>
						<div className="PremiumPromoModal__feature-column">
							<div className="PremiumPromoModal__feature">
								<span className="PremiumPromoModal__checked-circle-icon" />
								<div className="PremiumPromoModal__feature-text">
									{t('custom_whitelist_options')}
								</div>
							</div>
							<div className="PremiumPromoModal__feature">
								<span className="PremiumPromoModal__checked-circle-icon" />
								<div className="PremiumPromoModal__feature-text">
									{t('historical_tracking_insights')}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="PremiumPromoModal__buttons-background">
					<div className="PremiumPromoModal__button-container">
						<div className="PremiumPromoModal__download-button" onClick={handleTryMidnightClick}>
							<span>{t('download_for_free')}</span>
						</div>
					</div>
					<div className="PremiumPromoModal__text-link-container">
						{!isPlus && (
							<div onClick={handleGetPlusClick} className="PremiumPromoModal__text-link" dangerouslySetInnerHTML={{ __html: t('support_ghostery_for_2_instead') }} />
						)}
						{isInHub && (
							<div onClick={handleKeepBasicClick} className="PremiumPromoModal__text-link">
								{t('no_thanks_continue_with_basic')}
							</div>
						)}
						{isInPanel && (
							<div onClick={handleGoAwayClick} className="PremiumPromoModal__text-link">
								{t('no_thanks_turn_promos_off')}
							</div>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
};


// PropTypes ensure we pass required props of the correct type
PremiumPromoModal.propTypes = {
	show: PropTypes.bool.isRequired,
	location: PropTypes.string.isRequired,
	isPlus: PropTypes.bool.isRequired,
	handleTryMidnightClick: PropTypes.func.isRequired,
	handleGetPlusClick: PropTypes.func.isRequired,
	handleKeepBasicClick: PropTypes.func,
	handleGoAwayClick: PropTypes.func,
	handleXClick: PropTypes.func,
};

const noop = () => {};
PremiumPromoModal.defaultProps = {
	handleKeepBasicClick: noop,
	handleGoAwayClick: noop,
	handleXClick: noop,
};

export default PremiumPromoModal;
