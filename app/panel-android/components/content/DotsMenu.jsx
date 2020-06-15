/**
 * DotsMenu Component
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

export default class DotsMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			opening: false,
		};
	}

	componentDidMount() {
		window.addEventListener('click', this.handleClick, false);
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.handleClick, false);
	}

	/* Close the menu if user clicks anywhere on the window */
	handleClick = (event) => {
		const { opening } = this.state;
		if (opening && event.target.className.indexOf('dots-menu-btn') === -1) {
			this.setState({
				opening: false,
			});
		}
	}

	/* Toggle menu */
	dotsButtonClicked = () => {
		this.setState(prevState => ({ opening: !prevState.opening }));
	}

	render() {
		const { actions } = this.props;
		const { opening } = this.state;
		return (
			<div className="dots-menu">
				<button type="button" className="dots-menu-btn" aria-label="Menu" onClick={this.dotsButtonClicked} />
				<div className={`dots-menu-content ${opening ? 'opening' : ''}`}>
					<ul>
						{actions.map(action => (
							<li key={action.id}>
								<button type="button" className="dots-menu-item" onClick={action.callback}>{action.name}</button>
							</li>
						))}
					</ul>
				</div>
			</div>
		);
	}
}

DotsMenu.propTypes = {
	actions: PropTypes.arrayOf(PropTypes.object).isRequired,
};
