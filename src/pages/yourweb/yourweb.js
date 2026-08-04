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

import { numberFormatter } from '/ui/labels.js';

import assets from './assets/index.js';

// PLACEHOLDER DATA — replaced with the local stats store (same source as
// pages/whotracksme) once the data contract is confirmed by engineering.
const FAKE_STATS = [
  {
    key: 'observed',
    value: 18230,
    label: 'Activities observed',
    desc: 'You saw what was really happening under every page you opened.',
  },
  {
    key: 'blocked',
    value: 14050,
    label: 'Trackers blocked',
    desc: 'You browsed \u2014 Ghostery kept these from reaching you.',
  },
  {
    key: 'websites',
    value: 3932,
    label: 'Pages visited',
    desc: 'Ghostery stayed with you the whole way.',
  },
  {
    key: 'cookies',
    value: 1204,
    label: 'Cookies removed',
    desc: 'Cleared quietly, so your web stayed yours.',
  },
  {
    key: 'consent',
    value: 87,
    label: 'Consent requests handled',
    desc: 'Pop-ups you never had to see',
  },
  {
    key: 'modified',
    value: 0,
    label: 'Trackers modified',
    desc: 'Pages still work \u2013 but trackers learn nothing about you',
  },
];

const FAKE_TOP_TRACKERS = [
  {
    name: 'Google Tag',
    category: 'advertising',
    url: 'https://www.ghostery.com/whotracksme/trackers/google_tag',
  },
  {
    name: 'Facebook Connect',
    category: 'site_analytics',
    url: 'https://www.ghostery.com/whotracksme/trackers/facebook_connect',
  },
  {
    name: 'Pinterest Conversion Tracker',
    category: 'advertising',
    url: 'https://www.ghostery.com/whotracksme/trackers/pinterest_conversion_tracker',
  },
];

// Design rules from Figma dev notes: the biggest metric always leads,
// metrics at 0 are dropped entirely.
function visibleStats() {
  return FAKE_STATS.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
}

function format(value) {
  // Placeholder rendering: keep realistic digit widths but make it obvious
  // the numbers are not real yet (until the data store is wired up).
  return numberFormatter.format(value).replace(/\d/g, '0');
}

export default {
  stats: { value: visibleStats },
  render: ({ stats }) => html`
    <template layout="column">
      <header class="yw-header">
        <div class="yw-rings"></div>
        <img class="yw-logo" src="${assets['logo-ondark']}" alt="Ghostery" />
        <img class="yw-badge" src="${assets['header-badge']}" alt="" />
        <div class="yw-header-copy">
          <h1>Your web, lately</h1>
          <p>
            The cleaner, calmer web you’ve been building &ndash; with Ghostery quietly handling the
            rest.
          </p>
        </div>
        <div class="yw-wave yw-wave-flow"></div>
      </header>

      <section class="yw-facts">
        <div class="yw-fact-card">
          <img class="yw-fact-icon" src="${assets['fact-protection']}" alt="" />
          <p>
            <strong>00,000 trackers</strong> stopped before they reached you &ndash; and
            that&rsquo;s not even the biggest number below
          </p>
        </div>
        <div class="yw-fact-card">
          <img class="yw-fact-icon" src="${assets['fact-organization']}" alt="" />
          <p>
            The companies that <strong>wanted your data</strong>, named (you&rsquo;ll recognise a
            few)
          </p>
        </div>
        <div class="yw-fact-card">
          <img class="yw-fact-icon yw-fact-icon-wide" src="${assets['fact-zap']}" alt="" />
          <p>
            The <strong>one-click way</strong> to give someone the same <strong>quiet web</strong>,
            with Ghostery Zap
          </p>
        </div>
        <div class="yw-fact-card">
          <img class="yw-fact-icon" src="${assets['fact-block-ads']}" alt="" />
          <p>A new way to <strong>make pages calmer</strong> that isn&rsquo;t about ads</p>
        </div>
      </section>

      <section class="yw-impact">
        <h2>Your impact</h2>
        <p class="yw-supporting">The web you built &ndash; by the numbers (Last 3 months)</p>
        <div class="yw-impact-cards">
          ${stats.map(
            (stat, index) => html`
              <div class="${index === 0 ? 'yw-impact-card yw-impact-card-lead' : 'yw-impact-card'}">
                <div class="yw-impact-head">
                  <span class="yw-impact-icon-tile">
                    ${
                      stat.key === 'consent'
                        ? html`<ui-icon
                            class="yw-impact-icon yw-impact-icon-consent"
                            name="autoconsent-managed"
                          ></ui-icon>`
                        : html`<img
                            class="yw-impact-icon"
                            src="${assets[`impact-${stat.key}`]}"
                            alt=""
                          />`
                    }
                  </span>
                  <span class="yw-impact-value">${format(stat.value)}</span>
                </div>
                <div class="yw-impact-text">
                  <h3>${stat.label}</h3>
                  <p>${stat.desc}</p>
                </div>
              </div>
            `,
          )}
        </div>
      </section>

      <section class="yw-trackers">
        <h2>Who wanted your data?</h2>
        <p class="yw-supporting">
          While you browsed, Ghostery kept watch on these &ndash; and shut them out.
        </p>
        <div class="yw-tracker-cards">
          ${FAKE_TOP_TRACKERS.map(
            (tracker) => html`
              <a
                class="yw-tracker-card"
                href="${tracker.url}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ui-category-icon
                  class="yw-tracker-icon"
                  name="${tracker.category}"
                ></ui-category-icon>
                <div class="yw-tracker-text">
                  <h3>${tracker.name}</h3>
                  <p>${tracker.category.replace('_', ' ')}</p>
                </div>
                <img class="yw-tracker-arrow" src="${assets['icon-top-right']}" alt="" />
              </a>
            `,
          )}
        </div>
      </section>

      <section class="yw-feature">
        <div class="yw-feature-card">
          <span class="yw-feature-media">
            <img
              class="yw-feature-illustration yw-light"
              src="${assets['feature-browse']}"
              alt=""
            />
            <img
              class="yw-feature-illustration yw-dark"
              src="${assets['feature-browse-dark']}"
              alt=""
            />
          </span>
          <div class="yw-feature-copy">
            <h2>You browse with intention</h2>
            <p>
              This didn’t happen by accident. Every day you chose a calmer, more private web &ndash;
              and Ghostery made those choices easy to keep.
            </p>
            <p>Better habits make a better web.</p>
          </div>
        </div>
      </section>

      <section class="yw-zap">
        <div class="yw-rings"></div>
        <div class="yw-wave yw-wave-top"></div>
        <div class="yw-zap-inner">
          <h2>Share a calmer web</h2>
          <p class="yw-zap-desc">
            Someone in your life still puts up with ads, tracking and clutter. You can hand them the
            same quiet web you built &ndash; Ghostery makes the setup one tap.
          </p>
        </div>
        <div class="yw-wave"></div>
      </section>

      <section class="yw-zap-steps">
        <h2 class="yw-zap-steps-title">Teach them these 3 steps to block ads with Ghostery Zap</h2>
        <div class="yw-zap-steps-box">
          <div class="yw-zap-step">
            <img class="yw-zap-illustration yw-light" src="${assets['zap-flow-1']}" alt="" />
            <img class="yw-zap-illustration yw-dark" src="${assets['zap-flow-1-dark']}" alt="" />
            <p class="yw-zap-step-label">Step 1</p>
            <h3>Visit a site</h3>
            <p>Open any website where ads get in the way</p>
          </div>
          <div class="yw-zap-step">
            <img class="yw-zap-illustration yw-light" src="${assets['zap-flow-2']}" alt="" />
            <img class="yw-zap-illustration yw-dark" src="${assets['zap-flow-2-dark']}" alt="" />
            <p class="yw-zap-step-label">Step 2</p>
            <h3>Click &ldquo;Zap Ads!&rdquo;</h3>
            <p>One click instantly blocks ads across the entire site, not just this page</p>
          </div>
          <div class="yw-zap-step">
            <img class="yw-zap-illustration yw-light" src="${assets['zap-flow-3']}" alt="" />
            <img class="yw-zap-illustration yw-dark" src="${assets['zap-flow-3-dark']}" alt="" />
            <p class="yw-zap-step-label">Step 3</p>
            <h3>Stay ad-free</h3>
            <p>The choice is saved, so it stays clean every visit</p>
          </div>
          <div class="yw-zap-step-mini">
            <img class="yw-zap-illustration-mini yw-light" src="${assets['zap-flow-4']}" alt="" />
            <img
              class="yw-zap-illustration-mini yw-dark"
              src="${assets['zap-flow-4-dark']}"
              alt=""
            />
            <p>Repeat for most visited websites</p>
          </div>
        </div>
        <div class="yw-share">
          <h3>Help them install Ghostery</h3>
          <p>Select your friend&rsquo;s browser</p>
          <div class="yw-share-browsers">
            <img class="yw-light" src="${assets['browser-chrome']}" alt="Chrome" />
            <img class="yw-dark" src="${assets['browser-chrome-dark']}" alt="Chrome" />
            <img class="yw-light" src="${assets['browser-firefox']}" alt="Firefox" />
            <img class="yw-dark" src="${assets['browser-firefox-dark']}" alt="Firefox" />
            <img class="yw-light" src="${assets['browser-safari']}" alt="Safari" />
            <img class="yw-dark" src="${assets['browser-safari-dark']}" alt="Safari" />
            <img class="yw-light" src="${assets['browser-brave']}" alt="Brave" />
            <img class="yw-dark" src="${assets['browser-brave-dark']}" alt="Brave" />
            <img class="yw-light" src="${assets['browser-edge']}" alt="Edge" />
            <img class="yw-dark" src="${assets['browser-edge-dark']}" alt="Edge" />
            <img class="yw-light" src="${assets['browser-opera']}" alt="Opera" />
            <img class="yw-dark" src="${assets['browser-opera-dark']}" alt="Opera" />
          </div>
        </div>
      </section>

      <section class="yw-distractions">
        <img class="yw-distractions-image" src="${assets['distractions-hero']}" alt="" />
        <h2>Remove distractions</h2>
        <p>Ads aren’t the only thing competing for your attention.</p>
        <p>
          Now you can hide sign-in prompts, short-video feeds, social widgets and the rest of the
          noise &ndash; Ghostery clears them so your pages stay focused on what you came for.
        </p>
        <p>A calmer web isn’t only about privacy. It’s about attention too.</p>
        <!-- Shown only when a Remove-Distractions-supported site is in the
             user's history (per design dev note); hidden otherwise. Wiring
             comes with the data contract — placeholder example for now. -->
        <div class="yw-distractions-spotted">
          <ui-icon class="yw-distractions-spotted-icon" name="hide-element"></ui-icon>
          <div>
            <p class="yw-distractions-spotted-label">
              Ghostery already spotted a page where this could help:
            </p>
            <div class="yw-distractions-spotted-site">example.com</div>
          </div>
        </div>
        <a
          class="yw-button"
          href="https://www.ghostery.com/blog/distractions-remove-UI-clutter"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn to Remove Distractions
        </a>
      </section>

      <footer class="yw-footer">
        <div class="yw-rings"></div>
        <div class="yw-wave yw-wave-top"></div>
        <img class="yw-footer-icon" src="${assets['footer-badge']}" alt="" />
        <h2>Thanks for being part of Ghostery</h2>
        <p>
          Every cleaner, calmer page is one you chose &ndash; and Ghostery is glad to be along for
          it.
          <br />
          Thanks for making the web a little better.
        </p>
      </footer>
    </template>
  `,
};
