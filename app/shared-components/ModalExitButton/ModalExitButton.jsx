
/**
 * Modal Exit Button Component
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
 * A Functional React component for a Exit Button
 * @return {JSX} JSX for rendering a Exit Button
 * @memberof SharedComponents
 */
const ModalExitButton = (props) => {
	const {
		exitModal
	} = props;

	return (
		<button type="button" onClick={exitModal} className="ModalExitButton__exit flex-container align-middle">
			<span className="ModalExitButton__exitIcon" />
		</button>
	);
};

// PropTypes ensure we pass required props of the correct type
ModalExitButton.propTypes = {
	exitModal: PropTypes.func.isRequired
};

export default ModalExitButton;
