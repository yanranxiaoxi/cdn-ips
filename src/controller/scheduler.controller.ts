import type { IContext } from '../utils/interface';
import { scheduler } from '../utils/scheduler';
import { Controller } from './controller';

class Scheduler extends Controller {
	/**
	 * 获取定时任务状态
	 */
	public async status(ctx: IContext) {
		const taskStatus = scheduler.getStatus();

		const response = {
			schedulerRunning: true,
			task: {
				id: taskStatus.id,
				name: taskStatus.name,
				enabled: taskStatus.enabled,
				interval: taskStatus.interval,
				intervalMinutes: Math.round(taskStatus.interval / (60 * 1000)),
				lastRun: taskStatus.lastRun,
				nextRun: taskStatus.nextRun,
				errorCount: taskStatus.errorCount,
			},
			updatedAt: new Date().toISOString(),
		};

		ctx.res.setHeader('Content-Type', 'application/json; charset=utf-8');
		ctx.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		ctx.res.end(JSON.stringify(response, null, 2));
	}
}

const schedulerController = new Scheduler();
export default schedulerController;
