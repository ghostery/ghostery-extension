/**
 * Plan View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Fragment, useRef, useEffect } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import QueryString from 'query-string';
// import { BASIC, PLUS, PREMIUM } from './UpgradePlanViewConstants';
import globals from '../../../../src/classes/Globals';

const searchPromo = () => (
	<div className="PlanView__searchPromoContainer">
		<div className="PlanView__searchLogo" />
		<div className="PlanView__adFree">{ t('hub_plan_view_ad_free') }</div>
		<div className="PlanView__adFreePromo">{ t('hub_plan_view_ad_free_promo') }</div>
		<div className="PlanView__adFreePromoDescription">{ t('hub_plan_view_ad_free_promo_description') }</div>
	</div>
);

const startTrialButton = () => (
	<div className="PlanView__searchCTAButton">Start Trial</div>
);

const PlanView = () => {
	const test = 5;
	return (
		<div>
			<div className="PlanView__yourPrivacyPlan">{ t('hub_plan_view_your_privacy_plan') }</div>
			<div className="PlanView__subtitle">{ t('hub_plan_view_based_on_your_privacy_preferences') }</div>
			{searchPromo()}
			{startTrialButton()}
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
PlanView.propTypes = {};

// Default props used on the Home View
PlanView.defaultProps = {};

export default PlanView;
