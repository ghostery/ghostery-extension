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

import { html } from 'hybrids';

export default {
  render: () => html`
    <template layout="column height::100% width::375px">
      <header layout="row center self:stretch gap:2 height:100px">
        <ui-icon name="logo-full"></ui-icon>
        <ui-icon name="slogan"></ui-icon>
      </header>
      <div layout="grow row content:center margin:0:1:4">
        <div layout="column grow width:::375px">
          <slot></slot>
        </div>
      </div>
    </template>
  `.css`
    :host {
      background: no-repeat center -250px url("data:image/svg+xml,%3Csvg width='1648' height='1525' viewBox='0 0 1648 1525' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='1648' height='1524' transform='translate(0 0.495117)' fill='white'/%3E%3Cg filter='url(%23filter0_f_1866_5615)'%3E%3Cellipse cx='467.5' cy='443.995' rx='167.5' ry='143.5' fill='%23A1E4FF'/%3E%3C/g%3E%3Cg filter='url(%23filter1_f_1866_5615)'%3E%3Cellipse cx='923' cy='848.495' rx='225' ry='176' fill='%233751D5'/%3E%3C/g%3E%3Cdefs%3E%3Cfilter id='filter0_f_1866_5615' x='0' y='0.495117' width='935' height='887' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E%3CfeGaussianBlur stdDeviation='150' result='effect1_foregroundBlur_1866_5615'/%3E%3C/filter%3E%3Cfilter id='filter1_f_1866_5615' x='198' y='172.495' width='1450' height='1352' filterUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeFlood flood-opacity='0' result='BackgroundImageFix'/%3E%3CfeBlend mode='normal' in='SourceGraphic' in2='BackgroundImageFix' result='shape'/%3E%3CfeGaussianBlur stdDeviation='250' result='effect1_foregroundBlur_1866_5615'/%3E%3C/filter%3E%3C/defs%3E%3C/svg%3E%0A");
    }

    header {
      color: var(--ui-color-primary-500);
    }
   `,
};
