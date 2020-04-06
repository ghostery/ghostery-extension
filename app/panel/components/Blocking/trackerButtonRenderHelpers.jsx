import React from 'react';
import ClassNames from 'classnames';

export const renderKnownTrackerButtons = (
	ss_allowed, ss_blocked, clickTrackerTrust, clickTrackerRestrict, clickTrackerStatus
) => (
	<div className="svg-container">
		<span className="t-tooltip-up-left" data-g-tooltip={ss_allowed ? t('summary_undo') : t('panel_tracker_trust_tooltip')}>
			<svg className="blocking-icons trust" onClick={clickTrackerTrust} width="20px" height="20px" viewBox="0 0 20 20">
				<g transform="translate(1 1)" fill="none" fillRule="evenodd">
					<path className="border" d="M-.5-.5h18.3v18.217H-.5z" />
					<path className="background" d="M.5.5h16.3v16.217H.5z" />
					<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
						<circle className="trust-circle" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
					</svg>
				</g>
			</svg>
		</span>
		<span className="t-tooltip-up-left" data-g-tooltip={ss_blocked ? t('summary_undo') : t('panel_tracker_restrict_tooltip')}>
			<svg className="blocking-icons restrict" onClick={clickTrackerRestrict} width="20px" height="20px" viewBox="0 0 20 20">
				<g transform="translate(1 1)" fill="none" fillRule="evenodd">
					<path className="border" d="M-.5-.5h18.3v18.217H-.5z" />
					<path className="background" d="M.5.5h16.3v16.217H.5z" />
					<svg width="20px" height="20px" viewBox="-2 -2 20 20">
						<g className="restrict-circle" transform="translate(1 1)" fillRule="evenodd">
							<path d="M1.958 1.958l7.834 7.834" />
							<circle cx="5.753" cy="5.753" r="5.753" />
						</g>
					</svg>
				</g>
			</svg>
		</span>
		<span className={(!ss_blocked && !ss_allowed) ? 't-tooltip-up-left' : ''} data-g-tooltip={t('panel_tracker_block_tooltip')}>
			<svg className="blocking-icons status" onClick={() => { if (ss_allowed || ss_blocked) { return; } clickTrackerStatus(); }} width="20px" height="20px" viewBox="0 0 20 20">
				<g transform="translate(1 1)" fill="none" fillRule="evenodd">
					<path className="border" d="M-.5-.5h18.3v18.217H-.5z" />
					<path className="background" d="M.5.5h16.3v16.217H.5z" />
					<svg width="20px" height="20px" viewBox="-2.5 -2.5 20 20">
						<path className="check" d="M8.062 6l3.51-3.51c.57-.57.57-1.493 0-2.063-.57-.57-1.495-.57-2.063 0L6 3.937 2.49.428c-.57-.57-1.493-.57-2.063 0-.57.57-.57 1.494 0 2.064L3.937 6 .426 9.51c-.57.57-.57 1.493 0 2.063.57.57 1.494.57 2.063 0L6 8.063l3.51 3.508c.57.57 1.493.57 2.063 0 .57-.57.57-1.493 0-2.062L8.063 6z" fillRule="nonzero" />
					</svg>
					<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
						<circle className="trust-circle" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
					</svg>
					<svg width="20px" height="20px" viewBox="-2 -2 20 20">
						<g className="restrict-circle" transform="translate(1 1)" fillRule="evenodd">
							<path d="M1.958 1.958l7.834 7.834" />
							<circle cx="5.753" cy="5.753" r="5.753" />
						</g>
					</svg>
				</g>
			</svg>
		</span>
	</div>
);

export const renderUnknownTrackerButtons = (
	handleCliqzTrackerWhitelist, whitelisted, siteRestricted, type, contextType
) => {
	const svgContainerClasses = ClassNames('unknown-svg-container', {
		whitelisted: whitelisted && !siteRestricted,
		siteRestricted,
	});

	let protectedColor;
	let allowedColor;
	let restrictedColor;
	switch (contextType) {
		case 'palm-theme':
			protectedColor = '#87f0fb';
			allowedColor = '#b8e986';
			restrictedColor = '#ff7e74';
			break;
		case 'leaf-theme':
			protectedColor = '#2e3b80';
			allowedColor = '#326c45';
			restrictedColor = '#963939';
			break;
		default:
			protectedColor = '#00AEF0';
			allowedColor = '#96c761';
			restrictedColor = '#00AEF0';
			break;
	}

	return (
		<div className={svgContainerClasses}>
			{/* USE INLINE SVG FOR TRUST CIRCLE TO CHANGE COLORS WITH CSS */}
			<span className="t-tooltip-up-left" data-g-tooltip={t('panel_tracker_trust_tooltip')}>
				<svg className="cliqz-tracker-trust" onClick={handleCliqzTrackerWhitelist} width="20px" height="20px" viewBox="0 0 20 20">
					<g transform="translate(1 1)" fill="none" fillRule="evenodd">
						<path className="border" stroke={allowedColor} d="M-.5-.5h18.3v18.217H-.5z" />
						<path className="background" stroke="#FFF" fill={allowedColor} d="M.5.5h16.3v16.217H.5z" />
						<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
							<circle className="trust-circle" stroke="#FFF" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
						</svg>
					</g>
				</svg>
			</span>

			{/* USE INLINE SVG FOR ANTI-TRACKING SHIELD TO CHANGE COLORS WITH CSS */}
			<span className="t-tooltip-up-left" data-g-tooltip={type === 'antiTracking' ? t('panel_tracker_scrub_tooltip') : t('panel_tracker_restrict_tooltip')}>
				<svg className="cliqz-tracker-scrub" onClick={handleCliqzTrackerWhitelist} width="20px" height="20px" viewBox="0 0 20 20">
					<g transform="translate(1 1)" fill="none" fillRule="evenodd">
						<path className="border" stroke={type === 'antiTracking' ? protectedColor : restrictedColor} d="M-.5-.5h18.3v18.217H-.5z" />
						<path className="background" stroke="#FFF" fill={type === 'antiTracking' ? protectedColor : restrictedColor} d="M.5.5h16.3v16.217H.5z" />
						{type === 'antiTracking' ? (
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 19.5 19.5">
								<g transform="translate(2.5 2.5)">
									<path className="shield" fill="none" fillRule="evenodd" stroke="#FFF" strokeWidth="1.4" d="M8.149 1.022a.505.505 0 0 0-.298 0l-6.404 1.7A.574.574 0 0 0 1 3.286c.03 4.56 2.472 8.792 6.672 11.624.09.06.209.089.328.089.12 0 .238-.03.328-.09 4.2-2.83 6.642-7.063 6.672-11.623a.574.574 0 0 0-.447-.566L8.15 1.022z" />
								</g>
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 20 20">
								<g fill="none" fillRule="evenodd" transform="translate(2 2)">
									<path className="shield" d="M10.101 1.922l3.183 3.473-.206 4.706-3.473 3.183-4.706-.206-3.183-3.473.206-4.706 3.473-3.183z" />
									<path className="shield" fill="#FFF" stroke="#FFF" d="M3.527 11.132c.416.417.83.833 1.247 1.246.03.03.09.046.137.046 1.424.003 2.847.003 4.272 0a.245.245 0 0 0 .154-.064c1.009-1.004 2.015-2.011 3.02-3.02a.244.244 0 0 0 .067-.154c.004-1.428.003-2.856.002-4.285 0-.039-.01-.09-.034-.116-.418-.424-.839-.845-1.255-1.263l-7.61 7.61m-.577-.572l7.608-7.609c-.408-.408-.821-.824-1.24-1.237a.21.21 0 0 0-.134-.047 937.737 937.737 0 0 0-4.272 0 .241.241 0 0 0-.156.062 1000.334 1000.334 0 0 0-3.03 3.029.211.211 0 0 0-.059.131 1227.38 1227.38 0 0 0 0 4.31.17.17 0 0 0 .04.113c.416.421.835.84 1.243 1.248M13.2 7.053c0 .769-.003 1.536.002 2.304a.536.536 0 0 1-.168.412c-1.091 1.086-2.18 2.175-3.266 3.265a.527.527 0 0 1-.4.168 997.623 997.623 0 0 0-4.644 0 .53.53 0 0 1-.4-.166C3.237 11.942 2.145 10.85 1.05 9.76a.508.508 0 0 1-.16-.389C.892 7.824.892 6.276.889 4.727c0-.162.049-.286.163-.4 1.095-1.09 2.187-2.181 3.276-3.275.11-.11.23-.163.387-.163 1.553.003 3.105.003 4.658 0 .158 0 .278.05.388.161 1.093 1.097 2.188 2.191 3.285 3.285a.498.498 0 0 1 .156.377c-.004.78-.002 1.56-.002 2.341" />
								</g>
							</svg>
						)}
					</g>
				</svg>
			</span>
		</div>
	);
};
