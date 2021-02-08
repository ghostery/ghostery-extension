/**
 * Browser Create Account View
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

import React, { Fragment, useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import Step1_LogInForm from '../Step1_LogInForm';
import Step1_CreateAccountForm from '../Step1_CreateAccountForm';
import globals from '../../../../../src/classes/Globals';
import {
	LOGIN,
	ONBOARDING,
	SIGN_IN_SUCCESSFUL,
	CREATE_ACCOUNT_SUCCESSFUL,
	SKIP_ACCOUNT_CREATION
} from '../../OnboardingView/OnboardingConstants';

const SIGN_IN = 'SIGN_IN';
const CREATE_ACCOUNT = 'CREATE_ACCOUNT';

const faqList = [
	{
		icon: 'ghosty-shield.svg',
		label: t('ghostery_dawn_onboarding_private_by_design'),
		description: t('ghostery_dawn_onboarding_private_by_design_description'),
	},
	{
		icon: 'ghosty-box.svg',
		label: t('ghostery_dawn_onboarding_can_i_remove_my_account'),
		description: t('ghostery_dawn_onboarding_can_i_remove_my_account_description'),
	}
];

const renderFAQListItem = (icon, label, description) => (
	<div key={label} className="Step1_CreateAccountView__faqItemContainer row">
		<div className="Step1_CreateAccountView__faqIconContainer columns small-12 medium-10 large-2">
			<img className="Step1_CreateAccountView__faqIcon" src={`/app/images/hub/browser-create-account-view/${icon}`} />
		</div>
		<div className="Step1_CreateAccountView__faqItemTextContainer columns small-12 medium-10 large-10">
			<div className="Step1_CreateAccountView__faqItemLabel">{label}</div>
			<div className="Step1_CreateAccountView__faqItemDescription">{description}</div>
		</div>
	</div>
);

/**
 * A Functional React component for rendering the Browser Create Account View
 * @return {JSX} JSX for rendering the Browser Create Account View of the Dawn Hub app
 * @memberof DawnHubViews
 */
const Step1_CreateAccountView = (props) => {
	const { actions, step, user } = props;
	const { setSetupStep, setToast } = actions;
	const email = user && user.email;

	const [view, setView] = useState(CREATE_ACCOUNT);

	const handleSkipButton = (dawn_setup_number) => {
		setSetupStep({
			setup_step: LOGIN,
			dawn_setup_number,
			origin: ONBOARDING,
		});
		setToast({
			toastMessage: '',
			toastClass: ''
		});
	};

	const handleNextOnSelectPlanStep = () => {
		const { prev } = props;

		setSetupStep({
			setup_step: LOGIN,
			dawn_setup_number: CREATE_ACCOUNT_SUCCESSFUL,
			origin: ONBOARDING,
		});

		setToast({
			toastMessage: '',
			toastClass: ''
		});

		prev();
	};

	const renderSkipLink = () => (
		<div className="row align-center-middle">
			<div className="columns small-10 medium-6" />
			<div className="columns small-10 medium-6">
				<NavLink className="Step1_CreateAccountView__skip" to="/onboarding/2" onClick={() => handleSkipButton(SKIP_ACCOUNT_CREATION)}>
					<span>{t('ghostery_dawn_onboarding_skip')}</span>
					<span className="Step1_CreateAccountView__arrow" />
				</NavLink>
			</div>
		</div>
	);

	const subtitle = (step === LOGIN)
		? t('ghostery_dawn_onboarding_sync_settings')
		: t('ghostery_dawn_onboarding_create_account_for_trial');

	return (user ? (
		<div className="Step1_CreateAccountView__alreadySignedIn">
			<div className="Step1_CreateAccountView__title">{t('ghostery_dawn_onboarding_you_are_signed_in_as')}</div>
			<div className="Step1_CreateAccountView__email">{email}</div>
			<div className="Step1_CreateAccountView__ctaButtonContainer">
				{step === LOGIN && (
					<NavLink className="Step1_CreateAccountView__ctaButton" to="/onboarding/2" onClick={() => handleSkipButton(SIGN_IN_SUCCESSFUL)}>
						<span>{t('next')}</span>
					</NavLink>
				)}
				{step !== LOGIN && (
					<div className="Step1_CreateAccountView__ctaButton" onClick={() => handleNextOnSelectPlanStep()}>
						<span>{t('next')}</span>
					</div>
				)}
			</div>
		</div>
	) : (
		<div className="Step1_CreateAccountView">
			{step !== LOGIN && (
				<div className="CreateAccountView__relativeContainer">
					<div className="CreateAccountView__backContainer">
						<span className="CreateAccountView__caret left" />
						<NavLink to="/onboarding/3">
							<span className="CreateAccountView__back">{t('ghostery_dawn_onboarding_back_to_search_selection')}</span>
						</NavLink>
					</div>
				</div>
			)}
			{view === CREATE_ACCOUNT && (
				<div className="Step1_CreateAccountView__title">{t('ghostery_dawn_onboarding_create_a_ghostery_account')}</div>
			)}
			{view === SIGN_IN && (
				<div className="Step1_CreateAccountView__title">{t('sign_in')}</div>
			)}
			<div className="Step1_CreateAccountView__subtitle">{subtitle}</div>
			<div className="row align-center-middle">
				{view === CREATE_ACCOUNT && (
					<div className="Step1_CreateAccountView__alreadyHaveAccount columns small-12" onClick={() => setView(SIGN_IN)}>{t('ghostery_dawn_onboarding_already_have_account')}</div>
				)}
				{view === SIGN_IN && (
					<div className="Step1_CreateAccountView__alreadyHaveAccount columns small-12" onClick={() => setView(CREATE_ACCOUNT)}>{t('ghostery_dawn_onboarding_create_an_account')}</div>
				)}
			</div>
			{view === CREATE_ACCOUNT ? (
				<Fragment>
					{/* eslint-disable-next-line react/jsx-pascal-case */}
					<Step1_CreateAccountForm />
					{(step === LOGIN) && renderSkipLink()}
					<div className="Step1_CreateAccountView__FAQContainer">
						{faqList.map(item => renderFAQListItem(item.icon, item.label, item.description))}
						<div className="row">
							<div className="Step1_CreateAccountView__faqIconContainer columns small-12 medium-10 large-2" />
							<div className="Step1_CreateAccountView__faqItemTextContainer columns small-12 medium-10 large-10">
								<a className="Step1_CreateAccountView__privacyPolicyLink" href={`${globals.GHOSTERY_BASE_URL}/about-ghostery/ghostery-plans-and-products-privacy-policy/`} target="_blank" rel="noreferrer">
									{t('ghostery_dawn_onboarding_visit_our_privacy_policy')}
								</a>
							</div>
						</div>
					</div>
				</Fragment>
			) : (
				<Fragment>
					{/* eslint-disable-next-line react/jsx-pascal-case */}
					<Step1_LogInForm />
					{(step === LOGIN) && renderSkipLink()}
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
