import { CONFIG } from '../config/config';
import cacheController from '../controller/cache.controller';
import venRouter from '../router';
import logger from '../utils/logger';
import { scheduler } from '../utils/scheduler';
import { Venation } from '../utils/venation';
import { VenNodeDriver } from '../utils/venation/driver';

(async () => {
	const driver = new VenNodeDriver(logger);
	const venation = new Venation(logger);
	venation.addDriver(driver);
	await venRouter(venation);

	// 启动定时任务：每 10 分钟执行一次缓存预更新
	scheduler.start(async () => {
		try {
			const result = await cacheController.preupdateCache();
			logger.info(`Scheduled cache preupdate completed: ${result.message}`);
		} catch (error) {
			logger.error('Scheduled cache preupdate failed:', error);
			throw error; // 重新抛出错误以便调度器处理
		}
	});

	// 启动服务器
	driver.listen(CONFIG.host, CONFIG.port);
	logger.info(`Server started on ${CONFIG.host}:${CONFIG.port}`);
})();
