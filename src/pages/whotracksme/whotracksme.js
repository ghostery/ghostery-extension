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

import { html, store } from 'hybrids';

import { HOME_PAGE_URL, WTM_PAGE_URL } from '/utils/urls.js';
import { shortDateFormatter, categories } from '/ui/labels.js';

import assets from '/pages/settings/assets/index.js';

import { MergedStats } from '/store/daily-stats.js';
import Session from '/store/session.js';

const MONTH_IN_MS = 30 * 24 * 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const now = Date.now();

function setDurationToLastMonth(host) {
  host.dateFrom = new Date(now - MONTH_IN_MS).toISOString().slice(0, 10);
  host.dateTo = new Date(now).toISOString().slice(0, 10);
}

function setDurationToYesterday(host) {
  host.dateFrom = new Date(now - DAY_IN_MS).toISOString().slice(0, 10);
  host.dateTo = host.dateFrom;
}

function toggleTrend(trend) {
  return (host) => {
    host.trends = host.trends.includes(trend)
      ? host.trends.filter((t) => t !== trend)
      : [...host.trends, trend];
  };
}

export default {
  dateFrom: '',
  dateTo: '',
  duration: {
    value: 'month',
    connect: setDurationToLastMonth,
    observe: (host, value) => {
      switch (value) {
        case 'month':
          setDurationToLastMonth(host);
          break;
        case 'yesterday':
          setDurationToYesterday(host);
          break;
      }
    },
  },
  mergedStats: store(MergedStats, {
    id: ({ dateFrom, dateTo }) => ({ dateFrom, dateTo }),
  }),
  session: store(Session),
  trends: { value: ['pages', 'trackersBlocked', 'trackersModified'] },
  trendsAggregate: 0,
  sankeyChartSlice: 20,
  render: ({
    duration,
    dateFrom,
    dateTo,
    mergedStats,
    session,
    trends,
    trendsAggregate,
    sankeyChartSlice,
  }) => html`
    <template layout>
      <main
        layout="column padding:2 gap:5 margin:0:auto width:::1120px"
        layout@768px:print="padding:4"
      >
        <section layout="relative column gap:2 margin:2:0:0">
          <header layout="row items:center gap:1.5" translate="no">
            <ui-icon name="wtm-border"></ui-icon>
            <div layout="column">
              <ui-text type="label-l" color="tertiary" uppercase>
                Ghostery
              </ui-text>
              <ui-text type="display-m">WhoTracks.Me</ui-text>
            </div>
          </header>
          <ui-text
            type="body-m"
            color="secondary"
            layout@768px:print="width:::75% margin:left:9"
          >
            This privacy report was generated by tracking the trackers in a
            browser protected by Ghostery. The statistics here provide
            transparency about web tracking. To learn more about how Ghostery
            keeps its community safe, visit
            ${html`<a href="${WTM_PAGE_URL}" translate="no">
              ghostery.com/whotracksme</a
            >`}.
          </ui-text>
          <div
            layout="column items:end gap"
            layout@768px:print="absolute top right"
          >
            <div layout="row content:end gap">
              <ui-button
                onclick="${window.print}"
                layout="hidden"
                layout@1120px="block"
              >
                <button>Print to PDF</button>
              </ui-button>
              <div layout="column" layout@print="hidden">
                ${duration !== 'custom' &&
                html`<ui-input layout="width::16">
                  <select
                    value="${duration}"
                    onchange="${html.set('duration')}"
                  >
                    <option value="month">Last Month</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="custom">Custom</option>
                  </select>
                </ui-input>`}
                ${duration === 'custom' &&
                html`
                  <div layout="row gap items:center">
                    <ui-input layout="width::16">
                      <input
                        type="date"
                        value="${dateFrom}"
                        max="${dateTo}"
                        onchange="${html.set('dateFrom')}"
                      />
                    </ui-input>
                    <ui-text>-</ui-text>
                    <ui-input layout="width::16">
                      <input
                        type="date"
                        value="${dateTo}"
                        min="${dateFrom}"
                        onchange="${html.set('dateTo')}"
                      />
                    </ui-input>
                  </div>
                `}
              </div>
            </div>
            <ui-text type="label-xs" color="tertiary" layout="margin:right">
              Date Range: ${shortDateFormatter.format(new Date(dateFrom))} -
              ${shortDateFormatter.format(new Date(dateTo))}
            </ui-text>
          </div>
        </section>
        ${store.error(mergedStats)}
        ${store.ready(mergedStats) &&
        html`
          <section layout="column gap:2">
            <div layout="column gap">
              <ui-text type="display-s">Facts</ui-text>
              <ui-text type="body-m" color="secondary">
                Provides an overview of the essential aspects of privacy
                protection.
              </ui-text>
            </div>
            <div
              layout="column gap:2"
              layout@768px="grid:2:2"
              layout@1024px:print="grid:4:1"
              layout@print="padding:0:1px"
            >
              <ui-card layout="column gap padding:2.5">
                <div layout="row items:center gap">
                  <ui-icon
                    name="websites"
                    color="wtm-secondary"
                    layout="size:6"
                  ></ui-icon>
                  <ui-text type="display-2xl">${mergedStats.pages}</ui-text>
                </div>
                <ui-text type="label-l" color="secondary">
                  Pages visited
                </ui-text>
              </ui-card>
              <ui-card layout="column gap padding:2.5">
                <div layout="row items:center gap">
                  <ui-icon
                    name="block-s"
                    color="danger-primary"
                    layout="size:6"
                  ></ui-icon>
                  <ui-text type="display-2xl">
                    ${mergedStats.trackersBlocked}
                  </ui-text>
                </div>
                <ui-text type="label-l" color="secondary">
                  Trackers blocked
                </ui-text>
              </ui-card>
              <ui-card layout="column gap padding:2.5">
                <div layout="row items:center gap">
                  <ui-icon
                    name="eye"
                    color="brand-primary"
                    layout="size:6"
                  ></ui-icon>
                  <ui-text type="display-2xl">
                    ${mergedStats.trackersModified}
                  </ui-text>
                </div>
                <ui-text type="label-l" color="secondary">
                  Trackers modified
                </ui-text>
              </ui-card>
              ${store.ready(mergedStats.groupedTrackers[0]) &&
              html`
                <ui-action>
                  <a
                    href="${WTM_PAGE_URL}/trackers/${mergedStats
                      .groupedTrackers[0].id}"
                    target="_blank"
                  >
                    <ui-card layout="column gap padding:2.5">
                      <div layout="row items:end gap">
                        <ui-category-icon
                          name="${mergedStats.groupedTrackers[0].category}"
                          size="large"
                        ></ui-category-icon>
                        <ui-text type="display-2xs" layout="row items:center">
                          ${mergedStats.groupedTrackers[0].name}
                          <ui-icon name="chevron-right-s"></ui-icon>
                        </ui-text>
                      </div>
                      <ui-text type="body-m" color="secondary">
                        was the most frequently observed tracker across all web
                        pages visited.
                      </ui-text>
                    </ui-card>
                  </a>
                </ui-action>
              `}
            </div>
          </section>
          <section layout="column gap:2:5" layout@1120px:print="grid:2:1">
            <div layout="column gap:3" layout@1120px:print="padding">
              <div layout="column gap:2">
                <ui-text type="display-s">Observed activities</ui-text>
                <ui-text type="body-m" color="secondary">
                  Reveals what's hidden beneath the internet’s surface. With
                  WhoTracks.Me, you can uncover the identities behind every
                  tracker.
                </ui-text>
              </div>
              <div layout="column" layout@768px:print="row gap:2">
                <ui-tracker-wheel
                  categories="${mergedStats.categories}"
                  layout="size:24 self:center margin:4"
                  layout@768px="self:start margin:2"
                ></ui-tracker-wheel>
                <div layout="column grow">
                  ${mergedStats.groupedCategories.map(
                    ({ id, count }) => html`
                      <ui-category
                        name="${id}"
                        count="${count}"
                        large
                      ></ui-category>
                    `,
                  )}
                </div>
              </div>
              <ui-pagination
                layout="column gap"
                layout@768px="grid:2"
                layout@1120px:print="grid:2:5 height::360px"
              >
                ${mergedStats.groupedTrackers.map(
                  ({ id, name, category }, index) => html`
                    <ui-action>
                      <a href="${WTM_PAGE_URL}/trackers/${id}" target="_blank">
                        <ui-card flat layout="padding row gap items:center">
                          <ui-text
                            type="label-s"
                            layout="block:center width::3"
                          >
                            ${index + 1}
                          </ui-text>
                          <div layout="grow width:0">
                            <ui-text type="label-m" ellipsis>${name}</ui-text>
                            <ui-text type="body-s" color="secondary">
                              ${categories[category]}
                            </ui-text>
                          </div>
                          <ui-category-icon
                            name="${category}"
                          ></ui-category-icon>
                        </ui-card>
                      </a>
                    </ui-action>
                  `,
                )}
              </ui-pagination>
            </div>
            <div layout="column gap:3" layout@1120px:print="padding">
              <div layout="column gap:2 relative">
                <ui-text type="display-s">Trends</ui-text>
                <ui-text type="body-m" color="secondary">
                  Uncovers that no two days are alike. With Ghostery, you’re
                  protected each day.
                </ui-text>
                <ui-input layout="absolute top:-1 right" layout@print="hidden">
                  <select
                    value="${trendsAggregate}"
                    onchange="${html.set('trendsAggregate')}"
                  >
                    <option value="0">Daily</option>
                    <option value="7">Weekly</option>
                    <option value="30">Monthly</option>
                  </select>
                </ui-input>
              </div>
              <div layout="grid:3">
                <whotracksme-button
                  active="${trends.includes('pages')}"
                  onclick="${toggleTrend('pages')}"
                >
                  <div layout="row items:center gap">
                    <ui-icon
                      name="websites"
                      color="wtm-secondary"
                      layout="size:2"
                    ></ui-icon>
                    <ui-text type="headline-s">${mergedStats.pages}</ui-text>
                  </div>
                  <ui-text type="label-xs" color="secondary">
                    Pages visited
                  </ui-text>
                </whotracksme-button>
                <whotracksme-button
                  active="${trends.includes('trackersBlocked')}"
                  onclick="${toggleTrend('trackersBlocked')}"
                >
                  <div layout="row items:center gap">
                    <ui-icon
                      name="block-s"
                      color="danger-primary"
                      layout="size:2"
                    ></ui-icon>
                    <ui-text type="headline-s">
                      ${mergedStats.trackersBlocked}
                    </ui-text>
                  </div>
                  <ui-text type="label-xs" color="secondary">
                    Trackers blocked
                  </ui-text>
                </whotracksme-button>
                <whotracksme-button
                  active="${trends.includes('trackersModified')}"
                  onclick="${toggleTrend('trackersModified')}"
                >
                  <div layout="row items:center gap">
                    <ui-icon
                      name="eye"
                      color="brand-primary"
                      layout="size:2"
                    ></ui-icon>
                    <ui-text type="headline-s">
                      ${mergedStats.trackersModified}
                    </ui-text>
                  </div>
                  <ui-text type="label-xs" color="secondary">
                    Trackers modified
                  </ui-text>
                </whotracksme-button>
              </div>
              <whotracksme-trends-chart
                dateFrom="${dateFrom}"
                dateTo="${dateTo}"
                trends="${trends}"
                aggregate="${trendsAggregate}"
                layout="grow"
              ></whotracksme-trends-chart>
            </div>
          </section>
          <section layout="column gap:3">
            <div layout="column gap:2 relative">
              <ui-text type="display-s">Tracker Database</ui-text>
              <ui-text type="body-m" color="secondary">
                Ghostery maps the ownership structure linking activities to the
                organizations controlling them. This knowledge, hand-curated by
                experts, is publicly available on
                <a
                  href="${'https://github.com/ghostery/trackerdb'}"
                  translate="no"
                  >Github</a
                >.
              </ui-text>
              ${mergedStats.groupedTrackers.length > 20 &&
              html`
                <ui-input layout="absolute top:-1 right" layout@print="hidden">
                  <select
                    value="${sankeyChartSlice}"
                    onchange="${html.set('sankeyChartSlice')}"
                  >
                    <option value="20">Top 20</option>
                    ${mergedStats.groupedTrackers.length > 20 &&
                    html`<option value="50">Top 50</option>`}
                    ${mergedStats.groupedTrackers.length > 50 &&
                    html`<option value="100">Top 100</option>`}
                  </select>
                </ui-input>
              `}
            </div>
            <whotracksme-sankey-chart
              dateFrom="${dateFrom}"
              dateTo="${dateTo}"
              slice="${sankeyChartSlice}"
            ></whotracksme-sankey-chart>
          </section>
          ${store.ready(session) &&
          !session.contributor &&
          html`
            <section
              layout="column center gap:2 padding:top:2"
              layout@print="hidden"
            >
              <img
                src="${assets['hands']}"
                layout="size:12"
                alt="Contribution"
                slot="picture"
              />
              <div layout="block:center column center gap:2 width:::400px">
                <div layout="column gap:0.5">
                  <ui-text type="headline-m">Become a Contributor</ui-text>
                  <ui-text type="body-s" color="secondary">
                    Help Ghostery fight for a web where privacy is a basic human
                    right.
                  </ui-text>
                </div>
                <ui-button type="primary">
                  <a
                    href="${HOME_PAGE_URL}/become-a-contributor?utm_source=wtmtab-becomeacontributor"
                    target="_blank"
                  >
                    Become a Contributor
                  </a>
                </ui-button>
              </div>
            </section>
          `}
          <section layout="block:center margin:2:auto:0 width:::960px">
            <ui-text type="body-s" color="secondary">
              All information displayed on the WhoTracks.Me Tab or
              ${html`<a href="${WTM_PAGE_URL}" translate="no"
                >ghostery.com/whotracksme</a
              >`}
              is an aggregate of facts about web trackers. These reports power
              Ghostery's anti-tracking technology, protecting the entire
              community.
            </ui-text>
          </section>
        `}
      </main>
    </template>
  `,
};
