/**
 * MenuItem Component
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

export default class MenuItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			opening: false,
		};
	}

	menuItemClicked = () => {
		const { updateHeaderText, title } = this.props;
		this.setState({
			opening: true,
		});

		updateHeaderText(title);
	}

	closeButtonClicked = () => {
		const { updateHeaderText } = this.props;
		this.setState({
			opening: false,
		});

		updateHeaderText('');
	}

	switcherClicked = () => {
		const { active, type } = this.props;
		const { callGlobalAction } = this.context;
		callGlobalAction({
			actionName: 'cliqzFeatureToggle',
			actionData: {
				currentState: active,
				type,
			},
		});
	}

	render() {
		const {
			type,
			numData,
			title,
			description,
			active,
			headline,
		} = this.props;
		const { opening } = this.state;
		return (
			<div className="menuItemWrapper">
				<div onClick={this.menuItemClicked} className="menuItemOverview">
					<span className={type}>{numData}</span>
					<span className="title">{title}</span>
					<p className="description">{description}</p>
				</div>
				<span onClick={this.switcherClicked} className={`switcher ${active ? 'active' : ''}`} />
				<div className={`menuItemContent ${opening ? 'opening' : ''}`}>
					<span className={type}>{numData}</span>
					<p className="headline">{headline}</p>
					<p className="description">{description}</p>
					<button type="button" aria-label="Close" onClick={this.closeButtonClicked} className="close" />
				</div>
			</div>
		);
	}
}

MenuItem.propTypes = {
	active: PropTypes.bool,
	type: PropTypes.string,
	title: PropTypes.string,
	numData: PropTypes.number,
	headline: PropTypes.string,
	description: PropTypes.string,
};

MenuItem.defaultProps = {
	active: false,
	type: '',
	title: '',
	numData: 0,
	headline: '',
	description: '',
};

MenuItem.contextTypes = {
	callGlobalAction: PropTypes.func,
};
