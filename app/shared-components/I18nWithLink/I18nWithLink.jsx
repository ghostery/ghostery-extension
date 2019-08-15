/**
 * I18nWithLink Component
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

import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

import { handleClickOnNewTabLink } from '../../panel/utils/msg';

/**
 * A React component for i18n strings that need to include links
 * @return {JSX} JSX for rendering an i18n string with embedded links
 * @memberof SharedComponents
 */
class I18nWithLink extends Component {
	constructor(props) {
		super(props);
		this.containerRef = createRef();
	}

	componentDidMount() {
		const { current: { children } } = this.containerRef;
		for (let i = 0; i < children.length; i++) {
			const ele = children[i];
			if (ele.nodeName.toLowerCase() === 'a') {
				ele.onclick = e => handleClickOnNewTabLink(e);
			}
		}
	}

	render() {
		const { value, cssClasses } = this.props;

		return (
			<span className={cssClasses} ref={this.containerRef} dangerouslySetInnerHTML={{ __html: t(value) }} />
		);
	}
}

export default I18nWithLink;

I18nWithLink.propTypes = {
	cssClasses: PropTypes.string,
	value: PropTypes.string.isRequired,
};

I18nWithLink.defaultProps = {
	cssClasses: '',
};
