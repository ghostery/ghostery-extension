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
			<div className="ProductsView">
				<div className="row align-center-middle ProductsView--paddingTopBig">

					<div className="ProductsView__mobileScreenshots columns">
						<img src="/app/images/hub/products/bothPhones.png" />
					</div>

					<div className="ProductsView__mainPromoText columns">
						<div className="ProductsView__headerTitle row">
							{t('hub_products_header_title')}
						</div>
						<div className="ProductsView__headerDescription row">
							{t('hub_products_header_description')}
						</div>

						<div className="ProductsView__mainPromoTitle row ProductsView--paddingTopSmall" >
							{t('hub_products_main_promo_title')}
						</div>
						<div className="ProductsView__mainPromoDescription row " >
							{t('hub_products_main_promo_description')}
						</div>

						<div className="row ProductsView--paddingTopSmall">
							<div className="ProductsView__downloadIcon columns">
								<a href="https://itunes.apple.com/us/app/ghostery-privacy-browser/id472789016?mt=8" target="_blank">
									<img src="/app/images/hub/products/appstore.png" />
								</a>
							</div>
							<div className="ProductsView__downloadIcon columns">
								<a href="https://play.google.com/store/apps/details?id=com.ghostery.android.ghostery" target="_blank">
									<img src="/app/images/hub/products/googleplay.png" />
								</a>
							</div>
						</div>
					</div>


				</div>

				<div className="ProductsView__otherPromos row align-center ProductsView--paddingTopBig">

					<div className="row align-center-middle">
							<div className="ProductsView__promoScreenshotNewTab columns">
								<img src="/app/images/hub/products/ghosteryTab.png" />
							</div>

							<div className="ProductsView__promoScreenshotLite columns">
								<img src="/app/images/hub/products/ghosteryLite.png" />
							</div>
					</div>


					<div className="ProductsView__smallPromoText row">

						<div className="ProductsView__smallPromo columns">
							<div className="ProductsView__smallPromoTitle ProductsView--paddingTopMedium">
								{t('hub_products_second_promo_title')}
							</div>

							<div className="ProductsView__smallPromoDescription">
								{t('hub_products_second_promo_description')}
							</div>
						</div>

						<div className="ProductsView__smallPromo columns">
							<div className="ProductsView__smallPromoTitle ProductsView--paddingTopMedium">
								{t('hub_products_third_promo_title')}
							</div>

							<div className="ProductsView__smallPromoDescription">
								{t('hub_products_third_promo_description')}
							</div>

							<div className=" ProductsView--paddingTopVerySmall">
								<a href="https://itunes.apple.com/us/app/ghostery-privacy-browser/id472789016?mt=8" target="_blank">
									<img src="/app/images/hub/products/appstore.png" className="ProductsView__smallPromoDownload" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ProductsView;
