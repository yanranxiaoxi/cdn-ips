import cache from '../controller/cache.controller';
import health from '../controller/health.controller';
import main from '../controller/main.controller';
import api from '../middleware/api.middleware';
import parameterMid from '../middleware/parameter.middleware';
import type { Venation } from '../utils/venation';

export default async (ven: Venation) => {
	await ven.router('', api(), parameterMid).then((sub) => {
		sub.get('', main.get);
		sub.get('/cache/preupdate', cache.preupdate);
		sub.get('/cache/status', cache.status);
		sub.get('/health/ready', health.ready);
		sub.get('/health/live', health.live);
	});
};
