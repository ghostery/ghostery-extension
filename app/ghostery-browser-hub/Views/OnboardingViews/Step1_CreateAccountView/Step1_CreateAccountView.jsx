/**
 * Browser Create Account View
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

import React, { Fragment, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import Step1_LogInForm from '../Step1_LogInForm';
import Step1_CreateAccountForm from '../Step1_CreateAccountForm';
import globals from '../../../../../src/classes/Globals';
import { LOGIN, ONBOARDING } from '../../OnboardingView/OnboardingConstants';

const SIGN_IN = 'SIGN_IN';
const CREATE_ACCOUNT = 'CREATE_ACCOUNT';

const faqList = [
	{
		icon: 'ghosty-shield.svg',
		label: t('ghostery_browser_hub_onboarding_private_by_design'),
		description: t('ghostery_browser_hub_onboarding_private_by_design_description'),
	},
	{
		icon: 'ghosty-box.svg',
		label: t('ghostery_browser_hub_onboarding_can_i_remove_my_account'),
		description: t('ghostery_browser_hub_onboarding_can_i_remove_my_account_description'),
	}
];

const renderFAQListItem = (icon, label, description) => (
	<div className="Step1_CreateAccountView__faqItemContainer row">
		<div className="Step1_CreateAccountView__faqIconContainer columns small-12 medium-10 medium-offset-1 large-2 large-offset-1">
			<img className="Step1_CreateAccountView__faqIcon" src={`/app/images/hub/browser-create-account-view/${icon}`} />
		</div>
		<div className="Step1_CreateAccountView__faqItemTextContainer columns small-12 medium-10 medium-offset-1 large-8 large-offset-0">
			<div className="Step1_CreateAccountView__faqItemLabel">{label}</div>
			<div className="Step1_CreateAccountView__faqItemDescription">{description}</div>
		</div>
	</div>
);

/**
 * A Functional React component for rendering the Browser Create Account View
 * @return {JSX} JSX for rendering the Browser Create Account View of the Hub app
 * @memberof GhosteryBrowserHubViews
 */
const Step1_CreateAccountView = (props) => {
	const { user, actions } = props;
	const { setSetupStep } = actions;
	const email = user && user.email;

	const [expanded, setExpanded] = useState(false);
	const [view, setView] = useState(CREATE_ACCOUNT);

	const arrowClassNames = ClassNames('Step1_CreateAccountView__arrow', {
		up: expanded,
		down: !expanded,
	});

	const faqRef = useRef(null);
	const scrollToFAQ = () => {
		faqRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	const handleFAQLearnMoreClick = () => {
		setTimeout(scrollToFAQ, 1);
		setExpanded(!expanded);
	};

	const renderSkipLink = () => (
		<div className="row align-center-middle">
			<div className="columns small-10 medium-6" />
			<div className="columns small-10 medium-6">
				<NavLink className="Step1_CreateAccountView__skip" to="/onboarding/2" onClick={() => setSetupStep({ setup_step: LOGIN, origin: ONBOARDING })}>
					<span>{t('ghostery_browser_hub_onboarding_skip')}</span>
				</NavLink>
			</div>
		</div>
	);

	return (user ? (
		<div className="Step1_CreateAccountView__alreadySignedIn">
			<div className="Step1_CreateAccountView__title">{t('ghostery_browser_hub_onboarding_you_are_signed_in_as')}</div>
			<div className="Step1_CreateAccountView__email">{email}</div>
			<div className="Step1_CreateAccountView__ctaButtonContainer">
				<NavLink className="Step1_CreateAccountView__ctaButton" to="/onboarding/2" onClick={() => setSetupStep({ setup_step: LOGIN, origin: ONBOARDING })}>
					<span>{t('next')}</span>
				</NavLink>
			</div>
		</div>
	) : (
		<div className="Step1_CreateAccountView">
			{view === CREATE_ACCOUNT && (
				<div className="Step1_CreateAccountView__title">{t('ghostery_browser_hub_onboarding_create_a_ghostery_account')}</div>
			)}
			{view === SIGN_IN && (
				<div className="Step1_CreateAccountView__title">{t('sign_in')}</div>
			)}
			<div className="Step1_CreateAccountView__subtitle">{ t('ghostery_browser_hub_onboarding_sync_settings') }</div>
			<div className="row align-center-middle">
				{view === CREATE_ACCOUNT && (
					<div className="Step1_CreateAccountView__alreadyHaveAccount columns small-12 medium-6" onClick={() => setView(SIGN_IN)}>{t('ghostery_browser_hub_onboarding_already_have_account')}</div>
				)}
				{view === SIGN_IN && (
					<div className="Step1_CreateAccountView__alreadyHaveAccount columns small-12 medium-6" onClick={() => setView(CREATE_ACCOUNT)}>{t('ghostery_browser_hub_onboarding_create_an_account')}</div>
				)}
				<div className="Step1_CreateAccountView__alreadyHaveAccount columns small-12 medium-6" />
			</div>
			{view === CREATE_ACCOUNT ? (
				<Fragment>
					{/* eslint-disable-next-line react/jsx-pascal-case */}
					<Step1_CreateAccountForm />
					{renderSkipLink()}
					<div className="Step1_CreateAccountView__learnMoreContainer" onClick={handleFAQLearnMoreClick}>
						<div className="Step1_CreateAccountView__learnMore">{t('ghostery_browser_hub_onboarding_we_take_your_privacy_very_seriously')}</div>
					</div>
					<div className={arrowClassNames} onClick={handleFAQLearnMoreClick} />
					<div ref={faqRef} className="Step1_CreateAccountView__FAQContainer">
						{expanded &&
							faqList.map(item => renderFAQListItem(item.icon, item.label, item.description))
						}
					</div>
					{expanded && (
						<div className="row">
							<a className="Step1_CreateAccountView__privacyPolicyLink columns small-12 medium-10 medium-offset-1 large-8 large-offset-3" href={`${globals.GHOSTERY_BASE_URL}/about-ghostery/ghostery-plans-and-products-privacy-policy/`} target="_blank" rel="noreferrer">
								{t('ghostery_browser_hub_onboarding_visit_our_privacy_policy')}
							</a>
						</div>
					)}
				</Fragment>
			) : (
				<Fragment>
					{/* eslint-disable-next-line react/jsx-pascal-case */}
					<Step1_LogInForm />
					{renderSkipLink()}
				</Fragment>
			)}
		</div>
	));
};

// PropTypes ensure we pass required props of the correct type
Step1_CreateAccountView.propTypes = {
	user: PropTypes.shape({
		email: PropTypes.string,
	}),
};

// Default props used in the Plus View
Step1_CreateAccountView.defaultProps = {
	user: {
		email: ''
	},
};

export default Step1_CreateAccountView;
