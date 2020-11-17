/**
 * Stats Detail Menu Component
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
import { Link } from 'react-router-dom';
import { sendMessage } from '../utils/msg';
/**
 * @class Implement footer of the detailed (expert) view which
 * acts as a menu and opens additional views.
 * @memberOf PanelClasses
 */
class DetailMenu extends React.Component {
	static pings = { showBlocking: 'list_dash' };

	constructor(props) {
		super(props);

		const { activeTab } = this.props;
		this.state = {
			menu: {
				showBlocking: activeTab === 'blocking',
			}
		};

		// event bindings
		this.setActiveTab = this.setActiveTab.bind(this);
	}

	/**
	 * Change menu according to the clicked button. Save it in state.
	 * @param {Object} event 		click event
	 */
	setActiveTab(event) {
		const selectionId = event.currentTarget.id;
		sendMessage('ping', DetailMenu.pings[selectionId]);

		this.setState((prevState) => {
			const menu = { ...prevState.menu };
			Object.keys(menu).forEach((key) => { menu[key] = selectionId === key; });
			return { menu };
		});
	}

	/**
	 * Render the expert view footer.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		const { menu } = this.state;
		return (
			<div id="detail-menu">
				<div className="flex-container">
					<div className="menu-item flex-child-grow">
						<Link to="/detail/blocking" onClick={this.setActiveTab} id="showBlocking" className={menu.showBlocking ? 'active ' : ''}>
							<svg className="list-view-icon" viewBox="0 0 25 25" width="25" height="25">
								<g className="fill stroke" strokeWidth=".5" fillRule="evenodd">
									<path d="M1.728 17.852c0 .45.003.902-.002 1.354-.001.14.04.21.194.209.909-.003 1.818-.003 2.727 0 .15 0 .2-.06.2-.205-.004-.895-.005-1.791 0-2.686 0-.16-.061-.212-.215-.211-.896.005-1.791.005-2.687 0-.17-.002-.222.062-.22.226.008.438.003.876.003 1.313m3.844.023l-.001 1.394c-.001.507-.341.879-.85.886-.957.013-1.914.013-2.87 0-.511-.007-.85-.377-.85-.886v-2.81c0-.508.343-.88.85-.885.957-.013 1.914-.013 2.87 0 .507.006.849.379.85.886.002.472 0 .943 0 1.415M4.845 3.3c0-.432-.008-.863.003-1.294.005-.189-.049-.262-.249-.26-.876.01-1.751.008-2.626.001-.18-.002-.251.047-.249.24.009.875.007 1.75.001 2.625-.001.171.046.241.228.24a169.23 169.23 0 0 1 2.666 0c.182.001.232-.07.228-.24-.008-.438-.002-.876-.002-1.313m.727.015v1.374c-.002.523-.336.894-.856.901-.957.014-1.913.015-2.87 0-.512-.009-.844-.379-.845-.89v-2.79c.001-.532.345-.897.875-.902.943-.009 1.886-.01 2.829 0 .521.007.865.375.866.893.002.471.001.942.001 1.414M3.286 12.131h1.292c.258 0 .267-.009.267-.256 0-.862-.004-1.724.003-2.586.002-.188-.048-.262-.25-.26-.874.008-1.75.007-2.625 0-.18 0-.25.047-.25.24.01.875.01 1.75 0 2.626 0 .192.07.243.25.24.437-.01.875-.004 1.313-.004M1 10.582c0-.465-.002-.93 0-1.395.002-.522.34-.89.86-.896.95-.012 1.9-.012 2.85 0 .519.006.86.376.86.896.002.93 0 1.86 0 2.79 0 .52-.341.89-.86.896-.95.011-1.9.011-2.85 0-.52-.007-.858-.375-.86-.897v-1.394M13.421 3.663H7.475c-.246 0-.396-.094-.439-.273a.365.365 0 0 1 .338-.453c.033-.002.067-.001.101-.001 3.977 0 7.955 0 11.933-.002.205 0 .362.056.432.256.08.223-.088.459-.33.47-.169.009-.338.003-.506.003h-5.583zM13.44 10.219h5.927c.06 0 .122-.004.182.003.172.023.3.173.305.349a.36.36 0 0 1-.304.371c-.046.006-.094.004-.141.004H7.476c-.041 0-.081.002-.121-.002a.359.359 0 0 1-.325-.371.355.355 0 0 1 .323-.352c.06-.006.12-.002.182-.002h5.906zM13.442 17.501h5.987c.27 0 .43.142.425.374a.358.358 0 0 1-.325.351c-.04.004-.08.002-.121.002H7.475c-.255 0-.408-.103-.442-.293a.36.36 0 0 1 .36-.433c.25-.005.5 0 .75 0h5.299z" />
								</g>
							</svg>
							<span>{ t('panel_detail_menu_list_title') }</span>
						</Link>
					</div>
					<div className="menu-item flex-child-grow">
						<Link to="/stats">
							<svg className="list-view-icon" viewBox="0 0 25 25" width="25" height="25">
								<g className="fill stroke" strokeWidth=".5" fillRule="evenodd">
									<path d="M1.435 1.226A.444.444 0 0 0 1 1.68V19.32c0 .25.195.453.435.453h19.13c.24 0 .435-.203.435-.453a.444.444 0 0 0-.435-.452H1.87V1.68a.444.444 0 0 0-.435-.453zm15.87 2.488c-.836 0-1.522.715-1.522 1.584 0 .357.118.68.312.947l-2.581 3.838a1.45 1.45 0 0 0-.34-.035c-.424 0-.81.178-1.087.473l-1.82-1.102c.051-.16.08-.326.08-.502 0-.87-.686-1.584-1.52-1.584-.836 0-1.523.715-1.523 1.584 0 .357.118.68.313.947l-2.582 3.838a1.45 1.45 0 0 0-.34-.035c-.835 0-1.521.714-1.521 1.583 0 .87.686 1.583 1.522 1.583.835 0 1.521-.714 1.521-1.583 0-.424-.163-.817-.428-1.103l2.52-3.746c.162.062.336.099.517.099.353 0 .678-.133.938-.346l1.922 1.166c-.02.1-.034.205-.034.311 0 .869.687 1.583 1.522 1.583s1.522-.714 1.522-1.583c0-.424-.164-.817-.428-1.103l2.52-3.746c.162.062.335.099.516.099.836 0 1.522-.714 1.522-1.583 0-.87-.686-1.584-1.522-1.584z" />
								</g>
							</svg>
							<span>{ t('historical_stats') }</span>
						</Link>
					</div>
				</div>
			</div>
		);
	}
}

export default DetailMenu;
