/**
 * Products View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo: Update this file.
 */

import React, { Component } from 'react';

/**
 * @class Implement the Products View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class ProductsView extends Component {
	/**
	 * Lifecycle Event
	 */
	componentWillMount() {
		const title = t('hub_products_title');
		window.document.title = title;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Products View of the Hub app
	 */
	render() {
		return (
			<div>
				{t('hub_products_title')}
			</div>
		);
	}
}

export default ProductsView;
