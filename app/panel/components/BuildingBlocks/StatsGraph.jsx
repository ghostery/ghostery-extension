/**
 * Stats Graph Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import * as D3 from 'd3';

/**
 * A Functional React component for rendering the Stats Graph
 * @return {JSX} JSX for rendering the Home View of the Hub app
 * @memberof PanelClasses
 */
class StatsGraph extends React.Component {
	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.generateGraph();
	}

	/**
	 * Generate line graph with the stats for the selected time slot
	 * Animate the graph whenever a render is triggered
	 * Add tooltips for each data point
	 */
	generateGraph() {
		// Add svg container
		const margin = {
			top: 20, right: 40, bottom: 20, left: 40
		};
		const width = 600 - margin.left - margin.right;
		const height = 400 - margin.top - margin.bottom;

		const canvas = D3.select(this.node).append('svg')
			.attr('class', 'line-graph')
			.attr('width', width + margin.left + margin.right)
			.attr('height', width + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// DUMMY DATA
		const data = [
			{ month: '05-2018', amount: 25 },
			{ month: '06-2018', amount: 19 },
			{ month: '07-2018', amount: 42 },
			{ month: '08-2018', amount: 50 },
			{ month: '09-2018', amount: 73 }
		];

		// Date formatting
		const parseMonth = D3.timeParse('%m-%Y');
		const formatLabelDate = D3.timeFormat("%b '%y");
		const formatTooltipDate = D3.timeFormat('%b %Y');

		data.forEach((entry) => {
			entry.month = parseMonth(entry.month);
		});

		// Set scales
		const x = D3.scaleTime()
			.range([0, width])
			.domain(D3.extent(data, d => d.month));

		const y = D3.scaleLinear()
			.range([height, 0])
			.domain([0, D3.max(data, d => d.amount)]);

		// Add axes
		const xAxis = D3.axisBottom()
			.ticks(6)
			.tickSize(0)
			.tickFormat(formatLabelDate)
			.scale(x);

		const yAxis = D3.axisLeft()
			.ticks(6)
			.tickSize(0)
			.scale(y);

		canvas.append('g')
			.attr('class', 'x axis')
			.attr('transform', `translate(0,${height})`)
			.call(xAxis);

		canvas.append('g')
			.attr('class', 'y axis')
			.call(yAxis);

		// Add grid
		function addGridlines() {
			return yAxis;
		}

		canvas.append('g')
			.attr('class', 'grid')
			.call(addGridlines()
				.tickSize(-width)
				.tickFormat('')
			);

		// Add data path
		const pathGroup = canvas.append('g').datum(data);

		const line = D3.line()
			.x(d => x(d.month))
			.y(d => y(d.amount));
		// .curve(D3.curveMonotoneX); // <-- Used on to smoothen data path

		// ---------------------------------------------------------------------- //
		// Animate data path using Mike Bostock's technique found here:
		// https://bl.ocks.org/mbostock/5649592
		// ---------------------------------------------------------------------- //
		function interpolator() {
			const l = this.getTotalLength();
			const i = D3.interpolateString(`0,${l}`, `${l},${l}`);
			return function (t) { return i(t); };
		}

		function animator(path) {
			path.transition()
				.duration(1000)
				.attrTween('stroke-dasharray', interpolator);
		}

		pathGroup.append('path')
			.style('stroke', '#dddddd')
			.style('stroke-dasharray', '4,4')
			.attr('d', line)
			.attr('fill', 'none');

		pathGroup.append('path')
			.attr('d', line)
			.attr('fill', 'none')
			.attr('stroke', '#124559')
			.attr('stroke-width', 1.5)
			.call(animator);
		// ---------------------------------------------------------------------- //

		// Add data points with event listeners for opening their respective tooltips
		canvas.append('g')
			.attr('class', 'point-group')
			.selectAll('circle')
			.data(data)
			.enter()
			.append('circle')
			.attr('class', (d, i) => `point point-${i}`)
			.attr('fill', '#124559')
			.attr('cx', d => x(d.month))
			.attr('cy', d => y(d.amount))
			.attr('r', 0)
			.on('click', function (d, i) {
				const that = this;
				setTimeout(() => {
					D3.select(that)
						.classed('selected', true)
						.attr('r', 6);
					D3.select(`.tooltip-${i}`)
						.transition()
						.duration(300)
						.style('opacity', 1);
				}, 1);
			});

		// Add a tooltip to each data point
		canvas.selectAll('circle')
			.each((d, i) => {
				let tooltipFlipped = false;
				let tooltipPositionX = x(d.month);
				let tooltipPositionY = y(d.amount) - 80;

				if (tooltipPositionY < height / 5) {
					tooltipFlipped = true;
					tooltipPositionY += 138;
					tooltipPositionX += 1;
				}

				const div = D3.select('body').append('div')
					.attr('class', `tooltip tooltip-${i}`)
					.style('opacity', 0)
					.style('left', `${tooltipPositionX}px`)
					.style('top', `${tooltipPositionY}px`);

				if (tooltipFlipped) {
					div.append('div')
						.attr('class', 'pointer top under');
					div.append('div')
						.attr('class', 'pointer top over');
				}

				div.append('p')
					.attr('class', 'tooltip-text-top')
					.html(`${formatTooltipDate(d.month)}<br/>Ads Blocked`);
				div.append('p')
					.attr('class', 'tooltip-text-bottom')
					.html(d.amount);

				if (!tooltipFlipped) {
					div.append('div')
						.attr('class', 'pointer bottom under');
					div.append('div')
						.attr('class', 'pointer bottom over');
				}
			});

		// Add event listener to container for closing tooltip
		D3.select('.line-graph')
			.on('click', () => {
				if (D3.event.target.className.baseVal !== 'point' &&
				D3.event.target.className !== 'tooltip') {
					D3.selectAll('.selected')
						.classed('selected', false)
						.attr('r', 4.5);
					D3.selectAll('.tooltip').transition()
						.duration(200)
						.style('opacity', 0);
				}
			});

		// Animate data points
		canvas.selectAll('circle')
			.each(function (d, i) {
				D3.select(this).transition()
					.duration(700)
					.delay(i * 150)
					.attr('r', 4.5);
			});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the donut-graph portion of the Summary View
	 */
	render() {
		return (
			<div className="graph-ref" ref={(node) => { this.node = node; }} />
		);
	}
}

export default StatsGraph;
