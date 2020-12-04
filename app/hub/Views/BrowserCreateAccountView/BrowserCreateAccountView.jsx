/**
 * Browser Create Account View
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

import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import { NavLink } from 'react-router-dom';
import BrowserLogInForm from '../BrowserLoginForm';
import BrowserCreateAccountForm from '../BrowserCreateAccountForm';
import globals from '../../../../src/classes/Globals';

const SIGN_IN = 'SIGN_IN';
const CREATE_ACCOUNT = 'CREATE_ACCOUNT';

const faqList = [
	{
		icon: 'ghosty-shield.svg',
		label: t('ghostery_browser_hub_onboarding_private_by_design'),
		description: t('ghostery_browser_hub_onboarding_private_by_design_description'),
	},
	{
		icon: 'ghosty-letter.svg',
		label: t('ghostery_browser_hub_onboarding_why_do_you_need_my_email'),
		description: t('ghostery_browser_hub_onboarding_why_do_you_need_my_email_description'),
	},
	{
		icon: 'ghosty-shield-letter.svg',
		label: t('ghostery_browser_hub_onboarding_what_do_you_use_my_email_for'),
		description: t('ghostery_browser_hub_onboarding_what_do_you_use_my_email_for_description'),
	},
	{
		icon: 'ghosty-lock.svg',
		label: `${t('ghostery_browser_hub_onboarding_how_secure_is_')} Ghostery?`,
		description: t('ghostery_browser_hub_onboarding_how_secure_is_ghostery_description'),
	},
	{
		icon: 'ghosty-box.svg',
		label: t('ghostery_browser_hub_onboarding_can_i_remove_my_account'),
		description: t('ghostery_browser_hub_onboarding_can_i_remove_my_account_description'),
	}
];

const renderFAQListItem = (icon, label, description) => (
	<div className="BrowserCreateAccountView__faqItemContainer row">
		<div className="BrowserCreateAccountView__faqIconContainer columns small-12 medium-10 medium-offset-1 large-2 large-offset-1">
			<img className="BrowserCreateAccountView__faqIcon" src={`/app/images/hub/browser-create-account-view/${icon}`} />
		</div>
		<div className="BrowserCreateAccountView__faqItemTextContainer columns small-12 medium-10 medium-offset-1 large-8 large-offset-0">
			<div className="BrowserCreateAccountView__faqItemLabel">{label}</div>
			<div className="BrowserCreateAccountView__faqItemDescription">{description}</div>
		</div>
	</div>
);

const renderSkipLink = () => (
	<div className="row align-center-middle">
		<div className="columns small-10 medium-5" />
		<div className="columns small-10 medium-5">
			<div className="BrowserCreateAccountView__skip">{t('ghostery_browser_hub_onboarding_skip')}</div>
		</div>
	</div>
);

/**
 * A Functional React component for rendering the Browser Create Account View
 * @return {JSX} JSX for rendering the Browser Create Account View of the Hub app
 * @memberof HubComponents
 */
const BrowserCreateAccountView = (props) => {
	const { user } = props;
	const email = user && user.email;

	const [expanded, setExpanded] = useState(false);
	const [view, setView] = useState(CREATE_ACCOUNT);

	const arrowClassNames = ClassNames('BrowserCreateAccountView__arrow', {
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

	return (user ? (
		<div className="BrowserCreateAccountView__alreadySignedIn">
			<div className="BrowserCreateAccountView__title">{t('ghostery_browser_hub_onboarding_you_are_signed_in_as')}</div>
			<div className="BrowserCreateAccountView__email">{email}</div>
			<div className="BrowserCreateAccountView__ctaButtonContainer">
				{/* Link to next page */}
				<button type="submit" className="BrowserCreateAccountView__ctaButton">{t('next')}</button>
			</div>
		</div>
	) : (
		<div className="BrowserCreateAccountView">
			{view === CREATE_ACCOUNT && (
				<div className="BrowserCreateAccountView__title">{t('ghostery_browser_hub_onboarding_create_a_ghostery_account')}</div>
			)}
			{view === SIGN_IN && (
				<div className="BrowserCreateAccountView__title">{t('sign_in')}</div>
			)}
			<div className="BrowserCreateAccountView__subtitle">{ t('ghostery_browser_hub_onboarding_sync_settings') }</div>
			<div className="row align-center-middle">
				{view === CREATE_ACCOUNT && (
					<div className="BrowserCreateAccountView__alreadyHaveAccount columns small-12 medium-5" onClick={() => setView(SIGN_IN)}>{t('ghostery_browser_hub_onboarding_already_have_account')}</div>
				)}
				{view === SIGN_IN && (
					<div className="BrowserCreateAccountView__alreadyHaveAccount columns small-12 medium-5" onClick={() => setView(CREATE_ACCOUNT)}>{t('ghostery_browser_hub_onboarding_create_an_account')}</div>
				)}
				<div className="BrowserCreateAccountView__alreadyHaveAccount columns small-12 medium-5" />
			</div>
			{view === CREATE_ACCOUNT ? (
				<Fragment>
					<BrowserCreateAccountForm />
					{renderSkipLink()}
					<div className="BrowserCreateAccountView__learnMoreContainer" onClick={handleFAQLearnMoreClick}>
						<div className="BrowserCreateAccountView__learnMore">{t('ghostery_browser_hub_onboarding_we_take_your_privacy_very_seriously')}</div>
					</div>
					<div className={arrowClassNames} onClick={handleFAQLearnMoreClick} />
					<div ref={faqRef} className="BrowserCreateAccountView__FAQContainer">
						{expanded &&
							faqList.map(item => renderFAQListItem(item.icon, item.label, item.description))
						}
					</div>
					{expanded && (
						<div className="row">
							<a className="BrowserCreateAccountView__privacyPolicyLink columns small-12 medium-10 medium-offset-1 large-8 large-offset-3" href={`${globals.GHOSTERY_BASE_URL}/about-ghostery/ghostery-plans-and-products-privacy-policy/`} target="_blank" rel="noreferrer">
								{t('ghostery_browser_hub_onboarding_visit_our_privacy_policy')}
							</a>
						</div>
					)}
				</Fragment>
			) : (
				<Fragment>
					<BrowserLogInForm />
					{renderSkipLink()}
				</Fragment>
			)}
		</div>
	));
};

export default BrowserCreateAccountView;
