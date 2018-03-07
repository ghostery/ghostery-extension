/**
 * Donut Graph Component
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

import React, { Component } from 'react';
import * as d3 from 'd3';
import { scaleLinear } from 'd3-scale';
/**
 * @class Generate donut graph with tracker data in the Summary view.
 * @memberOf PanelClasses
 */
class DonutGraph extends React.Component {
	constructor(props) {
		super(props);

		// event bindings
		this.clickTrackersAll = this.clickTrackersAll.bind(this);
		this.colors = {
			regular: (id) => {
				switch (id) {
					case 'advertising':
						return '#cb55cd';
					case 'audio_video_player':
						return '#ef671e';
					case 'comments':
						return '#43b7c5';
					case 'customer_interaction':
						return '#fdc257';
					case 'essential':
						return '#fc9734';
					case 'pornvertising':
						return '#ecafc2';
					case 'site_analytics':
						return '#87d7ef';
					case 'social_media':
						return '#388ee8';
					default:
						return '#e8e8e8';
				}
			},
			restricted: scaleLinear().range(['#f75065', '#ffb0Ba']),
			paused: scaleLinear().range(['#848484', '#c9c9c9']),
		};
	}
	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		const {
			categories, sitePolicy, pausedBlocking, trackerCounts, isExpert
		} = this.props;
		this.generateGraph(categories, {
			sitePolicy,
			pausedBlocking,
			trackerCounts,
			isExpert,
		});
	}
	/**
	 * Lifecycle event
	 */
	componentWillReceiveProps(nextProps) {
		const {
			categories, sitePolicy, pausedBlocking, trackerCounts, isExpert
		} = this.props;
		if (categories.length !== nextProps.categories.length ||
			sitePolicy !== nextProps.sitePolicy ||
			pausedBlocking !== nextProps.pausedBlocking ||
			isExpert !== nextProps.isExpert) {
			this.generateGraph(nextProps.categories, {
				sitePolicy: nextProps.sitePolicy,
				pausedBlocking: nextProps.pausedBlocking,
				trackerCounts: nextProps.trackerCounts,
				isExpert: nextProps.isExpert,
			});
		}
	}
	/**
	 * Generate donut-shaped graph with the scanning results. Add mouse event listeners
	 * to the parts of the created donut which would navigate to the corresponding
	 * tracker category in the blocking view.
	 * @param  {Object} categories 		list of categories detected on the site
	 * @param  {Object} options	        site policy, paused state, stats of the scanning
	 */
	generateGraph(categories, options) {
		const { sitePolicy, pausedBlocking } = options;
		const graphData = [];
		const trackerCounts = options.trackerCounts || {};
		const trackerCount = trackerCounts.allowed + trackerCounts.blocked || 0;
		const size = options.isExpert ? 94 : 121;
		const width = +size;
		const height = +size;
		const radius = Math.min(width, height) / 2;
		const animationDuration = 750;
		const delays = [];

		// Process categories into graphData
		if (categories.length === 0) {
			graphData.push({
				id: null,
				name: null,
				value: 1,
			});
		} else {
			categories.forEach((category) => {
				graphData.push({
					id: category.id,
					name: category.name,
					value: category.num_total,
				});
			});
			graphData.sort((a, b) => a.value < b.value);
		}

		// Clear graph
		d3.select(this.node).selectAll('*').remove();

		// Draw graph
		const chart = d3.select(this.node)
			.append('svg')
			.attr('class', 'donutSvg')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('preserveAspectRatio', 'xMinYMin')
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 2})`);
		const arc = d3.arc()
			.innerRadius(radius - 13)
			.outerRadius(radius);
		const pie = d3.pie()
			.startAngle(-Math.PI)
			.endAngle(Math.PI)
			.sort(null)
			.value(d => d.value);
		const g = chart.selectAll('.arc')
			.data(pie(graphData))
			.enter().append('g')
			.attr('class', 'arc');

		g.append('path')
			.style('fill', (d, i) => {
				if (pausedBlocking) {
					const pausedExp = graphData.length > 1 ? 100 / (graphData.length - 1) * i * 0.01 : 0;
					return this.colors.paused(pausedExp);
				} else if (sitePolicy === 1) {
					const restrictedExp = graphData.length > 1 ? 100 / (graphData.length - 1) * i * 0.01 : 0;
					return this.colors.restricted(restrictedExp);
				}
				return this.colors.regular(d.data.id);
			})
			.attr('class', (d, i) => ((d.data.name) ? 'clickable' : 'disabled'))
			.on('mouseover', (d, i) => {
				const pX = arc.centroid(d)[0] + (width / 2);
				const pY = arc.centroid(d)[1] + (height / 2);
				const tooltip = document.getElementById(`${d.data.id}_tooltip`);
				if (tooltip) {
					tooltip.style.left = `${pX - (tooltip.offsetWidth / 2)}px`;
					tooltip.style.top = `${pY - (tooltip.offsetHeight + 8)}px`;
					tooltip.classList.add('show');
				}
			})
			.on('mouseout', (d, i) => {
				const tooltip = document.getElementById(`${d.data.id}_tooltip`);
				if (tooltip) {
					tooltip.classList.remove('show');
				}
			})
			.on('click', (d, i) => {
				if (d.data.name) {
					this.props.actions.filterTrackers({ type: 'category', name: d.data.id });
				}
			})
			.transition()
			.duration((d, i) => {
				const delay = d.value / graphData.reduce((sum, j) => sum + j.value, 0) * animationDuration;
				delays.push(delay);
				return delay;
			})
			.delay((d, i) => {
				if (i === 0) { return 0; }

				let sum = 0;
				delays.forEach((val, j) => {
					if (j < i) { sum += val; }
				});

				return sum;
			})
			.attrTween('d', (d) => {
				const i = d3.interpolate(d.startAngle, d.endAngle);
				return function (t) {
					d.endAngle = i(t);
					return arc(d);
				};
			})
			.ease(d3.easeLinear);
	}
	/**
	 * Trigger action which results in navigating to full blocking view.
	 * @param  {Object} event 		mouseclick on the total number of trackers
	 *                          	displayed in the 'hole' of the donut
	 */
	clickTrackersAll(event) {
		this.props.actions.filterTrackers({ type: 'trackers', name: 'all' });
	}
	/**
	 * Render Donut Chart.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div className="tracker-category-wheel">
				<div id="categories-donut">
					<div className="donut-text" onClick={this.props.toExpert}>
						<div onClick={this.clickTrackersAll} className="categories-donut-count">
							{this.props.trackerCounts.allowed + this.props.trackerCounts.blocked || 0}
						</div>
						<div>Trackers</div>
					</div>
					<div id="categories-donut-container" ref={(node) => { this.node = node; }} />
					{this.props.categories.map(cat => (
						<span key={cat.id} id={`${cat.id}_tooltip`} className="tooltip top">
							{cat.name}
						</span>
					))}
				</div>
			</div>
		);
	}
}

DonutGraph.defaultProps = {
	categories: [],
};

export default DonutGraph;
