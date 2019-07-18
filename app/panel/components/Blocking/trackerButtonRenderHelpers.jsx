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

export const renderUnknownTrackerButtons = (handleAntiTrackingWhitelist, whitelisted) => {
	const svgContainerClasses = ClassNames('unknown-svg-container', { whitelisted });

	return (
		<div className={svgContainerClasses}>
			{/* USE INLINE SVG FOR TRUST CIRCLE TO CHANGE COLORS WITH CSS */}
			<span className="t-tooltip-up-left" data-g-tooltip="Trust on this site">
				<svg className="anti-track-trust" onClick={handleAntiTrackingWhitelist} width="20px" height="20px" viewBox="0 0 20 20">
					<g transform="translate(1 1)" fill="none" fillRule="evenodd">
						<path className="border" stroke="#96c761" d="M-.5-.5h18.3v18.217H-.5z" />
						<path className="background" stroke="#FFF" fill="#96c761" d="M.5.5h16.3v16.217H.5z" />
						<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
							<circle className="trust-circle" stroke="#FFF" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
						</svg>
					</g>
				</svg>
			</span>

			{/* USE INLINE SVG FOR ANTI-TRACKING SHIELD TO CHANGE COLORS WITH CSS */}
			<span className="t-tooltip-up-left" data-g-tooltip="Scrub on this site">
				<svg className="anti-track-scrub" onClick={handleAntiTrackingWhitelist} width="20px" height="20px" viewBox="0 0 20 20">
					<g transform="translate(1 1)" fill="none" fillRule="evenodd">
						<path className="border" stroke="#00AEF0" d="M-.5-.5h18.3v18.217H-.5z" />
						<path className="background" stroke="#FFF" fill="#00AEF0" d="M.5.5h16.3v16.217H.5z" />
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 19.5 19.5">
							<g transform="translate(2.5 2.5)">
								<path className="shield" fill="none" fillRule="evenodd" stroke="#FFF" strokeWidth="1.4" d="M8.149 1.022a.505.505 0 0 0-.298 0l-6.404 1.7A.574.574 0 0 0 1 3.286c.03 4.56 2.472 8.792 6.672 11.624.09.06.209.089.328.089.12 0 .238-.03.328-.09 4.2-2.83 6.642-7.063 6.672-11.623a.574.574 0 0 0-.447-.566L8.15 1.022z" />
							</g>
						</svg>
					</g>
				</svg>
			</span>
		</div>
	);
};
