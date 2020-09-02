/**
 * Overview Tab Component
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

import React from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import {
	NotScanned,
	DonutGraph,
	GhosteryFeature,
	PauseButton,
	CliqzFeature
} from '../../../panel/components/BuildingBlocks';
import globals from '../../../../src/classes/Globals';

const {
	IS_CLIQZ,
	WHITELISTED, BLACKLISTED
} = globals;

class OverviewTab extends React.Component {
	constructor(props) {
		super(props);

		this.pauseOptions = [
			{ name: t('pause_30_min'), val: 30 },
			{ name: t('pause_1_hour'), val: 60 },
			{ name: t('pause_24_hours'), val: 1440 },
		];
	}

	get siteNotScanned() {
		const { blocking, summary } = this.props;
		const { siteNotScanned, pageUrl } = blocking;
		const { categories } = summary;
		const searchRegEx = /http|chrome-extension|moz-extension|ms-browser-extension|newtab|chrome:\/\/startpage\//;

		if (siteNotScanned || !categories || pageUrl.search(searchRegEx) === -1) {
			return true;
		}
		return false;
	}

	get adBlockBlocked() {
		const { panel, cliqzModuleData } = this.props;
		const { enable_ad_block } = panel;
		const { adBlock } = cliqzModuleData;

		return (enable_ad_block && adBlock.trackerCount) || 0;
	}

	get antiTrackUnsafe() {
		const { panel, cliqzModuleData } = this.props;
		const { enable_anti_tracking } = panel;
		const { antiTracking } = cliqzModuleData;

		return (enable_anti_tracking && antiTracking.trackerCount) || 0;
	}

	get trackersFound() {
		const { summary } = this.props;
		const { trackerCounts } = summary;

		return (trackerCounts && (trackerCounts.allowed + trackerCounts.blocked)) || 0;
	}

	get smartBlockBlocked() {
		const { panel, summary } = this.props;
		const { smartBlock } = panel;
		const { trackerCounts } = summary;

		let sbBlocked = (smartBlock && smartBlock.blocked && Object.keys(smartBlock.blocked).length) || 0;
		if (sbBlocked === trackerCounts.sbBlocked) {
			sbBlocked = 0;
		}

		return sbBlocked;
	}

	get smartBlockAllowed() {
		const { panel, summary } = this.props;
		const { smartBlock } = panel;
		const { trackerCounts } = summary;

		let sbAllowed = (smartBlock && smartBlock.unblocked && Object.keys(smartBlock.unblocked).length) || 0;
		if (sbAllowed === trackerCounts.sbAllowed) {
			sbAllowed = 0;
		}

		return sbAllowed;
	}

	get smartBlockAdjust() {
		const { panel } = this.props;
		const { enable_smart_block } = panel;

		return enable_smart_block && ((this.smartBlockBlocked - this.smartBlockAllowed) || 0);
	}

	get trackersBlockedCount() {
		const { summary } = this.props;
		const { paused_blocking, sitePolicy, trackerCounts } = summary;

		let totalTrackersBlockedCount;
		if (paused_blocking || sitePolicy === WHITELISTED) {
			totalTrackersBlockedCount = 0;
		} else if (sitePolicy === BLACKLISTED) {
			totalTrackersBlockedCount = trackerCounts.blocked + trackerCounts.allowed || 0;
		} else {
			totalTrackersBlockedCount = trackerCounts.blocked + this.smartBlockAdjust || 0;
		}

		return totalTrackersBlockedCount;
	}

	get requestsModifiedCount() {
		return this.adBlockBlocked + this.antiTrackUnsafe;
	}

	handleTrustButtonClick = () => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'handleTrustButtonClick',
		});
	}

	handleRestrictButtonClick = () => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'handleRestrictButtonClick',
		});
	}

	handlePauseButtonClick = (time) => {
		const { summary, callGlobalAction } = this.props;
		const { paused_blocking } = summary;

		callGlobalAction({
			actionName: 'handlePauseButtonClick',
			actionData: {
				paused_blocking: (typeof time === 'number' ? true : !paused_blocking),
				time: typeof time === 'number' ? time * 60000 : 0,
			},
		});
	}

	handleCliqzFeatureClick = ({ feature, status }) => {
		const { callGlobalAction } = this.props;

		callGlobalAction({
			actionName: 'cliqzFeatureToggle',
			actionData: {
				currentState: status,
				type: feature,
			},
		});
	}

	_renderNavigationLinks() {
		const { clickAccount, clickSettings } = this.props;
		const accountIcon = (
			<svg width="30" height="30" viewBox="3 2 26 16">
				<g fill="none" fillRule="nonzero">
					<g fill="#a4a4a4" stroke="#a4a4a4" strokeWidth=".5">
						<path d="M16 5.519a2.788 2.788 0 0 1 2.772 2.772A2.788 2.788 0 0 1 16 11.063a2.788 2.788 0 0 1-2.772-2.772A2.788 2.788 0 0 1 16 5.52zm0 .911c-1.025 0-1.86.836-1.86 1.861s.835 1.86 1.86 1.86c1.025 0 1.86-.835 1.86-1.86 0-1.025-.835-1.86-1.86-1.86z" />
						<path d="M16 1c4.975 0 9 4.025 9 9s-4.025 9-9 9-9-4.025-9-9 4.025-9 9-9zm0 10.367c2.734 0 5.013 2.013 5.43 4.595A8.035 8.035 0 0 0 24.09 10c0-4.481-3.646-8.089-8.089-8.089A8.071 8.071 0 0 0 7.911 10a8.141 8.141 0 0 0 2.62 5.962c.456-2.582 2.735-4.595 5.469-4.595zm4.595 5.279A4.593 4.593 0 0 0 16 12.278c-2.468 0-4.481 1.937-4.633 4.368A8.167 8.167 0 0 0 16 18.089a7.957 7.957 0 0 0 4.595-1.443z" />
					</g>
				</g>
			</svg>
		);

		const settingsIcon = (
			<svg width="30" height="30" viewBox="-3 0 26 16">
				<g fill="#a4a4a4" fillRule="evenodd">
					<path d="M12.135 12.65c0-.067-.024-.135-.072-.203-.385-.455-.695-.845-.93-1.17.146-.28.256-.537.33-.775l1.6-.244c.062-.007.117-.043.165-.107s.072-.13.072-.198V8.068c0-.074-.024-.14-.072-.198-.048-.058-.107-.094-.175-.107l-1.568-.234c-.076-.232-.193-.51-.35-.837.102-.15.257-.353.463-.61.207-.26.35-.442.434-.55.048-.068.072-.133.072-.194 0-.184-.495-.728-1.485-1.63-.07-.055-.142-.082-.218-.082-.082 0-.15.024-.206.07l-1.217.908c-.283-.143-.54-.248-.775-.316l-.237-1.558c-.006-.068-.04-.128-.103-.178-.062-.05-.13-.077-.206-.077H5.74c-.157 0-.26.082-.31.245-.08.312-.16.835-.236 1.568-.295.095-.56.204-.794.326L3.214 3.7c-.07-.048-.14-.072-.216-.072-.13 0-.403.2-.815.6-.413.402-.695.704-.846.907-.048.055-.072.123-.072.204 0 .06.024.128.072.203.385.455.694.845.928 1.17-.144.28-.254.537-.33.775l-1.598.244c-.062.007-.117.042-.165.107-.048.064-.073.13-.073.197v1.884c0 .076.024.143.072.2.048.058.106.09.175.097l1.568.244c.082.26.203.538.36.836-.11.15-.27.357-.484.622-.212.264-.353.445-.422.54-.048.067-.072.132-.072.193 0 .184.495.727 1.485 1.63.07.055.142.082.218.082.09 0 .158-.024.206-.072l1.217-.906c.283.143.54.248.774.316l.237 1.558c.008.068.043.127.104.178.062.05.13.076.207.076h1.92c.157 0 .26-.08.308-.244.083-.32.162-.845.237-1.579.275-.082.54-.187.794-.316l1.186.916c.068.048.14.072.216.072.13 0 .4-.202.81-.606.41-.404.692-.708.85-.912.05-.047.073-.112.073-.193zm-3.57-1.812c-.514.51-1.136.764-1.865.764-.73 0-1.35-.255-1.867-.764-.515-.51-.773-1.123-.773-1.843s.258-1.334.773-1.843c.516-.51 1.138-.764 1.867-.764.73 0 1.35.254 1.866.764s.774 1.123.774 1.843-.258 1.334-.774 1.843zM18.364 2.752c-.09-.197-.193-.373-.31-.53.35-.767.526-1.235.526-1.405 0-.027-.013-.05-.04-.07-.826-.476-1.252-.714-1.28-.714l-.062.02c-.28.28-.598.66-.948 1.14-.138-.013-.24-.02-.31-.02-.068 0-.17.007-.31.02-.095-.142-.274-.37-.535-.687-.26-.315-.42-.473-.474-.473-.013 0-.116.054-.31.163-.19.11-.394.224-.607.346l-.36.204c-.03.02-.043.044-.043.07 0 .17.176.64.526 1.407-.117.156-.22.332-.31.53-1.024.1-1.536.206-1.536.315v1.425c0 .11.512.214 1.537.316.082.182.186.36.31.53-.35.766-.527 1.234-.527 1.404 0 .027.014.05.042.07.838.483 1.265.724 1.28.724.054 0 .212-.16.473-.478.26-.32.44-.55.536-.693.138.014.242.02.31.02.07 0 .172-.006.31-.02.096.143.275.374.536.693.26.32.42.478.474.478.014 0 .44-.24 1.28-.723.027-.02.04-.044.04-.07 0-.17-.175-.64-.525-1.406.123-.17.226-.348.31-.53 1.023-.103 1.536-.208 1.536-.316V3.067c0-.11-.512-.214-1.536-.316zm-1.49 1.95c-.258.255-.57.382-.934.382-.364 0-.675-.127-.933-.382-.258-.254-.387-.56-.387-.92 0-.354.13-.66.392-.918.26-.258.57-.387.928-.387.358 0 .667.13.93.387.26.258.39.564.39.917 0 .36-.128.668-.386.922z" />
				</g>
			</svg>
		);

		return (
			<div className="OverviewTab__NavigationLinks full-width">
				<div className="row align-justify align-middle">
					<div className="OverviewTab__NavigationLink" onClick={clickAccount}>
						{accountIcon}
					</div>
					<div className="OverviewTab__NavigationLink" onClick={clickSettings}>
						{settingsIcon}
					</div>
				</div>
			</div>
		);
	}

	_renderDonut() {
		const {
			blocking,
			cliqzModuleData,
			summary,
		} = this.props;
		const { categories } = blocking;
		const { adBlock, antiTracking } = cliqzModuleData;
		const { sitePolicy, paused_blocking } = summary;

		return (
			<DonutGraph
				categories={categories}
				adBlock={adBlock}
				antiTracking={antiTracking}
				renderRedscale={sitePolicy === BLACKLISTED}
				renderGreyscale={paused_blocking}
				totalCount={this.requestsModifiedCount + this.trackersFound}
				ghosteryFeatureSelect={sitePolicy}
			/>
		);
	}

	_renderPageHost() {
		const { summary } = this.props;
		const { pageHost = 'page_host' } = summary;
		const pageHostClassNames = ClassNames('OverviewTab__PageHostText', {
			invisible: (pageHost.split('.').length < 2),
		});

		return (
			<span className={pageHostClassNames}>{pageHost}</span>
		);
	}

	_renderTotalTrackersBlocked() {
		return (
			<div className="OverviewTab__PageStat">
				<span>
					{t('trackers_blocked')}
					{' '}
				</span>
				<span className="OverviewTab__PageStat--red">
					{this.trackersBlockedCount}
				</span>
			</div>
		);
	}

	_renderTotalRequestsModified() {
		return (
			<div className="OverviewTab__PageStat">
				<span>
					{t('requests_modified')}
					{' '}
				</span>
				<span className="OverviewTab__PageStat--blue">
					{this.requestsModifiedCount}
				</span>
			</div>
		);
	}

	_renderGhosteryFeatures() {
		const { summary } = this.props;
		const { paused_blocking, paused_blocking_timeout, sitePolicy } = summary;
		const disableBlocking = this.siteNotScanned;

		return (
			<div className="flex-container flex-dir-column align-middle">
				<div>
					<GhosteryFeature
						handleClick={this.handleTrustButtonClick}
						type="trust"
						sitePolicy={sitePolicy}
						blockingPausedOrDisabled={paused_blocking || disableBlocking}
						showText
						tooltipPosition=""
						short
						narrow={false}
					/>
				</div>
				<div className="OverviewTab__GhosteryFeature--ExtraMargins">
					<GhosteryFeature
						handleClick={this.handleRestrictButtonClick}
						type="restrict"
						sitePolicy={sitePolicy}
						blockingPausedOrDisabled={paused_blocking || disableBlocking}
						showText
						tooltipPosition=""
						short
						narrow={false}
					/>
				</div>
				<div>
					<PauseButton
						isPaused={paused_blocking}
						isPausedTimeout={paused_blocking_timeout}
						clickPause={this.handlePauseButtonClick}
						dropdownItems={this.pauseOptions}
						isCentered
						isCondensed={false}
					/>
				</div>
			</div>
		);
	}

	_renderCliqzFeatures() {
		const { panel, summary } = this.props;
		const { enable_anti_tracking, enable_ad_block, enable_smart_block } = panel;
		const { paused_blocking, sitePolicy } = summary;
		const disableBlocking = this.siteNotScanned;

		return (
			<div>
				<div className="OverviewTab__CliqzFeature">
					<CliqzFeature
						clickButton={this.handleCliqzFeatureClick}
						type="anti_track"
						active={enable_anti_tracking}
						cliqzInactive={paused_blocking || sitePolicy || disableBlocking || IS_CLIQZ}
						isSmaller
					/>
				</div>
				<div className="OverviewTab__CliqzFeature">
					<CliqzFeature
						clickButton={this.handleCliqzFeatureClick}
						type="ad_block"
						active={enable_ad_block}
						cliqzInactive={paused_blocking || sitePolicy || disableBlocking || IS_CLIQZ}
						isSmaller
					/>
				</div>
				<div className="OverviewTab__CliqzFeature">
					<CliqzFeature
						clickButton={this.handleCliqzFeatureClick}
						type="smart_block"
						active={enable_smart_block}
						cliqzInactive={paused_blocking || sitePolicy || disableBlocking}
						isSmaller
					/>
				</div>
			</div>
		);
	}

	render() {
		return (
			<div className="OverviewTab">
				{this._renderNavigationLinks()}

				{this.siteNotScanned && (
					<div className="OverviewTab__NotScannedContainer">
						<NotScanned isSmall />
					</div>
				)}

				{!this.siteNotScanned && (
					<div>
						<div className="OverviewTab__DonutGraphContainer">
							{this._renderDonut()}
						</div>
						<div className="OverviewTab__PageHostContainer">
							{this._renderPageHost()}
						</div>
						<div className="OverviewTab__PageStatsContainer">
							{this._renderTotalTrackersBlocked()}
							{this._renderTotalRequestsModified()}
						</div>
					</div>
				)}

				<div className="OverviewTab__GhosteryFeaturesContainer">
					{this._renderGhosteryFeatures()}
				</div>

				<div className="OverviewTab__CliqzFeaturesContainer">
					{this._renderCliqzFeatures()}
				</div>
			</div>
		);
	}
}

OverviewTab.propTypes = {
	panel: PropTypes.shape({
		enable_ad_block: PropTypes.bool.isRequired,
		enable_anti_tracking: PropTypes.bool.isRequired,
		enable_smart_block: PropTypes.bool.isRequired,
		smartBlock: PropTypes.shape({
			blocked: PropTypes.shape({}).isRequired,
			unblocked: PropTypes.shape({}).isRequired,
		}).isRequired,
	}).isRequired,
	summary: PropTypes.shape({
		categories: PropTypes.arrayOf.isRequired,
		trackerCounts: PropTypes.shape({
			allowed: PropTypes.number.isRequired,
			blocked: PropTypes.number.isRequired,
		}).isRequired,
		sitePolicy: PropTypes.oneOf([
			false,
			WHITELISTED,
			BLACKLISTED,
		]).isRequired,
		paused_blocking: PropTypes.bool.isRequired,
	}).isRequired,
	blocking: PropTypes.shape({
		siteNotScanned: PropTypes.bool.isRequired,
		pageUrl: PropTypes.string.isRequired,
	}).isRequired,
	cliqzModuleData: PropTypes.shape({
		adBlock: PropTypes.shape({
			trackerCount: PropTypes.number.isRequired,
		}).isRequired,
		antiTracking: PropTypes.shape({
			trackerCount: PropTypes.number.isRequired,
		}).isRequired,
	}).isRequired,
	clickAccount: PropTypes.func.isRequired,
	clickSettings: PropTypes.func.isRequired,
	callGlobalAction: PropTypes.func.isRequired,
};

export default OverviewTab;
