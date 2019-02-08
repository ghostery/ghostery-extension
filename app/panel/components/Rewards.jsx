/**
 * Rewards Component
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

import React from 'react';
import ClassNames from 'classnames';
import { Link, Route } from 'react-router-dom';
import { ToggleSlider, RewardListItem, RewardDetail } from './BuildingBlocks';
import { sendMessage, sendRewardMessage } from '../utils/msg';
import globals from '../../../src/classes/Globals';

const IS_CLIQZ = (globals.BROWSER_INFO.name === 'cliqz');

/**
 * @class The Rewards Panel shows offers generated by Ghostery Rewards.
 * The panel is opened from a button in the Detailed View's footer.
 * See DetailMenu.jsx.
 * @memberof PanelClasses
 */
class Rewards extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			rewardsArray: null,
		};

		// event bindings
		this.toggleOffers = this.toggleOffers.bind(this);

		// helper render functions
		this.renderRewardListComponent = this.renderRewardListComponent.bind(this);
		this.renderRewardDetailComponent = this.renderRewardDetailComponent.bind(this);
		this.handleBackClick = this.handleBackClick.bind(this);
		this.handleFaqClick = this.handleFaqClick.bind(this);
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.props.actions.getRewardsData();
		this.props.actions.sendSignal('hub_open');
		chrome.runtime.connect({ name: 'rewardsPanelPort' });
	}

	/**
	 * Lifecycle event
	 */
	componentWillReceiveProps(nextProps) {
		const dateNow = new Date();
		let rewardsArray = null;
		if (nextProps.rewards) {
			rewardsArray = Object.keys(nextProps.rewards).map((key) => {
				const reward = nextProps.rewards[key].offer_data;
				return {
					id: reward.offer_id,
					unread: nextProps.unread_offer_ids.indexOf(reward.offer_id) !== -1,
					code: reward.ui_info.template_data.code,
					text: reward.ui_info.template_data.title,
					description: reward.ui_info.template_data.desc,
					benefit: reward.ui_info.template_data.benefit,
					conditions: reward.ui_info.template_data.conditions,
					logo_url: reward.ui_info.template_data.logo_url,
					picture_url: reward.ui_info.template_data.picture_url,
					redeem_url: reward.ui_info.template_data.call_to_action.url,
					redeem_text: reward.ui_info.template_data.call_to_action.text,
					expires: Math.round((new Date()).setDate(dateNow.getDate() + reward.expirationMs / 1000 / 60 / 60 / 24)),
				};
			});
		}
		this.setState({ rewardsArray });
	}

	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		/* @TODO send message to background to remove port onDisconnect event */
		this.props.actions.sendSignal('hub_closed');
		sendRewardMessage('removeDisconnectListener');
	}

	/**
	 * Handles clicking the back button
	 */
	handleBackClick(offerId) {
		this.props.actions.sendSignal('offer_return_hub', offerId);
	}

	/**
	 * Handles clicking the learn more button
	 */
	handleFaqClick() {
		sendMessage('openNewTab', {
			url: 'https:\/\/www.ghostery.com/faqs/what-new-ghostery-features-can-we-expect-in-the-future/',
			become_active: true,
		});
		sendMessage('ping', 'rewards_learn');
	}

	/**
	 * Handles toggling rewards on/off
	 */
	toggleOffers() {
		const { enable_offers } = this.props;
		this.props.actions.showNotification({
			text: !enable_offers ? t('rewards_on_toast_notification') : t('rewards_off_toast_notification'),
			classes: 'purple',
		});
		this.props.actions.toggleOffersEnabled(!enable_offers);
		const signal = {
			actionId: enable_offers ? 'rewards_off' : 'rewards_on',
			origin: 'rewards-hub',
			type: 'action-signal',
		};
		sendMessage('setPanelData', { enable_offers: !enable_offers, signal }, undefined, 'rewardsPanel');
		sendMessage('ping', enable_offers ? 'rewards_on' : 'rewards_off');
		// TODO catch
	}

	/**
	 * Helper render function for the Rewards Header
	 * @return {JSX} JSX for the Rewards Header
	 */
	renderRewardsHeader = (routeProps) => {
		let reward;
		const { id } = routeProps.match.params;
		if (id && this.state.rewardsArray) {
			reward = this.state.rewardsArray.find(el => el.id === id);
		}
		const { enable_offers, location } = this.props;
		const showBack = location.pathname.indexOf('/detail/rewards/detail') !== -1;
		const showToggle = location.pathname === '/detail/rewards/list';
		const headerClassNames = ClassNames('RewardsPanel__header', 'flex-container', 'align-middle', {
			'align-justify': !showBack,
		});
		const headerTitleClassNames = ClassNames('RewardsPanel__title', {
			'RewardsPanel--left-padding': showBack,
		});

		return (
			<div className={headerClassNames}>
				{showBack && (
					<Link to="/detail/rewards/list" className="RewardPanel__back flex-container clickable" onClick={() => { this.handleBackClick(id); }}>
						<svg height="16" width="10" fillRule="evenodd">
							<path d="M10 1.833L8.108 0 0 7.857l8.108 7.857L10 13.881 3.784 7.857z" />
						</svg>
					</Link>
				)}
				<span className={headerTitleClassNames}>{ t('panel_detail_rewards_title') }</span>
				{showToggle && !IS_CLIQZ && (
					<span className="flex-container align-middle">
						<span className="RewardsPanel__slider_text">
							{enable_offers ? t('rewards_on') : t('rewards_off')}
						</span>
						<ToggleSlider
							className="display-inline-block"
							isChecked={enable_offers}
							onChange={this.toggleOffers}
						/>
					</span>
				)}
				{!showToggle && reward &&
					<img className="RewardDetail__logo" src={reward.logo_url} />
				}
			</div>
		);
	}

	/**
	 * Helper render function for Reward Icon SVG
	 * @return {JSX} JSX for the Rewards Icon SVG
	 */
	renderRewardSvg() {
		return (
			<svg className="RewardsPanel__reward_icon" viewBox="0 0 18 23" width="50" height="50">
				<g strokeWidth=".5" fillRule="evenodd">
					<path d="M7.633 9.847h2.756v-3.34H7.633v3.34zm2.502-4.64c.012.036.026.07.04.106 1.12-.076 2.258-.053 3.356-.255 1.298-.238 1.79-1.608 1.09-2.72-.606-.96-2.15-1.157-2.77-.292-.53.739-.947 1.559-1.394 2.356-.14.25-.217.536-.322.805zm-2.213.083c-.169-.558-1.107-2.375-1.487-2.898a3.492 3.492 0 0 0-.144-.191 1.795 1.795 0 0 0-3.086.445c-.4.966.168 2.197 1.11 2.402 1.182.257 2.386.166 3.607.242zm3.588 4.54h4.821V6.503h-4.82V9.83zm-9.806.02h4.833V6.5H1.704v3.35zm5.92 10.028h2.755v-8.92H7.624v8.92zm3.895.046h4.007v-8.972h-4.007v8.972zm-9.01-.046h4.024v-8.93H2.508v8.93zm-1.082-8.867c-.711-.188-.856-.092-.848-1.108.009-1.245.002-2.49.003-3.737 0-.584.157-.74.744-.74.41 0 .82.001 1.228-.001.085 0 .168-.01.228-.014-.208-.365-.456-.697-.596-1.069A2.87 2.87 0 0 1 3.534.807c1.308-.68 2.851-.296 3.705.938.648.94 1.146 1.961 1.598 3.007.045.103.096.205.17.364.106-.223.192-.392.267-.565.411-.935.843-1.86 1.433-2.702.513-.73 1.166-1.229 2.08-1.347 1.485-.192 2.915.87 3.161 2.353.144.868-.074 1.636-.577 2.34l-.161.221c.087.013.149.03.212.03.472-.002.944-.005 1.415-.012.353-.007.58.193.58.545a745.66 745.66 0 0 1 0 4.405c0 .297-.184.491-.487.534-.104.016-.21.018-.344.03v9.161c0 .106.003.214-.005.32-.028.364-.16.506-.519.56-.114.017-.231.017-.347.017l-13.427.001c-.072 0-.144.001-.214-.002-.489-.029-.647-.192-.647-.686v-9.308z" />
				</g>
			</svg>
		);
	}

	/**
	 * Helper render function for the list of Rewards Items
	 * @return {JSX} JSX for the Rewards Items List
	 */
	renderRewardListComponent() {
		const { actions, enable_offers, is_expanded } = this.props;
		const { rewardsArray } = this.state;

		if (IS_CLIQZ) {
			return (
				<div className="RewardsPanel__info">
					{ this.renderRewardSvg() }
					<div>{ t('panel_detail_rewards_cliqz_text') }</div>
					<hr />
					<div className="RewardsPanel__learn_more button primary hollow" onClick={this.handleFaqClick}>
						{ t('panel_detail_learn_more') }
					</div>
				</div>
			);
		} else if (enable_offers && !rewardsArray) {
			return (
				<div className="RewardsPanel__info">
					{ this.renderRewardSvg() }
					<div>{ t('panel_detail_rewards_loading') }</div>
				</div>
			);
		} else if (enable_offers && rewardsArray.length === 0) {
			return (
				<div className="RewardsPanel__info">
					{ this.renderRewardSvg() }
					<div>{ t('panel_detail_rewards_none_found') }</div>
				</div>
			);
		} else if (!enable_offers && (!rewardsArray || rewardsArray.length === 0)) {
			return (
				<div className="RewardsPanel__info">
					{ this.renderRewardSvg() }
					<div>{ t('panel_detail_rewards_off') }</div>
				</div>
			);
		}

		const rewardsList = rewardsArray.map((reward, index) => (
			<RewardListItem
				disabled={!enable_offers}
				index={index}
				id={reward.id}
				key={reward.id}
				isLong={is_expanded}
				unread={reward.unread}
				text={reward.text}
				benefit={reward.benefit}
				logoUrl={reward.logo_url}
				expires={reward.expires}
				actions={actions}
			/>
		));
		return <div className="RewardsPanel__scroll_content">{ rewardsList }</div>;
	}

	/**
	 * Helper render function for an individual Reward Item
	 * @return {JSX} JSX for the Rewards Detail Item
	 */
	renderRewardDetailComponent(routeProps) {
		const { id } = routeProps.match.params;
		const reward = this.state.rewardsArray.find(el => el.id === id);
		return (
			<RewardDetail
				id={reward.id}
				code={reward.code}
				text={reward.text}
				description={reward.description}
				benefit={reward.benefit}
				conditions={reward.conditions}
				logoUrl={reward.logo_url}
				pictureUrl={reward.picture_url}
				redeemUrl={reward.redeem_url}
				expires={reward.expires}
				redeemText={reward.redeem_text}
				actions={this.props.actions}
			/>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Rewards portion of the Detailed View
	 */
	render() {
		return (
			<div className="RewardsPanel">
				<Route path="/detail/rewards/(list|detail)/:id?" render={this.renderRewardsHeader} />
				<Route path="/detail/rewards/list" render={this.renderRewardListComponent} />
				<Route path="/detail/rewards/detail/:id" render={this.renderRewardDetailComponent} />
			</div>
		);
	}
}

export default Rewards;
