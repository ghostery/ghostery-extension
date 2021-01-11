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
import { NavLink } from 'react-router-dom';
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
			searchBeingConsidered: null,
			modalActive: false,
		};
	}

	updateSelection = () => this.setState(prevState => (
		{
			chosenSearch: prevState.searchBeingConsidered,
			searchBeingConsidered: null,
			modalActive: false
		}
	));

	cancelSelection = () => this.setState({ modalActive: false, searchBeingConsidered: null });

	handleInputChange = event => this.setState({ customSearchURL: event.target.value });

	triggerConfirmationModal = selection => this.setState({ modalActive: true, searchBeingConsidered: selection });

	handleSubmit = () => {
		const { chosenSearch, customSearchURL } = this.state;
		const { actions, history } = this.props;
		const { setSetupStep } = actions;

		const payload = {
			type: 'setDefaultSearch',
			search: chosenSearch,
			customSearchURL,
		};

		console.log('Cross-extension payload: ', payload);

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
		const logoFilename = `/app/images/hub/ChooseDefaultSearchView/search-engine-logo-${optionName.toLocaleLowerCase()}.svg`;

		return (
			<div onClick={() => this.triggerConfirmationModal(optionName)} className={containerClasses}>
				<div className="ChooseSearchView__radioButtonContainer">
					<RadioButton
						checked={selected}
						handleClick={() => {}}
						altDesign
					/>
				</div>
				<div className="ChooseSearchView__optionContainerDescription">
					<img src={logoFilename} />
				</div>
			</div>
		);
	}

	renderCustomURLContainer = () => {
		const { chosenSearch, customSearchURL } = this.state;

		const selected = (chosenSearch === SEARCH_CUSTOM);
		const containerClasses = ClassNames('ChooseSearchView__optionContainer', { selected });

		return (
			<div onClick={() => this.setState({ chosenSearch: SEARCH_CUSTOM })} className={containerClasses}>
				<p>Choose Your Own</p>
				<input
					onChange={this.handleInputChange}
					value={customSearchURL}
					placeholder="Enter custom search URL"
				/>
			</div>

		);
	}

	renderConfirmationModal = () => {
		const { searchBeingConsidered } = this.state;

		return (
			<Modal show>
				<div className="ChooseSearchViewModal__content">
					<div className="ChooseSearchView__confirmationModalDescription">
						Modal of type
						{searchBeingConsidered}
					</div>
					<button
						onClick={this.cancelSelection}
						type="button"
					>
						Cancel
					</button>
					<button
						onClick={this.updateSelection}
						type="button"
					>
						Confirm
					</button>
				</div>
			</Modal>
		);
	}

	renderSearchOptions = () => {
		const { chosenSearch } = this.state;

		return (
			<Fragment>
				<div className="ChooseSearchView__relativeContainer">
					<div className="ChooseSearchView__backContainer">
						<span className="ChooseSearchView__caret left" />
						<NavLink to="/onboarding/2">
							<span className="ChooseSearchView__back">{t('ghostery_browser_hub_onboarding_back')}</span>
						</NavLink>
					</div>
				</div>
				<div className="ChooseSearchView__container">
					<div className="ChooseSearchView__title">{t('choose_your_default_search')}</div>
					<div className="ChooseSearchView__subtitle">{t('pick_a_default_search_engine')}</div>
					<div className="ChooseSearchView__optionsContainer">
						{this.renderOptionContainer(chosenSearch, SEARCH_GHOSTERY, 'Ghostery Search')}
						{this.renderOptionContainer(chosenSearch, SEARCH_STARTPAGE, 'StartPage')}
						{this.renderOptionContainer(chosenSearch, SEARCH_BING, 'Bing')}
						{this.renderCustomURLContainer()}
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
			</Fragment>
		);
	}

	render() {
		const { modalActive } = this.state;

		return (
			<div className="full-height">
				{modalActive && this.renderConfirmationModal()}
				{!modalActive && this.renderSearchOptions()}
			</div>
		);
	}
}

export default ChooseDefaultSearchView;
