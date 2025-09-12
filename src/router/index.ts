import { CONFIG } from '../config/config';
import cache from '../controller/cache.controller';
import health from '../controller/health.controller';
import main from '../controller/main.controller';
import scheduler from '../controller/scheduler.controller';
import api from '../middleware/api.middleware';
import parameterMid from '../middleware/parameter.middleware';
import logger from '../utils/logger';
import type { Venation } from '../utils/venation';

export default async (ven: Venation) => {
	await ven.router('', api(), parameterMid).then((sub) => {
		// 基础接口
		sub.get('', main.get);

		// 健康检查接口
		sub.get('/health/ready', health.ready);
		sub.get('/health/live', health.live);

		// 缓存状态接口
		sub.get('/cache/status', cache.status);

		// 调度器状态接口
		sub.get('/scheduler/status', scheduler.status);

		// 缓存预更新接口
		if (CONFIG.enableCachePreupdate) {
			sub.get('/cache/preupdate', cache.preupdate);
			logger.info('Cache preupdate endpoint is enabled');
		} else {
			logger.info('Cache preupdate endpoint is disabled by configuration');
		}
	});
};
