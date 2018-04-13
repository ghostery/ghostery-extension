export function fromTrackersToChartData(trackers) {
	if (trackers.length < 1) {
		return {
			sum: 0,
			arcs: [],
		};
	}

	const arcs = [];
	let startAngle = 0;

	var sum = trackers.map(tracker => tracker.numTotal).reduce((a, b) => a + b, 0);

	for (let i = 0; i < trackers.length; i += 1) {
		const endAngle = startAngle + (trackers[i].numTotal * 360  / sum);

		arcs.push({
			start: startAngle,
			end: endAngle,
			category: trackers[i].id,
		})

		startAngle = endAngle;
	}

	return {
		sum,
		arcs,
	};
}
