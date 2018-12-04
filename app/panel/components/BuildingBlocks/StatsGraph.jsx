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
	componentDidUpdate() {
		this.generateGraph();
	}

	/**
	 * Generate line graph with the stats for the selected time slot
	 * Animate the graph whenever a render is triggered
	 * Add tooltips for each data point
	 */
	generateGraph() {
		// Clear graph
		D3.select(this.node).selectAll('*').remove();
		D3.select('.tooltip-container').selectAll('*').remove();

		// Add svg
		const margin = {
			top: 18, right: 40, bottom: 20, left: 70
		};
		const width = 560 - margin.left - margin.right;
		const height = 290 - margin.top - margin.bottom;

		const canvas = D3.select(this.node).append('svg')
			.attr('class', 'line-graph')
			.attr('width', width + margin.left + margin.right)
			.attr('height', width + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left},${margin.top})`);

		// Date formatting
		const parseMonth = D3.timeParse('%Y-%m-%d');

		let formatLabelDate;
		let formatTooltipDate;
		if (this.props.dailyOrMonthly === 'daily') {
			formatLabelDate = D3.timeFormat('%b %d');
			formatTooltipDate = D3.timeFormat('%b %d, %Y');
		} else {
			formatLabelDate = D3.timeFormat("%b '%y");
			formatTooltipDate = D3.timeFormat('%b %Y');
		}

		const data = JSON.parse(JSON.stringify(this.props.data));
		data.forEach((entry) => {
			entry.date = parseMonth(entry.date);
		});

		let tickAmount;
		switch (data.length) {
			case 0:
			case 1:
			case 6:
				tickAmount = data.length;
				break;
			case 2:
			case 3:
			case 4:
			case 5:
				tickAmount = data.length - 1;
				break;
			default:
				tickAmount = 6;
		}

		// Set scales
		const x = D3.scaleTime()
			.range([0, width])
			.domain(D3.extent(data, d => d.date));

		const y = D3.scaleLinear()
			.range([height, 0]);
		// ~ Handle axis styling for edge case of only one data point ~
		if (data.length === 1) {
			y.domain([0, D3.max(data, d => d.amount) * 2]);
		} else {
			y.domain(D3.extent(data, d => d.amount));
		}

		// Add axes
		const xAxis = D3.axisBottom()
			.ticks(tickAmount)
			.tickSize(0)
			.tickFormat(formatLabelDate)
			.scale(x);

		const yAxis = D3.axisLeft()
			.ticks(6)
			.tickSize(0)
			// .tickFormat(D3.format('.2s')) <-- Uncomment to abbreviate y-axis labels
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
			.x(d => x(d.date))
			.y(d => y(d.amount));
			// .curve(D3.curveMonotoneX); // <-- Uncomment to smoothen data path

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
			// .attr('stroke', '#00AEF0')
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
			// .attr('fill', '#00AEF0')
			.attr('cx', d => x(d.date))
			.attr('cy', d => y(d.amount))
			.attr('r', 0)
			.on('click', function (d, i) {
				setTimeout(() => {
					D3.select(this)
						.classed('selected', true)
						.attr('r', 6);
					D3.select(`.tooltip-${i}`)
						.classed('clicked', true)
						.transition()
						.duration(300)
						.style('opacity', 1);
				}, 1);
			})
			.on('mouseenter', function (d, i) {
				setTimeout(() => {
					D3.select(this)
						.classed('selected', true)
						.attr('r', 6);
					D3.select(`.tooltip-${i}`)
						.transition()
						.duration(300)
						.style('opacity', 1);
				}, 1);
			})
			.on('mouseleave', function (d, i) {
				if (!D3.select(`.tooltip-${i}`).classed('clicked')) {
					setTimeout(() => {
						D3.select(this)
							.classed('selected', false)
							.attr('r', 4.5);
						D3.select(`.tooltip-${i}`)
							.transition()
							.duration(200)
							.style('opacity', 0);
					}, 1);
				}
			});

		// Add a tooltip to each data point
		canvas.selectAll('circle')
			.each((d, i) => {
				let tooltipFlipped = false;
				let tooltipPositionX = x(d.date) + 22.5;
				let tooltipPositionY = Math.ceil(y(d.amount) - 12);

				if (tooltipPositionY < height / 2.5) {
					tooltipFlipped = true;
					tooltipPositionY += 130;
					tooltipPositionX += 0;
				} else if (this.props.view === 'trackersAnonymized') {
					tooltipPositionY -= 16;
				}

				const div = D3.select('.tooltip-container')
					.append('div')
					.attr('class', `tooltip tooltip-${i}`)
					.style('opacity', 0)
					.style('left', `${tooltipPositionX}px`)
					.style('top', `${tooltipPositionY}px`);

				if (this.props.view === 'trackersAnonymized') {
					div.classed('long-text', true);
				}

				if (tooltipFlipped) {
					div.append('div')
						.attr('class', 'pointer top under');
					div.append('div')
						.attr('class', 'pointer top over');
				}

				div.append('p')
					.attr('class', 'tooltip-text-top')
					.html(`${formatTooltipDate(d.date)}<br/>${this.props.tooltipText}`);
				div.append('p')
					.attr('class', 'tooltip-text-bottom')
					.html(D3.format(',')(d.amount));

				if (!tooltipFlipped) {
					div.append('div')
						.attr('class', 'pointer bottom under');
					div.append('div')
						.attr('class', 'pointer bottom over');
				}
			});

		// Add event listener to container for closing tooltip
		D3.select('#content-stats')
			.on('click', () => {
				if (D3.event.target.className.baseVal !== 'point' &&
				D3.event.target.className !== 'tooltip') {
					D3.selectAll('.selected')
						.classed('selected', false)
						.attr('r', 4.5);
					D3.selectAll('.tooltip')
						.classed('clicked', false)
						.transition()
						.duration(200)
						.style('opacity', 0);
				}
			});

		let additionalSeconds = 0;

		// Animate data points
		canvas.selectAll('circle')
			.each(function (d, i) {
				D3.select(this)
					.transition()
					.duration(700)
					.delay(i * 130 + additionalSeconds)
					.attr('r', 4.5);
				additionalSeconds += 20;
			});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the donut-graph portion of the Summary View
	 */
	render() {
		return (
			<div className="line-graph-container">
				<div className="line-graph-ref" ref={(node) => { this.node = node; }} />
				<div className="tooltip-container" />
				<div
					id="stats-back"
					className={`caret ${this.props.timeframeSelectors.back}`}
					onClick={this.props.selectTimeframe}
				/>
				<div
					id="stats-forward"
					className={`caret ${this.props.timeframeSelectors.forward}`}
					onClick={this.props.selectTimeframe}
				/>
			</div>
		);
	}
}

export default StatsGraph;
