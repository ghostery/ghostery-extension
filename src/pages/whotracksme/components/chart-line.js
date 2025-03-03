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
import Plotly from 'plotly.js-basic-dist';

import Stats from '/store/daily-stats.js';

const TRACE_COLORS = {
  'pages': '--component-chart-line-observed',
  'trackersBlocked': '--component-chart-line-blocked',
  'trackersModified': '--component-chart-line-modified',
};

export default {
  dateFrom: '',
  dateTo: '',
  stats: store([Stats], {
    id: ({ dateFrom, dateTo }) => ({ dateFrom, dateTo }),
  }),
  trends: { value: [] },
  data: {
    value: ({ stats, trends }) => {
      if (!store.ready(stats) || store.pending(stats)) return undefined;

      return stats.length
        ? trends.map((key) => ({
            name: key,
            x: stats.map(({ day }) => day),
            y: stats.map(({ [key]: value }) => value),
            type: 'scatter',
            mode: 'lines',
            text: stats.map(({ day, [key]: value }) => `${day} - ${value}`),
            hoverinfo: 'text',
          }))
        : [];
    },
    connect(host, _, invalidate) {
      const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
      matchMedia.addEventListener('change', invalidate);

      return () => matchMedia.removeEventListener('change', invalidate);
    },
    observe(host, data) {
      // pending state
      if (data === undefined) return;

      const chart = host.render().querySelector('#chart');

      // clean previous chart
      Plotly.purge(chart);

      // Let the rest of the page layout to fill-in before rendering the chart
      // so the responsive layout can calculate the correct size.
      window.requestAnimationFrame(() => {
        const computedStyle = window.getComputedStyle(host);

        Plotly.newPlot(
          chart,
          data.map((trace) => {
            trace.line = {
              color: computedStyle.getPropertyValue(TRACE_COLORS[trace.name]),
              width: 2,
            };
            return trace;
          }),
          {
            dragmode: false,
            autosize: true,
            margin: { b: 0, l: 0, r: 0, t: 0, pad: 20 },
            showlegend: false,
            yaxis: {
              fixedrange: true,
              automargin: true,
              color: computedStyle.getPropertyValue('--color-tertiary'),
              gridcolor: computedStyle.getPropertyValue('--border-primary'),
              zerolinecolor: computedStyle.getPropertyValue('--border-primary'),
              tickfont: { size: 10, family: 'Inter' },
            },
            xaxis: {
              fixedrange: true,
              automargin: true,
              showgrid: false,
              showline: false,
              zeroline: false,
              ticklabelposition: 'outside',
              tickfont: { size: 10, family: 'Inter' },
              color: computedStyle.getPropertyValue('--color-tertiary'),
            },
            bargap: 0.4,
            hoverlabel: {
              font: { family: 'Inter', size: 12 },
            },
            template: {
              layout: {
                paper_bgcolor: 'transparent',
                plot_bgcolor: 'transparent',
              },
            },
          },
          { displayModeBar: false, responsive: true },
        );
      });
    },
  },
  render: () =>
    html`<template layout="grid">
      <div id="chart"></div>
    </template>`,
};
