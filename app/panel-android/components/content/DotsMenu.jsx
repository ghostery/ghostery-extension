/**
 * DotsMenu Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

class DotsMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			open: false,
			unmounted: false,
		};
	}

	componentWillUnmount() {
		this.setState({ unmounted: true });
		window.removeEventListener('click', this.closeDotsMenu);
	}

	closeDotsMenu = () => {
		window.removeEventListener('click', this.closeDotsMenu);
		const { unmounted } = this.state;
		if (!unmounted) { // Can I remove this and still have no React Warning?
			this.setState({ open: false });
		}
	}

	clickDotsMenu = (event) => {
		event.stopPropagation();
		window.addEventListener('click', this.closeDotsMenu);
		this.setState(prevState => ({ open: !prevState.open }));
	}

	render() {
		const { actions } = this.props;
		const { open } = this.state;
		const menuContentClassNames = ClassNames('DotsMenu__content', {
			DotsMenu__open: open,
		});

		return (
			<div className="DotsMenu">
				<button type="button" className="DotsMenu__button" aria-label="Menu" onClick={this.clickDotsMenu} />
				<div className={menuContentClassNames}>
					<ul>
						{actions.map(action => (
							<li key={action.id}>
								<button type="button" className="DotsMenu__item" onClick={action.callback}>{action.name}</button>
							</li>
						))}
					</ul>
				</div>
			</div>
		);
	}
}

DotsMenu.propTypes = {
	actions: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		callback: PropTypes.func.isRequired,
	})).isRequired,
};

export default DotsMenu;
