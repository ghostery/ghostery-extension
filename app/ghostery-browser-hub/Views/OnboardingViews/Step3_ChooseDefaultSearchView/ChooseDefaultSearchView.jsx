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

import React, { Component, Fragment } from 'react';
import RadioButton from '../../../../shared-components/RadioButton';
import { ONBOARDING, CHOOSE_PLAN, CHOOSE_DEFAULT_SEARCH } from '../../OnboardingView/OnboardingConstants';

const SEARCH_GHOSTERY = 'Ghostery';
const SEARCH_BING = 'Bing';
const SEARCH_YAHOO = 'Yahoo';
const SEARCH_STARTPAGE = 'StartPage';
const SEARCH_CUSTOM = 'Custom';

class ChooseDefaultSearchView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			chosenSearch: SEARCH_GHOSTERY,
		};
	}

	updateSelection = newSelection => this.setState({ chosenSearch: newSelection });

	handleSubmit = () => {
		const { actions, history } = this.props;
		const { setSetupStep } = actions;

		setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING });

		history.push(`/${ONBOARDING}/${CHOOSE_PLAN}`);
	}

	renderOptionContainer = (chosenSearch, optionName, optionDesc) => (
		<div className="ChooseSearchView__optionContainer">
			<div className="ChooseSearchView__radioButtonContainer">
				<RadioButton checked={chosenSearch === optionName} handleClick={() => this.updateSelection(optionName)} altDesign />
			</div>
			<div className="ChooseSearchView__optionContainerDescription">
				{optionDesc}
			</div>
		</div>
	);

	render() {
		const { chosenSearch } = this.state;

		return (
			<div className="ChooseSearchView__container">
				<div className="ChooseSearchView__title">{t('choose_your_default_search')}</div>
				<div className="ChooseSearchView__subtitle">{t('pick_a_default_search_engine')}</div>
				<div className="ChooseSearchView__optionsContainer">
					{this.renderOptionContainer(chosenSearch, SEARCH_GHOSTERY, 'Ghostery Search')}
					{this.renderOptionContainer(chosenSearch, SEARCH_STARTPAGE, 'StartPage')}
					{this.renderOptionContainer(chosenSearch, SEARCH_BING, 'Bing')}
					<div className="ChooseSearchView__optionContainer">Choose Your Own</div>
					{this.renderOptionContainer(chosenSearch, SEARCH_YAHOO, 'Yahoo')}
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
