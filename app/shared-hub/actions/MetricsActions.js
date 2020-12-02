import { log, sendMessageInPromise } from '../utils';
import SEND_PING from '../constants/MetricsConstants';

export default function sendPing(actionData) {
	return function(dispatch) {
		return sendMessageInPromise(SEND_PING, actionData).then((data) => {
			dispatch({
				type: SEND_PING,
				data,
			});
		}).catch((err) => {
			log('sendPing Action Error', err);
		});
	};
}
