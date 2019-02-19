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

import React from 'react';
import ClassNames from 'classnames';
import {
	arc,
	easeLinear,
	interpolate,
	pie,
	scaleLinear,
	select
} from 'd3';
import Tooltip from '../Tooltip';

/**
 * @class Generate donut graph. Used to display tracker data in the Summary View.
 * @memberOf PanelBuildingBlocks
 */
class DonutGraph extends React.Component {
	constructor(props) {
		super(props);

		// Event Bindings
		this.clickGraphText = this.clickGraphText.bind(this);

		// Variables
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
			redscale: scaleLinear().range(['#f75065', '#ffb0Ba']),
			greyscale: scaleLinear().range(['#848484', '#c9c9c9']),
		};
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		const {
			categories,
			renderRedscale,
			renderGreyscale,
			totalCount,
			isSmall,
		} = this.props;

		this.prepareDonutContainer(isSmall);
		this.bakeDonut(categories, {
			renderRedscale,
			renderGreyscale,
			totalCount
		});
	}

	/**
	 * Lifecycle event
	 */
	componentWillReceiveProps(nextProps) {
		const {
			categories,
			renderRedscale,
			renderGreyscale,
			ghosteryFeatureSelect,
			isSmall
		} = this.props;

		// this function may get called many times during page load,
		// so order checks by cost
		if (isSmall !== nextProps.isSmall) {
			this.prepareDonutContainer(nextProps.isSmall);
			this.nextPropsDonut(nextProps);
			return;
		}

		if (
			categories.length !== nextProps.categories.length ||
			renderRedscale !== nextProps.renderRedscale ||
			renderGreyscale !== nextProps.renderGreyscale ||
			ghosteryFeatureSelect !== nextProps.ghosteryFeatureSelect
		) {
			this.nextPropsDonut(nextProps);
			return;
		}

		const trackerTotal = categories.reduce((total, category) => total + category.num_total, 0);
		const nextTrackerTotal = nextProps.categories.reduce((total, category) => total + category.num_total, 0);
		if (trackerTotal !== nextTrackerTotal) {
			this.nextPropsDonut(nextProps);
		}
	}

	/**
	 *  Helper function that calculates domain value for greyscale / redscale rendering
	 */
	getTone(catCount, catIndex) {
		return catCount > 1 ? 100 / (catCount - 1) * catIndex * 0.01 : 0;
	}

	/**
	 *  Helper to retrieve a category's tooltip from the DOM
	 */
	grabTooltip(d) {
		return document.getElementById(`${d.data.id}_tooltip`);
	}

	/**
	 *  Helper function that updates donut with nextProps values
	 */
	nextPropsDonut(nextProps) {
		this.bakeDonut(nextProps.categories, {
			renderRedscale: nextProps.renderRedscale,
			renderGreyscale: nextProps.renderGreyscale,
			totalCount: nextProps.totalCount,
			isSmall: nextProps.isSmall,
		});
	}

	/**
	 *  Initialize the SVG element in which the donut is rendered
	 *  Called when the component is mounted and when the size of the donut changes
	 *  @param {boolean} isSmall	are we drawing the small Detailed View donut or the bigger Simple View donut?
	 */
	prepareDonutContainer(isSmall) {
		const size = isSmall ? 94 : 120;
		this.donutRadius = size / 2;

		select(this.node).selectAll('*').remove();
		this.chart = select(this.node)
			.append('svg')
			.attr('class', 'donutSvg')
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('viewBox', `0 0 ${size} ${size}`)
			.attr('preserveAspectRatio', 'xMinYMin');
		this.chartCenter = this.chart
			.append('g')
			.attr('transform', `translate(${this.donutRadius}, ${this.donutRadius})`);

		this.trackerArc = arc()
			.innerRadius(this.donutRadius - 13)
			.outerRadius(this.donutRadius);
	}

	/**
	 * Generate donut-shaped graph with the scanning results.
	 * Add mouse event listeners to the arcs of the donut graph that filter the
	 * detailed view to the corresponding tracker category.
	 * @param  {Array} categories list of categories detected on the site
	 * @param  {Object} options    options for the graph
	 */
	bakeDonut(categories, options) {
		const {
			renderRedscale,
			renderGreyscale,
			isSmall
		} = options;
		const graphData = [];
		const animationDuration = categories.length > 0 ? 750 : 0;
		const categoryCount = categories.length;
		const delays = [];

		// Process categories into graphData
		if (categoryCount === 0) {
			graphData.push({
				id: null,
				name: null,
				value: 1
			});
		} else {
			categories.forEach((cat) => {
				graphData.push({
					id: cat.id,
					name: cat.name,
					value: cat.num_total
				});
			});
			graphData.sort((a, b) => a.value < b.value);
		}
		const totalTrackers = graphData.reduce((sum, j) => sum + j.value, 0);

		// Clear tooltips
		categories.forEach((cat) => {
			const tooltip = document.getElementById(`${cat.id}_tooltip`);
			if (tooltip) {
				tooltip.classList.remove('show');
			}
		});

		// const trackerArc = arc()
		//	.innerRadius(this.donutRadius - 13)
		//	.outerRadius(this.donutRadius);
		// this.trackerArc
			// .innerRadius(this.donutRadiu - 13)
			// .outerRadius(this.donutRadius);
		const trackerPie = pie()
			.startAngle(-Math.PI)
			.endAngle(Math.PI)
			.sort(null)
			.value(d => d.value);

		const arcs = this.chartCenter.selectAll('g')
			.data(trackerPie(graphData), d => d.data.id);

		/*
		arcs.selectAll('path')
			.attrTween('d', (d) => {
				const i = interpolate(d.startAngle, d.endAngle);
				return function (t) {
					d.endAngle = i(t);
					return trackerArc(d);
				};
			})
			.ease(easeLinear);
		*/

		arcs.enter().append('g')
		// arcs.enter().append('path')
			.attr('class', 'arc')
		.append('path')
			.style('fill', (d, i) => {
				if (renderGreyscale) {
					return this.colors.greyscale(this.getTone(categoryCount, i));
				} else if (renderRedscale) {
					return this.colors.redscale(this.getTone(categoryCount, i));
				}
				return this.colors.regular(d.data.id);
			})
			.attr('class', (d) => {
				if (d.data.name) {
					return (isSmall) ? 'clickable' : 'not-clickable';
				}
				return 'disabled';
			})
			.on('mouseover', (d) => {
				const centroid = this.trackerArc.centroid(d);
				const pX = centroid[0] + this.donutRadius;
				const pY = centroid[1] + this.donutRadius;
				const tooltip = this.grabTooltip(d);
				if (tooltip) {
					tooltip.style.left = `${pX - (tooltip.offsetWidth / 2)}px`;
					tooltip.style.top = `${pY - (tooltip.offsetHeight + 8)}px`;
					tooltip.classList.add('show');
				}
			})
			.on('mouseout', (d) => {
				const tooltip = this.grabTooltip(d);
				if (tooltip) {
					tooltip.classList.remove('show');
				}
			})
			.on('click', (d) => {
				if (d.data.name && isSmall) {
					this.props.clickDonut({ type: 'category', name: d.data.id });
				}
			})
			.transition()
			.duration((d) => {
				const delay = (d.value / totalTrackers) * animationDuration;
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
				const i = interpolate(d.startAngle, d.endAngle);
				return (function (t) {
					d.endAngle = i(t);
					return this.trackerArc(d);
				}).bind(this);
			})
			.ease(easeLinear);
	}

	/**
	 * Handle click event for graph text. Filters to show all categories.
	 */
	clickGraphText() {
		this.props.clickDonut({ type: 'trackers', name: 'all' });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the donut-graph portion of the Summary View
	 */
	render() {
		const { isSmall, totalCount } = this.props;
		const componentClasses = ClassNames('sub-component', 'donut-graph', {
			small: isSmall,
			big: !isSmall,
		});

		return (
			<div className={componentClasses}>
				<div className="tooltip-container">
					{this.props.categories.map(cat => (
						<span key={cat.id} id={`${cat.id}_tooltip`} className="tooltip top">
							{cat.name}
						</span>
					))}
				</div>
				<div className="graph-ref" ref={(node) => { this.node = node; }} />
				<div className="graph-text clickable" onClick={this.clickGraphText}>
					<div className="graph-text-count g-tooltip">
						{totalCount}
						<Tooltip
							delay="0"
							body={t('panel_tracker_total_tooltip')}
							position="right"
						/>
					</div>
				</div>
			</div>
		);
	}
}

DonutGraph.defaultProps = {
	categories: [],
};

export default DonutGraph;
