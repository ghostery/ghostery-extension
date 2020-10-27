/**
 * Donut Graph Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { throttle } from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
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
	/**
	 * Generate donut-shaped graph with the scanning results.
	 * Add mouse event listeners to the arcs of the donut graph that filter the
	 * detailed view to the corresponding tracker category.
	 * Throttle time matches panelData#updatePanelUI throttling.
	 * @param  {Array} categories list of categories detected on the site
	 * @param  {Object} options    options for the graph
	 */
	bakeDonut = throttle(this._bakeDonut.bind(this), 600, { leading: true, trailing: true })

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
					case 'unidentified':
						return '#8459a5';
					default:
						return '#e8e8e8';
				}
			},
			redscale: scaleLinear().range(['#f75065', '#ffb0Ba']),
			greyscale: scaleLinear().range(['#848484', '#c9c9c9']),
		};

		this._startAngles = new Map();
		this._endAngles = new Map();
	}

	/**
	 *  Helper function that calculates domain value for greyscale / redscale rendering
	 */
	static getTone(catCount, catIndex) {
		return catCount > 1 ? (100 / (catCount - 1)) * catIndex * 0.01 : 0;
	}

	/**
	 *  Helper to retrieve a category's tooltip from the DOM
	 */
	static grabTooltip(d) {
		return document.getElementById(`${d.data.id}_tooltip`);
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		const {
			categories,
			adBlock,
			antiTracking,
			renderRedscale,
			renderGreyscale,
			isSmall,
		} = this.props;

		// TODO add padAngle if it looks good with the 8.4 UI update
		this.trackerPie = pie()
			.startAngle(-Math.PI)
			.endAngle(Math.PI)
			.sort(null)
			.value(d => d.value);

		this.prepareDonutContainer(isSmall);
		this.bakeDonut(categories, antiTracking, adBlock, {
			renderRedscale,
			renderGreyscale,
			isSmall,
		});
	}

	/**
	 * Lifecycle event
	 */
	componentDidUpdate(prevProps) {
		const prevCategories = prevProps.categories;
		const prevAdBlock = prevProps.adBlock;
		const prevAntiTracking = prevProps.antiTracking;
		const prevRenderRedscale = prevProps.renderRedscale;
		const prevRenderGreyscale = prevProps.renderGreyscale;
		const prevGhosteryFeatureSelect = prevProps.ghosteryFeatureSelect;
		const prevIsSmall = prevProps.isSmall;

		const {
			isSmall,
			renderRedscale,
			renderGreyscale,
			ghosteryFeatureSelect,
			categories,
			antiTracking,
			adBlock,
		} = this.props;

		if (prevIsSmall !== isSmall ||
			prevRenderRedscale !== renderRedscale ||
			prevRenderGreyscale !== renderGreyscale ||
			prevGhosteryFeatureSelect !== ghosteryFeatureSelect
		) {
			this.prepareDonutContainer(isSmall);
			this.nextPropsDonut(this.props);
			return;
		}

		// componentDidUpdate gets called many times during page load as new trackers or unsafe data points are found
		// so only compare tracker totals if we don't already have to redraw anyway as a result of the cheaper checks above
		const prevTrackerTotal = prevCategories.reduce((total, category) => total + category.num_total, 0);
		const trackerTotal = categories.reduce((total, category) => total + category.num_total, 0);
		if (prevTrackerTotal !== trackerTotal) {
			this.nextPropsDonut(this.props);
			return;
		}

		if (!prevAntiTracking.unidentifiedTrackerCount && !antiTracking.unidentifiedTrackerCount
			&& !prevAdBlock.unidentifiedTrackerCount && !adBlock.unidentifiedTrackerCount) { return; }
		const prevUnidentifiedDataPoints = prevAntiTracking.unidentifiedTrackerCount + prevAdBlock.unidentifiedTrackerCount;
		const unidentifiedDataPoints = antiTracking.unidentifiedTrackerCount + adBlock.unidentifiedTrackerCount;
		if (prevUnidentifiedDataPoints !== unidentifiedDataPoints) {
			this.nextPropsDonut(this.props);
		}
	}

	/**
	 *  Helper function that updates donut with nextProps values
	 */
	nextPropsDonut(nextProps) {
		this.bakeDonut(nextProps.categories, nextProps.antiTracking, nextProps.adBlock, {
			renderRedscale: nextProps.renderRedscale,
			renderGreyscale: nextProps.renderGreyscale,
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
	}

	_bakeDonut(categories, antiTracking, adBlock, options) {
		const {
			renderRedscale,
			renderGreyscale,
			isSmall
		} = options;
		const graphData = [];
		const animationDuration = categories.length > 0 ? 500 : 0;
		const categoryCount = categories.length + antiTracking.unidentifiedTrackerCount + adBlock.unidentifiedTrackerCount;

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

		if (antiTracking.unidentifiedTrackerCount || adBlock.unidentifiedTrackerCount) {
			graphData.push({
				id: 'unidentified',
				name: 'Unidentified',
				value: antiTracking.unidentifiedTrackerCount + adBlock.unidentifiedTrackerCount,
			});
		}

		const trackerArc = arc()
			.innerRadius(this.donutRadius - 13)
			.outerRadius(this.donutRadius);

		// Clear tooltips
		categories.forEach((cat) => {
			const tooltip = document.getElementById(`${cat.id}_tooltip`);
			if (tooltip) {
				tooltip.classList.remove('DonutGraph__tooltip--show');
			}
		});
		const unidentified_tooltip = document.getElementById('unidentified_tooltip');
		if (unidentified_tooltip) {
			unidentified_tooltip.classList.remove('DonutGraph__tooltip--show');
		}

		// CONNECT NEW DATA
		const arcs = this.chartCenter.selectAll('g')
			.data(this.trackerPie(graphData), d => d.data.id);

		// UPDATE
		arcs.select('path')
			.transition()
			.duration(animationDuration)
			.attrTween('d', (d) => {
				const { id: catId } = d.data;
				const lerpStartAngle = interpolate(this._startAngles.get(catId), d.startAngle);
				const lerpEndAngle = interpolate(this._endAngles.get(catId), d.endAngle);
				this._startAngles.set(catId, d.startAngle);
				this._endAngles.set(catId, d.endAngle);

				return function(t) {
					return trackerArc({
						...d,
						startAngle: lerpStartAngle(t),
						endAngle: lerpEndAngle(t),
					});
				};
			});

		// ENTER
		arcs.enter().append('g')
			.attr('class', 'arc')
			.append('path')
			.style('fill', (d, i) => {
				if (renderGreyscale) {
					return this.colors.greyscale(DonutGraph.getTone(categoryCount, i));
				}
				if (renderRedscale) {
					return this.colors.redscale(DonutGraph.getTone(categoryCount, i));
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
				const centroid = trackerArc.centroid(d);
				const pX = centroid[0] + this.donutRadius;
				const pY = centroid[1] + this.donutRadius;
				const tooltip = DonutGraph.grabTooltip(d);
				if (tooltip) {
					tooltip.style.left = `${pX - (tooltip.offsetWidth / 2)}px`;
					tooltip.style.top = `${pY - (tooltip.offsetHeight + 8)}px`;
					tooltip.classList.add('DonutGraph__tooltip--show');
				}
			})
			.on('mouseout', (d) => {
				const tooltip = DonutGraph.grabTooltip(d);
				if (tooltip) {
					tooltip.classList.remove('DonutGraph__tooltip--show');
				}
			})
			.on('click', (d) => {
				const { clickDonut } = this.props;
				if (d.data.name && isSmall) {
					clickDonut({ type: 'category', name: d.data.id });
				}
			})
			.transition()
			.duration(animationDuration)
			.attrTween('d', (d) => {
				const { id: catId } = d.data;
				this._startAngles.set(catId, d.startAngle);
				this._endAngles.set(catId, d.endAngle);

				const i = interpolate(d.startAngle, d.endAngle);
				return function(t) {
					return trackerArc({
						...d,
						endAngle: i(t)
					});
				};
			})
			.ease(easeLinear);

		// EXIT
		arcs.exit().remove();
	}

	/**
	 * Handle click event for graph text. Filters to show all categories.
	 */
	clickGraphText() {
		const { clickDonut } = this.props;
		clickDonut({ type: 'trackers', name: 'all' });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the donut-graph portion of the Summary View
	 */
	render() {
		const {
			isSmall,
			categories,
			adBlock,
			antiTracking,
			totalCount,
		} = this.props;
		const componentClasses = ClassNames('DonutGraph', {
			'DonutGraph--big': !isSmall,
			'DonutGraph--small': isSmall,
		});

		// TODO Foundation dependency: tooltip
		return (
			<div className={componentClasses}>
				<div className="DonutGraph__tooltipContainer">
					{categories.map(cat => (
						<span
							className="DonutGraph__tooltip tooltip top"
							id={`${cat.id}_tooltip`}
							key={cat.id}
						>
							{cat.name}
						</span>
					))}
					{(!!antiTracking.unidentifiedTrackerCount || !!adBlock.unidentifiedTrackerCount) && (
						<span
							className="DonutGraph__tooltip tooltip top"
							id="unidentified_tooltip"
							key="unidentified"
						>
							{t('unidentified')}
						</span>
					)}
				</div>
				<div className="DonutGraph__ref" ref={(node) => { this.node = node; }} />
				<div className="DonutGraph__textCountContainer clickable" onClick={this.clickGraphText}>
					<div className="DonutGraph__textCount g-tooltip">
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

DonutGraph.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.object),
	adBlock: PropTypes.shape({}),
	antiTracking: PropTypes.shape({}),
	renderRedscale: PropTypes.bool.isRequired,
	renderGreyscale: PropTypes.bool.isRequired,
	totalCount: PropTypes.number.isRequired,
	ghosteryFeatureSelect: PropTypes.oneOf([false, 1, 2]).isRequired,
	isSmall: PropTypes.bool,
	clickDonut: PropTypes.func,
};

DonutGraph.defaultProps = {
	categories: [],
	adBlock: { unidentifiedTrackerCount: 0 },
	antiTracking: { unidentifiedTrackerCount: 0 },
	clickDonut: () => {},
	isSmall: false,
};

export default DonutGraph;
