/**
 * Detail Menu Component
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
import { Link } from 'react-router-dom';
import { sendMessage } from '../utils/msg';
/**
 * @class Implement footer of the detailed (expert) view which
 * acts as a menu and opens additional views.
 * @memberOf PanelClasses
 */
class DetailMenu extends React.Component {
	static mapItemsToPings(itemName) {
		switch (itemName) {
			case 'showBlocking':
				return 'list_dash';
			case 'showRewards':
				return 'rewards_dash';
			default:
				return '';
		}
	}

	constructor(props) {
		super(props);

		this.state = {
			menu: {
				showBlocking: true,
				showRewards: false,
			},
		};

		// event bindings
		this.setActiveTab = this.setActiveTab.bind(this);
	}
	/**
	 * Change menu according to the clicked button. Save it in state.
	 * @param {Object} event 		click event
	 */
	setActiveTab(event) {
		const menu = Object.assign({}, this.state.menu);
		Object.keys(menu).forEach((key) => {
			if (key === event.currentTarget.id) {
				menu[key] = true;
				const pingType = DetailMenu.mapItemsToPings(key);
				if (pingType) {
					sendMessage('ping', pingType);
				}
			} else {
				menu[key] = false;
			}
		});
		this.setState({ menu });
	}
	/**
	 * Render the expert view footer.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div id="detail-menu">
				<div className="flex-container">
					<div className="menu-item flex-child-grow">
						<Link to="/detail/blocking" onClick={this.setActiveTab} id="showBlocking" className={this.state.menu.showBlocking ? 'active ' : ''}>
							<svg className="list-view-icon" viewBox="0 0 25 25" width="25" height="25">
								<g className="fill stroke" strokeWidth=".5" fillRule="evenodd">
									<path d="M1.728 17.852c0 .45.003.902-.002 1.354-.001.14.04.21.194.209.909-.003 1.818-.003 2.727 0 .15 0 .2-.06.2-.205-.004-.895-.005-1.791 0-2.686 0-.16-.061-.212-.215-.211-.896.005-1.791.005-2.687 0-.17-.002-.222.062-.22.226.008.438.003.876.003 1.313m3.844.023l-.001 1.394c-.001.507-.341.879-.85.886-.957.013-1.914.013-2.87 0-.511-.007-.85-.377-.85-.886v-2.81c0-.508.343-.88.85-.885.957-.013 1.914-.013 2.87 0 .507.006.849.379.85.886.002.472 0 .943 0 1.415M4.845 3.3c0-.432-.008-.863.003-1.294.005-.189-.049-.262-.249-.26-.876.01-1.751.008-2.626.001-.18-.002-.251.047-.249.24.009.875.007 1.75.001 2.625-.001.171.046.241.228.24a169.23 169.23 0 0 1 2.666 0c.182.001.232-.07.228-.24-.008-.438-.002-.876-.002-1.313m.727.015v1.374c-.002.523-.336.894-.856.901-.957.014-1.913.015-2.87 0-.512-.009-.844-.379-.845-.89v-2.79c.001-.532.345-.897.875-.902.943-.009 1.886-.01 2.829 0 .521.007.865.375.866.893.002.471.001.942.001 1.414M3.286 12.131h1.292c.258 0 .267-.009.267-.256 0-.862-.004-1.724.003-2.586.002-.188-.048-.262-.25-.26-.874.008-1.75.007-2.625 0-.18 0-.25.047-.25.24.01.875.01 1.75 0 2.626 0 .192.07.243.25.24.437-.01.875-.004 1.313-.004M1 10.582c0-.465-.002-.93 0-1.395.002-.522.34-.89.86-.896.95-.012 1.9-.012 2.85 0 .519.006.86.376.86.896.002.93 0 1.86 0 2.79 0 .52-.341.89-.86.896-.95.011-1.9.011-2.85 0-.52-.007-.858-.375-.86-.897v-1.394M13.421 3.663H7.475c-.246 0-.396-.094-.439-.273a.365.365 0 0 1 .338-.453c.033-.002.067-.001.101-.001 3.977 0 7.955 0 11.933-.002.205 0 .362.056.432.256.08.223-.088.459-.33.47-.169.009-.338.003-.506.003h-5.583zM13.44 10.219h5.927c.06 0 .122-.004.182.003.172.023.3.173.305.349a.36.36 0 0 1-.304.371c-.046.006-.094.004-.141.004H7.476c-.041 0-.081.002-.121-.002a.359.359 0 0 1-.325-.371.355.355 0 0 1 .323-.352c.06-.006.12-.002.182-.002h5.906zM13.442 17.501h5.987c.27 0 .43.142.425.374a.358.358 0 0 1-.325.351c-.04.004-.08.002-.121.002H7.475c-.255 0-.408-.103-.442-.293a.36.36 0 0 1 .36-.433c.25-.005.5 0 .75 0h5.299z" />
								</g>
							</svg>
							<span>{ t('panel_detail_menu_list_title') }</span>
						</Link>
					</div>
					<div className="menu-item flex-child-grow">
						<Link to="/detail/rewards/list" onClick={this.setActiveTab} id="showRewards" className={this.state.menu.showRewards ? 'active ' : ''}>
							<svg className="list-view-icon" viewBox="0 0 25 25" width="25" height="25">
								<g className="fill stroke" strokeWidth=".5" fillRule="evenodd">
									<path d="M7.633 9.847h2.756v-3.34H7.633v3.34zm2.502-4.64c.012.036.026.07.04.106 1.12-.076 2.258-.053 3.356-.255 1.298-.238 1.79-1.608 1.09-2.72-.606-.96-2.15-1.157-2.77-.292-.53.739-.947 1.559-1.394 2.356-.14.25-.217.536-.322.805zm-2.213.083c-.169-.558-1.107-2.375-1.487-2.898a3.492 3.492 0 0 0-.144-.191 1.795 1.795 0 0 0-3.086.445c-.4.966.168 2.197 1.11 2.402 1.182.257 2.386.166 3.607.242zm3.588 4.54h4.821V6.503h-4.82V9.83zm-9.806.02h4.833V6.5H1.704v3.35zm5.92 10.028h2.755v-8.92H7.624v8.92zm3.895.046h4.007v-8.972h-4.007v8.972zm-9.01-.046h4.024v-8.93H2.508v8.93zm-1.082-8.867c-.711-.188-.856-.092-.848-1.108.009-1.245.002-2.49.003-3.737 0-.584.157-.74.744-.74.41 0 .82.001 1.228-.001.085 0 .168-.01.228-.014-.208-.365-.456-.697-.596-1.069A2.87 2.87 0 0 1 3.534.807c1.308-.68 2.851-.296 3.705.938.648.94 1.146 1.961 1.598 3.007.045.103.096.205.17.364.106-.223.192-.392.267-.565.411-.935.843-1.86 1.433-2.702.513-.73 1.166-1.229 2.08-1.347 1.485-.192 2.915.87 3.161 2.353.144.868-.074 1.636-.577 2.34l-.161.221c.087.013.149.03.212.03.472-.002.944-.005 1.415-.012.353-.007.58.193.58.545a745.66 745.66 0 0 1 0 4.405c0 .297-.184.491-.487.534-.104.016-.21.018-.344.03v9.161c0 .106.003.214-.005.32-.028.364-.16.506-.519.56-.114.017-.231.017-.347.017l-13.427.001c-.072 0-.144.001-.214-.002-.489-.029-.647-.192-.647-.686v-9.308z" />
									{this.props.hasReward && (
										<path fill="#5b0059" fillRule="nonzero" transform="translate(12,12) scale(0.33)" d="M37.196 16.054l-7.654 6.22c-.444.361-.645.963-.524 1.565l2.296 9.392C31.637 34.756 30.51 36 29.18 36c-.403 0-.806-.12-1.168-.361l-8.34-5.097a1.468 1.468 0 0 0-1.611 0L9.8 35.639c-.362.24-.805.361-1.208.361-1.33 0-2.538-1.244-2.135-2.77l2.296-9.39c.121-.562-.04-1.164-.524-1.526l-7.453-6.26c-1.53-1.325-.644-3.853 1.33-3.974l9.75-.682a1.583 1.583 0 0 0 1.329-.963l3.706-9.03C17.294.482 18.141 0 18.986 0c.846 0 1.692.482 2.095 1.405l3.707 9.03c.201.522.725.883 1.33.963l9.749.682c2.014.12 2.9 2.65 1.33 3.974z" />
									)}
								</g>
							</svg>
							<span>{ t('panel_detail_menu_rewards_title') }</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}
}

export default DetailMenu;
