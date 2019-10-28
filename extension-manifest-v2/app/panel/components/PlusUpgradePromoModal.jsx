/**
 * Plus Upgrade Promo Modal Component
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
import globals from '../../../src/classes/Globals';
import Modal from '../../shared-components/Modal';
import ModalExitButton from './BuildingBlocks/ModalExitButton';
import PanelToTabLink from './BuildingBlocks/PanelToTabLink';

const PLUS_UPGRADE = 'plus_upgrade';
const DOMAIN = globals.DEBUG ? 'ghosterystage' : 'ghostery';

/**
 * @class Implements the Upgrade variant of the Plus Promo Modal
 * @memberof PanelClasses
 */
class PlusUpgradePromoModal extends React.Component {
	handleNoThanksClick = () => { this.props.handleNoThanksClick(PLUS_UPGRADE); }

	handleSubscribeClick = () => { this.props.handleSubscribeClick(PLUS_UPGRADE); }

	handleXClick = () => { this.props.handleXClick(PLUS_UPGRADE); }

	render() {
		const { loggedIn } = this.props;

		const contentClassNames = ClassNames(
			'PlusPromoModal__content',
			'flex-container',
			'flex-dir-column',
			'align-middle',
			'panel',
			'upgrade'
		);

		// TODO update ModalExitButton class here
		// TODO pass down handler for click on ModalExitButton
		return (
			<Modal show>
				<div className={contentClassNames}>
					<ModalExitButton className="InsightsModal__exitButton" toggleModal={this.handleXClick} />
					<div className="PlusPromoModal__buttons-background upgrade" />
					<img className="PlusPromoModal__gold-ghostie-badge" src="/app/images/hub/home/gold-ghostie-badge.svg" />
					<div className="PlusPromoModal__header">
						{t('upgrade_your_ghostery_experience')}
					</div>
					<div className="PlusPromoModal__description cta">
						{t('upgrade_cta_TEXT')}
					</div>
					<div className="PlusPromoModal__button-container">
						<PanelToTabLink onClick={this.handleSubscribeClick} className="PlusPromoModal__button upgrade" href={`http://checkout.${DOMAIN}.com/plus/`}>
							<span className="button-text">{t('upgrade_to_plus')}</span>
						</PanelToTabLink>
					</div>
					<div className="PlusPromoModal__text-link-container">
						{
							!loggedIn &&
							(
								<div onClick={this.props.handleSignInClick} className="PlusPromoModal__text-link">
									{t('already_subscribed_sign_in')}
								</div>
							)
						}
						<div onClick={this.handleNoThanksClick} className="PlusPromoModal__text-link">
							{t('no_thanks_turn_promos_off')}
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}

export default PlusUpgradePromoModal;
