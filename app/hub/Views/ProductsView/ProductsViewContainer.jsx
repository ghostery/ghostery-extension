/**
 * Products View Container
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ProductsView from './ProductsView';

/**
 * @class Implement the Products View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class ProductsViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_products_page_title');
		window.document.title = title;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Products View of the Hub app
	 */
	render() {
		return (
			<ProductsView
				onAndroidClick={() => { this.props.actions.sendPing({ type: 'products_cta_android' }); }}
				onIosClick={() => { this.props.actions.sendPing({ type: 'products_cta_ios' }); }}
				onLiteClick={() => { this.props.actions.sendPing({ type: 'products_cta_lite' }); }}
			/>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
ProductsViewContainer.propTypes = {
	actions: PropTypes.shape({
		sendPing: PropTypes.func.isRequired,
	}).isRequired,
};

export default ProductsViewContainer;
