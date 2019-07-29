import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';

import { sendMessage } from '../../panel/utils/msg';

class I18nWithLink extends Component {
	constructor(props) {
		super(props);
		this.containerRef = createRef();
	}

	componentDidMount() {
		const { current: { children } } = this.containerRef;
		for (let i = 0; i < children.length; i++) {
			const ele = children[i];
			if (ele.nodeName.toLowerCase() !== 'a') {
				return;
			}
			ele.onclick = (e) => {
				e.preventDefault();
				const { href } = e.target;
				sendMessage('openNewTab', {
					url: href,
					become_active: true,
				});
			};
		}
	}

	render() {
		const { value } = this.props;
		return (
			<span ref={this.containerRef} dangerouslySetInnerHTML={{ __html: t(value) }} />
		);
	}
}

export default I18nWithLink;

I18nWithLink.propTypes = {
	value: PropTypes.string.isRequired,
};
