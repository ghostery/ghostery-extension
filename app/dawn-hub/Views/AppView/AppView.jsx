/**
 * Dawn Hub App View
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ToastMessage } from '../../../shared-components';

/**
 * A functional React component that lies at the root of the component hierarchy for the Dawn Hub
 * @extends Component
 * @memberof DawnHubViews
 */
const AppView = (props) => {
	const { toast, children } = props;
	const { toastMessage, toastClass } = toast;

	/**
	 * Handle clicking to exit the Toast Message.
	 */
	const exitToast = () => {
		const { actions } = props;
		actions.setToast({
			toastMessage: '',
			toastClass: '',
		});
	};

	return (
		<div className="App full-height full-width flex-container">
			<div className="App__mainContent full-height full-width">
				{<ToastMessage toastText={toastMessage} toastClass={toastClass} dawnHub toastExit={exitToast} />}
				{children}
			</div>
		</div>
	);
};

AppView.propTypes = {
	actions: PropTypes.shape({
		setToast: PropTypes.func.isRequired,
	}).isRequired,
	toast: PropTypes.shape({
		toastMessage: PropTypes.string,
		toastClass: PropTypes.string,
	}),
};

// Default props used in the App
AppView.defaultProps = {
	toast: {
		toastMessage: '',
		toastClass: '',
	},
};

export default AppView;
