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

import React from 'react';
import PropTypes from 'prop-types';


/**
 * A Functional React Component for rendering the Products View
 * @return {JSX} JSX for rendering the Products View
 * @memberof HubComponents
 */
const ProductsView = props => (
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
					<a href="https://itunes.apple.com/us/app/ghostery-privacy-browser/id472789016?mt=8" onClick={props.onIosClick} target="_blank" rel="noopener noreferrer">
						<img
							className="ProductsView__imageAppStoreIos"
							src="/app/images/hub/products/app_store_badge_us.svg"
						/>
					</a>
					<a href="https://play.google.com/store/apps/details?id=com.ghostery.android.ghostery" onClick={props.onAndroidClick} target="_blank" rel="noopener noreferrer">
						<img
							className="ProductsView__imagePlayStore"
							src="/app/images/hub/products/google-play-badge.png"
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
					<a href="https://itunes.apple.com/us/app/ghostery-privacy-browser/id472789016?mt=81" onClick={props.onLiteClick} target="_blank" rel="noopener noreferrer">
						<img
							className="ProductsView__imageAppStoreMac"
							src="/app/images/hub/products/app_store_mac_badge_us.svg"
						/>
					</a>
				</div>
			</div>
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
ProductsView.propTypes = {
	onAndroidClick: PropTypes.func.isRequired,
	onIosClick: PropTypes.func.isRequired,
	onLiteClick: PropTypes.func.isRequired,
};

export default ProductsView;
