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

import { define, html, router } from 'hybrids';

const PRIVACY_POLICY_URL = `https://www.${
  chrome.runtime.getManifest().debug ? 'ghosterystage' : 'ghostery'
}.com/privacy-policy`;

function scrollToAnchor(host, event) {
  let anchor = event.target;
  while (anchor && !anchor.href) {
    anchor = anchor.parentElement;
  }

  if (anchor && anchor.host === window.location.host && anchor.hash) {
    event.preventDefault();
    event.stopPropagation();

    const target = host.shadowRoot.getElementById(anchor.hash.substr(1));
    target.scrollIntoView({ behavior: 'smooth' });
  }
}

export default define({
  [router.connect]: { dialog: true },
  tag: 'ui-onboarding-privacy-dialog',
  policy: () =>
    fetch(`${PRIVACY_POLICY_URL}?embed=true`).then((res) => {
      if (res.ok) {
        return res.text();
      }

      throw new Error('Failed to load privacy policy');
    }),
  render: ({ policy }) => html`
    <ui-onboarding-dialog>
      <ui-text slot="header" type="headline-m">
        Ghostery Privacy Policy
      </ui-text>
      <div>
        ${html.resolve(
          policy
            .then(
              (policy) =>
                html`<div
                  id="policy"
                  onclick="${scrollToAnchor}"
                  innerHTML="${policy}"
                ></div>`,
            )
            .catch(
              () =>
                html`<ui-text type="body-s">
                  For more information read our full
                  <a href="${PRIVACY_POLICY_URL}" target="_blank"
                    >privacy policy</a
                  >.
                </ui-text>`,
            ),
        )}
      </div>
      <ui-button slot="footer">
        <a href="${router.backUrl()}">Done</a>
      </ui-button>
    </ui-onboarding-dialog>
  `.css`
    #policy { min-height: 100vh; }
    #policy h1 { display: none }
    #policy h3, #policy .side-menu .cap { font: var(--ui-font-headline-s); font-weight: 400; color: var(--ui-color-gray-800); margin: 16px 0; }
    #policy .side-menu .cap { font: var(--ui-font-headline-s); }
    #policy ul { list-style: none; padding: 0; margin: 16px 0; }
    #policy ul li { font: var(--ui-font-body-m); margin: 0; }
    #policy ul li a { text-decoration: none }
    #policy p { font: var(--ui-font-body-m); margin: 16px 0; }
    #policy a { color: var(--ui-color-gray-800); font-weight: bold; }
    #policy code { white-space: initial; }

    #policy .breadcrumb, #policy h2, #policy ul li.child { display: none }
  `,
});
