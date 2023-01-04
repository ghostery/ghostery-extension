/* eslint-disable class-methods-use-this */
/**
 * Header Menu Component
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

import ClickOutside from './BuildingBlocks/ClickOutside';
import { sendMessage, sendMessageInPromise } from '../utils/msg';
import globals from '../../../src/classes/Globals';
import { log } from '../../../src/utils/common';
/**
 * @class Implement drop-down menu invoked from kebab
 * menu icon on the panel header.
 * @memberof PanelClasses
 */
class HeaderMenu extends React.Component {
	/**
	 * Handle clicks outside of the drop-down menu and trigger action.
	 * @param  {Object} e mouseclick event
	 */
	handleClickOutside = (e) => {
		const { toggleDropdown } = this.props;
		if (!this.node.contains(e.target)) {
			toggleDropdown();
		}
	};

	/**
	 * Trigger action which open Settings panel from drop-down menu Settings item.
	 */
	clickSettings = () => {
		const { history, toggleDropdown } = this.props;
		toggleDropdown();
		history.push('/settings/globalblocking');
	};

	/**
	 * Handle click on 'Report a broken page' menu item.
	 * Currently invokes default 'mailto' handler, and often does not work.
	 * @todo  Should send broken page data to a 'Report a broken page' site.
	 */
	clickBrokenPage = () => {
		sendMessageInPromise('getSiteData').then((data) => {
			let body = `${'PLEASE INCLUDE A DESCRIPTION AND A PICTURE OF THE ISSUE YOU ARE EXPERIENCING:\r\n\r\n\r\n\r\n\r\n\r\n' +
					'URL: '}${data.url}\r\n` +
					`Ghostery version: ${data.extensionVersion}\r\n` +
					`Database Version: ${data.dbVersion}\r\n` +
					`Browser name: ${data.browserDisplayName}\r\n` +
					`Browser version: ${data.browserVersion}\r\n` +
					`Language: ${data.language}\r\n` +
					`OS: ${data.os}\r\n`;

			data.categories.forEach((category) => {
				const trackersAllowed = [];
				const trackersBlocked = [];

				category.trackers.forEach((tracker) => {
					if (tracker.blocked) {
						trackersBlocked.push(tracker.name);
					} else {
						trackersAllowed.push(tracker.name);
					}
				});

				body += `\r\nCategory: ${category.name}\r\n` +
						`Allowed Trackers: ${trackersAllowed}\r\n` +
						`Blocked Trackers: ${trackersBlocked}\r\n`;
			});

			const url = `mailto:support@ghostery.com?body=${encodeURIComponent(body)}&subject=Broken Page Report`;
			sendMessage('openNewTab', {
				url,
				become_active: true,
			});
			window.close();
		}).catch(() => {
			log('Error gathering page data');
		});
	};

	/**
	 * Handle click on 'Submit a new tracker' menu item.
	 * It should navigate to a site where tracker data can be entered.
	 */
	clickSubmitTracker = () => {
		sendMessage('openNewTab', {
			url: 'https://www.ghostery.com/submit-a-tracker',
			become_active: true,
		});
		window.close();
	};

	/**
	 * Handle click on 'Help' menu item.
	 * It should open Help view.
	 */
	clickHelp = () => {
		const { history, toggleDropdown } = this.props;
		toggleDropdown();
		history.push('/help');
	};

	/**
	 * Handle click on 'About' menu item.
	 * It should open About view.
	 */
	clickAbout = () => {
		const { history, toggleDropdown } = this.props;
		toggleDropdown();
		history.push('/about');
	};

	/**
	 * Handle click on the user name, displayed on the menu when a
	 * user is in logged in state, and navigate to the user's profile page.
	 */
	clickSignedInAs = () => {
		sendMessage('openNewTab', {
			url: `${globals.ACCOUNT_BASE_URL}/`,
			become_active: true,
		});
		window.close();
	};

	/**
	 * Handle click on 'Sign in' menu item and navigate to Login panel.
	 */
	clickSignIn = () => {
		const { history, toggleDropdown } = this.props;
		toggleDropdown();
		history.push('/login');
	};

	/**
	 * Handle click on 'Sign out' menu item (if user is in logged in state) and log out the user.
	 */
	clickSignOut = () => {
		const { actions, toggleDropdown } = this.props;
		toggleDropdown();
		actions.logout();
	};

	/**
	 * Handle click on Subscriber menu item.
	 */
	clickSubscriber = () => {
		const { history, toggleDropdown } = this.props;
		sendMessage('ping', 'plus_panel_from_menu');
		toggleDropdown();
		history.push('/subscription');
	};

	/**
	 * Render drop-down menu.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const {
			loggedIn,
			email,
			hasPremiumAccess,
			hasPlusAccess,
			kebab
		} = this.props;
		return (
			<ClickOutside onClickOutside={this.handleClickOutside} excludeEl={kebab}>
				<div ref={(node) => { this.node = node; }} className="dropdown-pane" id="header-dropdown">
					<ul className="vertical menu no-bullet icons icon-left">
						<li className="menu-option menu-settings" onClick={this.clickSettings}>
							<div>
								<div className="menu-icon-container">
									<svg width="18px" height="18px" viewBox="0 0 18 18">
										<g>
											<path className="menu-icon" d="M17.9063611,7.4473434 C17.8436479,7.36521204 17.7618042,7.31630721 17.6602547,7.30077273 L15.5157778,6.97267882 C15.39855,6.5976938 15.2383148,6.21494155 15.0352159,5.82427821 C15.1757453,5.62894655 15.3866115,5.35364109 15.6678143,4.99807417 C15.9490171,4.64250725 16.1482323,4.38288011 16.2654601,4.21876124 C16.3280295,4.13274626 16.3590985,4.04299151 16.3590985,3.94920929 C16.3590985,3.8398926 16.3319132,3.75402146 16.277111,3.69145204 C15.9959082,3.29287763 15.3513712,2.62892258 14.3435001,1.69915535 C14.2500056,1.62105145 14.1521959,1.58207142 14.0507903,1.58207142 C13.9335626,1.58207142 13.8397803,1.61716783 13.7694437,1.68736066 L12.1055286,2.94133817 C11.7850581,2.7772193 11.4335187,2.63266236 11.0507664,2.50766735 L10.7226725,0.351539463 C10.7149053,0.249990011 10.6698841,0.165988765 10.5878966,0.0995357237 C10.5057652,0.0330826827 10.4102569,-1.77635684e-15 10.3006526,-1.77635684e-15 L7.69920309,-1.77635684e-15 C7.47265863,-1.77635684e-15 7.33198532,0.109316691 7.27732697,0.32809391 C7.17577752,0.718613404 7.06243338,1.44513788 6.93743838,2.50766735 C6.57022061,2.62503896 6.21479754,2.77347952 5.87102532,2.95313287 L4.25385753,1.69915535 C4.15230808,1.62105145 4.05075863,1.58207142 3.94920918,1.58207142 C3.77732308,1.58207142 3.40823542,1.8612605 2.84180237,2.41992632 C2.27536932,2.97859215 1.89074718,3.39845454 1.68750445,3.67965735 C1.61716779,3.7812068 1.58207138,3.87110539 1.58207138,3.94920929 C1.58207138,4.04299151 1.62105141,4.13677372 1.69915531,4.2304121 C2.22258087,4.8632982 2.64057336,5.40225825 2.95313278,5.84772377 C2.75780112,6.20703047 2.60547695,6.56648101 2.49616026,6.92578771 L0.316443043,7.25388162 C0.230571909,7.26955994 0.156351631,7.32033466 0.0937822111,7.40634964 C0.0312127911,7.49222077 1.77635684e-15,7.58211937 1.77635684e-15,7.67575775 L1.77635684e-15,10.2773511 C1.77635684e-15,10.3790444 0.0312127911,10.4706691 0.0937822111,10.5526566 C0.156351631,10.634788 0.238339147,10.6838366 0.339888596,10.6993711 L2.4845094,11.0158142 C2.59382609,11.3985664 2.7539175,11.7852023 2.96492748,12.1757218 C2.824398,12.3710535 2.61338803,12.6463589 2.33218523,13.0019258 C2.05098244,13.3574927 1.85162332,13.6171199 1.73453939,13.7812388 C1.67196997,13.8673976 1.64075718,13.9570085 1.64075718,14.0507907 C1.64075718,14.1523402 1.66808635,14.2420949 1.7227447,14.3201988 C2.02739304,14.7422188 2.67192999,15.3985504 3.65635553,16.28905 C3.7423705,16.3750649 3.84003633,16.4179286 3.94935302,16.4179286 C4.06658078,16.4179286 4.16424661,16.3828322 4.24235051,16.3126393 L5.89475855,15.058518 C6.21522905,15.2226369 6.5667685,15.3671938 6.94952075,15.4923326 L7.27761465,17.6484605 C7.28552573,17.75001 7.3304031,17.8340112 7.41239062,17.9004643 C7.49437813,17.9670612 7.59017407,18 7.69949076,18 L10.3010841,18 C10.5279162,18 10.6684457,17.8906833 10.7232479,17.6719061 C10.8246535,17.2812428 10.9378538,16.5548621 11.0628488,15.4923326 C11.4300666,15.3751049 11.7856335,15.2265205 12.1292619,15.0468671 L13.7465735,16.3126393 C13.8558902,16.3828322 13.9575835,16.4179286 14.0512218,16.4179286 C14.2229641,16.4179286 14.5901819,16.1407532 15.1525875,15.585971 C15.7152807,15.0313327 16.1019166,14.6093127 16.3126389,14.3201988 C16.3829756,14.2420949 16.4182158,14.1523402 16.4182158,14.0507907 C16.4182158,13.9492413 16.3792358,13.8512877 16.300988,13.7577932 C15.7385824,13.0702488 15.32059,12.5312887 15.0470106,12.1406254 C15.2032183,11.8515115 15.3556864,11.4960884 15.5041269,11.0742123 L17.6720494,10.7462622 C17.7656878,10.7305839 17.8440794,10.6796653 17.906505,10.5936504 C17.9689305,10.5076354 17.9999995,10.4177368 17.9999995,10.3240984 L17.9999995,7.72264885 C18.0001433,7.6210994 17.9690744,7.52947475 17.9063611,7.4473434 L17.9063611,7.4473434 Z M11.1213908,11.1211034 C10.5355396,11.7070984 9.82843326,12.0000959 9.00021551,12.0000959 C8.17199776,12.0000959 7.46503523,11.7070984 6.87904025,11.1211034 C6.29318911,10.5352522 6.00019162,9.82828969 6.00019162,9.00007192 C6.00019162,8.17185415 6.29304527,7.4648916 6.87904025,6.8788966 C7.46503523,6.29304544 8.1721416,6.00004795 9.00021551,6.00004795 C9.82843326,6.00004795 10.5355396,6.29304544 11.1213908,6.8788966 C11.7072419,7.4648916 12.0002394,8.17185415 12.0002394,9.00007192 C12.0002394,9.82828969 11.7072419,10.5352522 11.1213908,11.1211034 L11.1213908,11.1211034 Z" />
										</g>
									</svg>
								</div>
								<span>{ t('panel_menu_settings') }</span>
							</div>
						</li>
						<li onClick={this.clickBrokenPage} className="menu-option menu-broken-page">
							<div className="menu-icon-container">
								<svg width="19px" height="18px" viewBox="0 0 19 18">
									<g>
										<path className="menu-icon" d="M17.6593575,9.31215301 C18.9509219,8.56554918 19.3820842,6.92109579 18.6312577,5.63083237 L16.138206,1.34260393 C15.3882033,0.0526155015 13.7448434,-0.382422166 12.455476,0.366381607 L8.42616837,2.71014017 L7.90163337,3.89178167 L9.636169,4.80255585 L13.8994577,2.30947652 L16.6594455,7.08224123 L12.7515224,9.37017637 C12.7515224,9.37017637 11.7560044,9.87286212 11.3761971,10.2347519 C10.9963899,10.5969166 10.4729534,11.5398649 10.4729534,11.5398649 L8.113919,15.6820724 L3.34119975,12.9310504 L5.98886568,8.26058282 L4.08790691,8.34748036 L3.92065988,7.03686751 L1.36087416,11.5024659 C0.615265506,12.7957543 1.0626307,14.4349828 2.35639215,15.1760868 L6.6581284,17.6413919 C7.95188986,18.3835959 9.5922289,17.9367335 10.334542,16.6423452 L12.5433562,12.7850296 C12.5433562,12.7850296 12.8704353,12.2177206 13.1129298,11.993327 C13.3543257,11.7686584 13.9390038,11.4744167 13.9390038,11.4744167 L17.6593575,9.31215301 Z" />
										<polygon className="menu-icon" points="4.80242321 2 4 2.28676089 5.13611903 4.2454109 4.80242321 2.00100883" />
										<polygon className="menu-icon" points="0.729020149 2 0 3.64717271 3.61403597 4.34957295 0.729020149 2.00100883" />
									</g>
								</svg>
							</div>
							<span>{ t('panel_menu_report_broken_site') }</span>
						</li>
						<li onClick={this.clickSubmitTracker} className="menu-option menu-submit-tracker">
							<div className="menu-icon-container">
								<svg width="16px" height="17px" viewBox="0 0 16 17">
									<g>
										<path className="menu-icon" d="M8.658 4.996a.943.943 0 0 0-1.316 0L3.04 9.298a.934.934 0 0 0 0 1.333.934.934 0 0 0 1.333 0L7.076 7.93v8.124c0 .516.426.943.942.943a.948.948 0 0 0 .942-.943V7.93l2.702 2.702a.934.934 0 0 0 1.334 0 .934.934 0 0 0 0-1.333L8.658 4.996z M1.049 5.742A.948.948 0 0 0 1.99 4.8V1.956h12.036V4.8c0 .516.426.942.942.942a.948.948 0 0 0 .942-.942V1.031a.948.948 0 0 0-.94-.941H1.049a.948.948 0 0 0-.942.942v3.787c0 .515.409.924.942.924z" />
									</g>
								</svg>
							</div>
							<span>{ t('panel_menu_submit_tracker') }</span>
						</li>
						<li className="menu-option menu-help" onClick={this.clickHelp}>
							<div>
								<div className="menu-icon-container">
									<svg width="18px" height="18px" viewBox="0 0 18 18">
										<g>
											<path className="menu-icon" d="M16.7932109,4.48238002 C15.9884451,3.10356235 14.8967253,2.01184255 13.5179077,1.20707676 C12.1388023,0.402310975 10.6332646,0 9.00028767,0 C7.36745457,0 5.86148535,0.402310975 4.48266769,1.20707676 C3.10370619,2.01169871 2.01198638,3.10341852 1.2072206,4.48238002 C0.402310975,5.86134152 0,7.36731074 0,9 C0,10.6328331 0.402454811,12.1385146 1.20707676,13.51762 C2.01184255,14.8962938 3.10356235,15.9881575 4.48252385,16.7929232 C5.86148535,17.597689 7.36731074,18 9.00014384,18 C10.6329769,18 12.1389462,17.597689 13.5177638,16.7929232 C14.8965815,15.9883013 15.9883013,14.8964376 16.7930671,13.51762 C17.597689,12.1386585 18,10.6326893 18,9 C18,7.3671669 17.597689,5.86119768 16.7932109,4.48238002 L16.7932109,4.48238002 Z M10.5003596,14.625018 C10.5003596,14.7343338 10.4649758,14.8242317 10.3947835,14.8944239 C10.3247351,14.9646162 10.2348372,14.9997123 10.1255214,14.9997123 L7.87534161,14.9997123 C7.76602579,14.9997123 7.67612792,14.9646162 7.60579182,14.8944239 C7.53545572,14.8242317 7.50035959,14.7343338 7.50035959,14.625018 L7.50035959,12.3748382 C7.50035959,12.2655224 7.53545572,12.1756245 7.60579182,12.1052884 C7.67612792,12.03524 7.76602579,12.0001438 7.87534161,12.0001438 L10.1255214,12.0001438 C10.2348372,12.0001438 10.3247351,12.03524 10.3947835,12.1052884 C10.4649758,12.1756245 10.5003596,12.2655224 10.5003596,12.3748382 L10.5003596,14.625018 L10.5003596,14.625018 Z M13.3537901,7.69914177 C13.256125,7.98825334 13.1468092,8.22472072 13.0256988,8.40825622 C12.9045884,8.59179172 12.7306899,8.77935465 12.5040035,8.97065733 C12.2777485,9.16210385 12.0979527,9.29889246 11.9649039,9.38102316 C11.8322865,9.46286618 11.6406962,9.57433955 11.390852,9.71486791 C11.1330968,9.86330728 10.9203625,10.0566237 10.7525052,10.2949609 C10.584504,10.5331543 10.5005034,10.7266146 10.5005034,10.8749101 C10.5005034,10.9843698 10.4651196,11.0742676 10.3949274,11.1444599 C10.3248789,11.214796 10.2349811,11.2498921 10.1256652,11.2498921 L7.87548545,11.2498921 C7.76616963,11.2498921 7.67627176,11.214796 7.60593566,11.1444599 C7.53559956,11.0742676 7.50050343,10.9843698 7.50050343,10.8749101 L7.50050343,10.4528935 C7.50050343,9.92947212 7.70547059,9.43913314 8.11569257,8.98216426 C8.52591456,8.52505154 8.97712998,8.18717936 9.46933883,7.96840389 C9.84417701,7.79666299 10.1098432,7.62075083 10.2660498,7.44109891 C10.422544,7.261447 10.5006473,7.02296591 10.5006473,6.726231 C10.5006473,6.46833197 10.3539339,6.23790574 10.0609388,6.03466462 C9.76794362,5.83156734 9.4342427,5.7300187 9.05911684,5.7300187 C8.65277844,5.7300187 8.31691998,5.82380016 8.05125378,6.01136309 C7.79335475,6.19878218 7.45749628,6.55822985 7.04339071,7.08941842 C6.97305461,7.18319988 6.87538956,7.23023445 6.75039555,7.23023445 C6.65661409,7.23023445 6.5823944,7.20678909 6.52773649,7.16004219 L4.98091768,5.9882054 C4.80126576,5.8475332 4.77005322,5.68355948 4.88713621,5.49599655 C5.8872321,3.8319509 7.33638587,2.99985616 9.23474133,2.99985616 C9.91465695,2.99985616 10.5787505,3.16009014 11.2271659,3.48041425 C11.8755813,3.80059452 12.4165508,4.25382366 12.850362,4.83981397 C13.2835978,5.42566045 13.5006473,6.06242509 13.5006473,6.74996404 C13.5002158,7.09373352 13.4511675,7.41003021 13.3537901,7.69914177 L13.3537901,7.69914177 Z" />
										</g>
									</svg>
								</div>
								<span>{ t('panel_menu_help') }</span>
							</div>
						</li>
						<li className="menu-option menu-about" onClick={this.clickAbout}>
							<div>
								<div className="menu-icon-container">
									<svg width="17" height="21" viewBox="0 0 17 21">
										<g className="about-icon" fill="none" fillRule="evenodd">
											<path d="M8.5 2l7.36 4.25v8.5L8.5 19l-7.36-4.25v-8.5z" />
											<path className="text" d="M9.057 14H7.752V8.188h1.305V14zM7.671 6.68c0-.201.064-.368.191-.5.127-.133.309-.199.545-.199.237 0 .42.066.548.199a.687.687 0 0 1 .193.5c0 .196-.064.36-.193.49-.129.131-.311.197-.548.197-.236 0-.418-.066-.545-.196a.677.677 0 0 1-.19-.492z" />
										</g>
									</svg>
								</div>
								<span>{ t('panel_menu_about') }</span>
							</div>
						</li>
						{hasPlusAccess || hasPremiumAccess ? (
							<li onClick={this.clickSubscriber} className="menu-option">
								<div className="contributor">
									<svg className="menu-icon-container" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M13.5295 8.35186C12.9571 8.75995 12.2566 9 11.5 9C9.567 9 8 7.433 8 5.5C8 3.567 9.567 2 11.5 2C12.753 2 13.8522 2.65842 14.4705 3.64814M6 20.0872H8.61029C8.95063 20.0872 9.28888 20.1277 9.61881 20.2086L12.3769 20.8789C12.9753 21.0247 13.5988 21.0388 14.2035 20.9214L17.253 20.3281C18.0585 20.1712 18.7996 19.7854 19.3803 19.2205L21.5379 17.1217C22.154 16.5234 22.154 15.5524 21.5379 14.9531C20.9832 14.4134 20.1047 14.3527 19.4771 14.8103L16.9626 16.6449C16.6025 16.9081 16.1643 17.0498 15.7137 17.0498H13.2855H14.8311C15.7022 17.0498 16.4079 16.3633 16.4079 15.5159V15.2091C16.4079 14.5055 15.9156 13.892 15.2141 13.7219L12.8286 13.1417C12.4404 13.0476 12.0428 13 11.6431 13C10.6783 13 8.93189 13.7988 8.93189 13.7988L6 15.0249M20 6.5C20 8.433 18.433 10 16.5 10C14.567 10 13 8.433 13 6.5C13 4.567 14.567 3 16.5 3C18.433 3 20 4.567 20 6.5ZM2 14.6V20.4C2 20.9601 2 21.2401 2.10899 21.454C2.20487 21.6422 2.35785 21.7951 2.54601 21.891C2.75992 22 3.03995 22 3.6 22H4.4C4.96005 22 5.24008 22 5.45399 21.891C5.64215 21.7951 5.79513 21.6422 5.89101 21.454C6 21.2401 6 20.9601 6 20.4V14.6C6 14.0399 6 13.7599 5.89101 13.546C5.79513 13.3578 5.64215 13.2049 5.45399 13.109C5.24008 13 4.96005 13 4.4 13H3.6C3.03995 13 2.75992 13 2.54601 13.109C2.35785 13.2049 2.20487 13.3578 2.10899 13.546C2 13.7599 2 14.0399 2 14.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									<span>{t('subscription_for_contributors')}</span>
								</div>
							</li>
						) : (
							<li className="menu-option-contributor">
								<a href={`${globals.GHOSTERY_BASE_URL}/become-a-contributor?utm_source=gbe&utm_campaign=in_app_plus_lm`} target="_blank" rel="noreferrer">
									<svg className="menu-icon-container" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M13.5295 8.35186C12.9571 8.75995 12.2566 9 11.5 9C9.567 9 8 7.433 8 5.5C8 3.567 9.567 2 11.5 2C12.753 2 13.8522 2.65842 14.4705 3.64814M6 20.0872H8.61029C8.95063 20.0872 9.28888 20.1277 9.61881 20.2086L12.3769 20.8789C12.9753 21.0247 13.5988 21.0388 14.2035 20.9214L17.253 20.3281C18.0585 20.1712 18.7996 19.7854 19.3803 19.2205L21.5379 17.1217C22.154 16.5234 22.154 15.5524 21.5379 14.9531C20.9832 14.4134 20.1047 14.3527 19.4771 14.8103L16.9626 16.6449C16.6025 16.9081 16.1643 17.0498 15.7137 17.0498H13.2855H14.8311C15.7022 17.0498 16.4079 16.3633 16.4079 15.5159V15.2091C16.4079 14.5055 15.9156 13.892 15.2141 13.7219L12.8286 13.1417C12.4404 13.0476 12.0428 13 11.6431 13C10.6783 13 8.93189 13.7988 8.93189 13.7988L6 15.0249M20 6.5C20 8.433 18.433 10 16.5 10C14.567 10 13 8.433 13 6.5C13 4.567 14.567 3 16.5 3C18.433 3 20 4.567 20 6.5ZM2 14.6V20.4C2 20.9601 2 21.2401 2.10899 21.454C2.20487 21.6422 2.35785 21.7951 2.54601 21.891C2.75992 22 3.03995 22 3.6 22H4.4C4.96005 22 5.24008 22 5.45399 21.891C5.64215 21.7951 5.79513 21.6422 5.89101 21.454C6 21.2401 6 20.9601 6 20.4V14.6C6 14.0399 6 13.7599 5.89101 13.546C5.79513 13.3578 5.64215 13.2049 5.45399 13.109C5.24008 13 4.96005 13 4.4 13H3.6C3.03995 13 2.75992 13 2.54601 13.109C2.35785 13.2049 2.20487 13.3578 2.10899 13.546C2 13.7599 2 14.0399 2 14.6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									<span>{t('subscription_upgrade_to')}</span>
								</a>
							</li>
						)}
					</ul>
					<div className="row account-info">
						<div onClick={this.clickSignedInAs} className={`${!loggedIn ? 'hide' : ''} menu-option signed-in-as small-12 columns`}>
							<svg width="20" height="20" viewBox="0 0 20 20">
								<g fillRule="nonzero">
									<path className="menu-icon" d="M10 5.519a2.788 2.788 0 0 1 2.772 2.772A2.788 2.788 0 0 1 10 11.063a2.788 2.788 0 0 1-2.772-2.772A2.788 2.788 0 0 1 10 5.52v-.001zm.025 1.036c-.97 0-1.76.79-1.76 1.76s.79 1.76 1.76 1.76 1.76-.79 1.76-1.76-.79-1.76-1.76-1.76z" />
									<path className="menu-icon" d="M10 1c4.975 0 9 4.025 9 9s-4.025 9-9 9-9-4.025-9-9 4.025-9 9-9zm0 10.279c2.65 0 4.858 1.941 5.262 4.431a7.731 7.731 0 0 0 2.578-5.75c0-4.32-3.534-7.8-7.84-7.8a7.842 7.842 0 0 0-5.549 2.28A7.764 7.764 0 0 0 2.16 9.96a7.833 7.833 0 0 0 2.54 5.75c.441-2.49 2.65-4.431 5.3-4.431zm4.36 5.242c-.114-2.238-2.027-3.995-4.347-3.991-2.335 0-4.24 1.77-4.383 3.991a7.918 7.918 0 0 0 4.383 1.319 7.713 7.713 0 0 0 4.347-1.319z" />
								</g>
							</svg>
							<span title={email}>{ email }</span>
						</div>
						<div onClick={this.clickSignIn} className={`${loggedIn ? 'hide' : ''} menu-option menu-signin small-12 columns`}>
							<span>{ t('sign_in') }</span>
						</div>
						<div onClick={this.clickSignOut} className={`${!loggedIn ? 'hide' : ''} menu-option menu-signout small-12 columns`}>
							<span>{ t('sign_out') }</span>
						</div>
					</div>
				</div>
			</ClickOutside>
		);
	}
}

export default HeaderMenu;
