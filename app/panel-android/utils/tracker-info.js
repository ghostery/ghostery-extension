import { apps } from '../../../cliqz/antitracking/tracker_db_v2.json';

export default function getUrlFromTrackerId(id) {
	const trackerName = apps[id].name;
	const trackerWtm = (Object.values(apps).find(app => app.wtm && app.name === trackerName) || {}).wtm;
	const slug = trackerWtm || '../tracker-not-found';
	return `https://whotracks.me/trackers/${slug}.html`;
}
