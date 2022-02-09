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

import { html, define } from '/hybrids.js';
import { t } from '/vendor/@whotracksme/ui/src/i18n.js';

export default define({
  tag: 'gh-panel-layout',
  render: () => html`
    <slot name="header"></slot>
    <section id="content"><slot></slot></section>
    <footer>
      <a href="https://www.ghostery.com/support" target="_blank">
        ${t('panel_menu_report_broken_site')}
      </a>
      <a
        href="https://www.ghostery.com/submit-a-tracker"
        target="_blank"
        class="subscribe"
        >${t('panel_menu_submit_tracker')}</a
      >
    </footer>
  `.css`
    :host {
      display: flex;
      flex-flow: column nowrap;
      min-height: 100%;
      width: 100%;
      min-width: 375px;
    }

    @media only screen and (min-height: 346px) {
      :host {
        height: 100%;
      }
    }

    #content {
      flex: 1 1 auto;
      padding: 12px;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      box-sizing: border-box;
    }

    footer {
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 9px 12px;
      font-size: 11.5px;
    }
    
    footer a {
      cursor: pointer;
      text-align: left;
    }

    footer a:last-child {
      text-align: right;
    }
    
    footer .dot {
      margin: 0 5px;
    }
    
    footer a,
    footer a:visited {
      text-decoration: none;
      color: var(--text);
    }
    
    footer .subscribe {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      flex-grow: 1;
    }
    
    footer .subscribe svg {
      margin-left: 10px;
      margin-right: 3px;
      width: 13px;
      height: 13px;
    }
  `,
});
