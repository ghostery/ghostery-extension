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
 */

import React, { Component } from 'react';

/**
 * @class Implement the Products View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class ProductsView extends Component {
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
			<div className="ProductsView">
				<div className="ProductsView--rowPaddingTop row align-center-middle">
					<div className="columns text-center">
						<img
							className="ProductsView__mobileScreenshots"
							src="/app/images/hub/products/product-mobile-browser.png"
							alt={t('hub_products_main_promo_title')}
						/>
					</div>
					<div className="columns">
						<h1 className="ProductsView__headerTitle">
							{t('hub_products_header_title')}
						</h1>
						<div className="ProductsView__headerDescription">
							{t('hub_products_header_description')}
						</div>
						<div className="ProductsView__mainPromoTitle" >
							{t('hub_products_main_promo_title')}
						</div>
						<div className="ProductsView__mainPromoDescription" >
							{t('hub_products_main_promo_description')}
						</div>
						<div className="ProductsView__storeImageContainer">
							<a href="https://itunes.apple.com/us/app/ghostery-privacy-browser/id472789016?mt=8" target="_blank" rel="noopener noreferrer">
								<img
									className="ProductsView__imageAppStore"
									src="/app/images/hub/products/appstore-icon.png"
								/>
							</a>
							<a href="https://play.google.com/store/apps/details?id=com.ghostery.android.ghostery" target="_blank" rel="noopener noreferrer">
								<img
									className="ProductsView__imagePlayStore"
									src="/app/images/hub/products/googleplay-icon.png"
								/>
							</a>
						</div>
					</div>
				</div>
				<div className="ProductsView--rowPaddingTop row align-center">
					<div className="ProductsView__secondaryPromo columns">
						<img
							className="ProductsView__secondaryPromoImage"
							src="/app/images/hub/products/product-new-tab.png"
							alt={t('hub_products_second_promo_title')}
						/>
						<div className="ProductsView__secondaryPromoTitle">
							{t('hub_products_second_promo_title')}
						</div>
						<div className="ProductsView__secondaryPromoDescription">
							{t('hub_products_second_promo_description')}
						</div>
					</div>
					<div className="ProductsView__secondaryPromo columns">
						<img
							className="ProductsView__secondaryPromoImage"
							src="/app/images/hub/products/product-ghostery-lite.png"
							alt={t('hub_products_third_promo_title')}
						/>
						<div className="ProductsView__secondaryPromoTitle">
							{t('hub_products_third_promo_title')}
						</div>
						<div className="ProductsView__secondaryPromoDescription">
							{t('hub_products_third_promo_description')}
						</div>
						<div className="ProductsView__storeImageContainer">
							<a href="https://itunes.apple.com/us/app/ghostery-privacy-browser/id472789016?mt=8" target="_blank" rel="noopener noreferrer">
								<img
									className="ProductsView__imageAppStore"
									src="/app/images/hub/products/appstore-icon.png"
								/>
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ProductsView;
