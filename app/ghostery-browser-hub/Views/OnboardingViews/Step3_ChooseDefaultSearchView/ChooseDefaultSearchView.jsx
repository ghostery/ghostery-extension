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
import ClassNames from 'classnames';
import RadioButton from '../../../../shared-components/RadioButton';
import { ONBOARDING, CHOOSE_PLAN, CHOOSE_DEFAULT_SEARCH } from '../../OnboardingView/OnboardingConstants';
import { Modal } from '../../../../shared-components';

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
			customSearchURL: null,
			modal: null,
			modalActive: false,
		};
	}

	updateSelection = newSelection => this.setState({ chosenSearch: newSelection });

	cancelSelection = () => this.setState({ modalActive: false, modal: null });

	triggerConfirmationModal = selection => this.setState({ modalActive: true, modal: selection });

	handleSubmit = () => {
		const { chosenSearch, customSearchURL } = this.state;
		const { actions, history } = this.props;
		const { setSetupStep } = actions;

		const payload = {
			type: 'setDefaultSearch',
			search: chosenSearch,
			customSearchURL,
		};

		chrome.runtime.sendMessage('search@ghostery.com', payload, () => {
			// TODO handle errors if needed
			// TODO save user's search setting to redux / background if needed
			setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING });
			history.push(`/${ONBOARDING}/${CHOOSE_PLAN}`);
		});
	}

	renderOptionContainer = (chosenSearch, optionName, optionDesc) => {
		const selected = (chosenSearch === optionName);
		const containerClasses = ClassNames('ChooseSearchView__optionContainer', { selected });

		return (
			<div className={containerClasses}>
				<div className="ChooseSearchView__radioButtonContainer">
					<RadioButton
						checked={selected}
						handleClick={() => this.triggerConfirmationModal(optionName)}
						altDesign
					/>
				</div>
				<div className="ChooseSearchView__optionContainerDescription">
					{optionDesc}
				</div>
			</div>
		);
	}

	renderConfirmationModal = () => {
		const { modal } = this.state;

		return (
			<Modal show>
				<div className="ChooseSearchView__confirmationModalDescription">
					Modal of type
					{modal}
				</div>
				<button
					onClick={this.cancelSelection}
					type="button"
				>
					Cancel
				</button>
			</Modal>
		);
	}

	renderSearchOptions = () => {
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

	render() {
		const { modalActive } = this.state;

		if (modalActive) return (this.renderConfirmationModal());

		return (this.renderSearchOptions());
	}
}

export default ChooseDefaultSearchView;
