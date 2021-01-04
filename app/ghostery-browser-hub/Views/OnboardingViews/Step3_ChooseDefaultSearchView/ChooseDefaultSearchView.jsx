/**
 * Ghostery Browser Hub Choose Default Search View Component
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

import React, { Component } from 'react';
import { ONBOARDING, CHOOSE_PLAN, CHOOSE_DEFAULT_SEARCH } from '../../OnboardingView/OnboardingConstants';

class ChooseDefaultSearchView extends Component {
	handleSubmit = () => {
		const { actions, history } = this.props;
		const { setSetupStep } = actions;

		setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING });

		history.push(`/${ONBOARDING}/${CHOOSE_PLAN}`);
	}

	render() {
		return (
			<div className="ChooseSearchView__container">
				<div className="ChooseSearchView__title">{t('choose_your_default_search')}</div>
				<div className="ChooseSearchView__subtitle">{t('pick_a_default_search_engine')}</div>
				<div className="ChooseSearchView__optionsContainer">
					<div className="ChooseSearchView__optionContainer">Ghostery Search</div>
					<div className="ChooseSearchView__optionContainer">StartPage</div>
					<div className="ChooseSearchView__optionContainer">Bing</div>
					<div className="ChooseSearchView__optionContainer">Choose Your Own</div>
					<div className="ChooseSearchView__optionContainer">Yahoo</div>
				</div>
				<button
					className="ChooseSearchView__nextButton"
					type="button"
					onClick={() => this.handleSubmit()}
				>
					{t('next')}
				</button>
			</div>
		);
	}
}

export default ChooseDefaultSearchView;
