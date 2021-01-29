import { makeDeferredDispatcher } from '../utils';
import SEND_PING from '../constants/MetricsConstants';

const sendPing =
		actionData => makeDeferredDispatcher(SEND_PING, actionData);

export default sendPing;
