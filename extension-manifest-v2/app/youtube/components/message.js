/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { define, html, dispatch } from 'hybrids';

export default define({
	tag: 'youtube-message',
	content: () => html`
		<template layout="block overflow">
			<ui-onboarding-card layout="padding:2">
				<div layout="row items:start gap:2">
					<div layout="relative">
						<ui-icon name="ghosty" color="gray-300" layout="size:4"></ui-icon>
						<ui-icon
							name="alert"
							color="error-500"
							layout="absolute bottom:-1 right:-1"
						></ui-icon>
					</div>
					<div layout="column gap:1.5">
						<div layout="margin:bottom:-1 row">
							<ui-text type="label-xl">
								YouTube blocking you from watching ad-free videos?
							</ui-text>
							<ui-action>
								<button
									id="close"
									onclick="${host => dispatch(host, 'close')}"
									layout="margin:-1 self:start shrink:0 padding"
								>
									<div layout="row center size:3">
										<ui-icon name="close" color="gray-400" layout="size:3"></ui-icon>
									</div>
								</button>
							</ui-action>
						</div>
						<ui-text type="body-m">
							We know you rely on Ghostery for a smooth YouTube experience.
							Until a more refined solution emerges, here’s a temporary fix.
						</ui-text>
							<div layout="column gap">
								<div layout="row gap:0.5">
									<ui-text type="label-s" translate="no">1.</ui-text>
									<ui-text type="label-s">
										Allow Ghostery in private windows
									</ui-text>
								</div>
								<div layout="row">
									<ui-button type="outline" size="small">
										<button
											onclick="${host => dispatch(host, 'openblog1')}"
										>
											Learn how
										</button>
									</ui-button>
								</div>
							</div>
							<div layout="column gap">
								<div layout="row gap:0.5">
									<ui-text type="label-s" translate="no">2.</ui-text>
									<ui-text type="label-s">
										Open YouTube in a private window
									</ui-text>
								</div>
								<div layout="row">
									<ui-button type="success" size="small">
										<button
											onclick="${host => dispatch(host, 'openprivatewindow')}"
										>
											Open video
										</button>
									</ui-button>
								</div>
						</div>
						<div class="hr"></div>
						<div layout="column gap:1">
							<ui-text type="body-m">
								Learn more about YouTube’s challenges to ad blockers
							</ui-text>
							<div layout="row:wrap gap">
								<ui-button type="outline" size="small">
									<button onclick="${host => dispatch(host, 'openblog2')}">
										Visit our blog
									</button>
								</ui-button>
								<ui-button type="transparent" size="small">
									<button onclick="${host => dispatch(host, 'dontask')}">
										<ui-text>Don't ask again</ui-text>
									</button>
								</ui-button>
							</div>
						</div>
					</div>
				</div>
			</ui-onboarding-card>
		</template>
	`.css`
		.hr {
			background: #D4D6D9;
			height: 1px;
			align-self: stretch;
		}
	`,
});
