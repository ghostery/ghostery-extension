/**
 * Modal Component
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

/**
 * A Functional React component for a Modal
 * @return {JSX} JSX for rendering a Modal
 * @memberof SharedComponents
 */
const Modal = ({ show, toggle, children }) => (
	<div className="Modal">
		{ show && (
			<div>
				<div className="Modal__background" onClick={toggle || undefined} />
				<div className="Modal__container flex-container align-center-middle">
					{children}
				</div>
			</div>
		)}
	</div>
);

// PropTypes ensure we pass required props of the correct type
Modal.propTypes = {
	show: PropTypes.bool.isRequired,
	toggle: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.oneOf([false]),
	]),
	children: PropTypes.element.isRequired,
};

// Default props instantiation
Modal.defaultProps = {
	toggle: false,
};

export default Modal;
