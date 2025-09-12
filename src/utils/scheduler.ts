import logger from './logger';

export interface TaskStatus {
	id: string;
	name: string;
	interval: number; // 毫秒
	enabled: boolean;
	lastRun?: Date;
	nextRun?: Date;
	errorCount: number;
}

export class SimpleScheduler {
	private interval: NodeJS.Timeout | null = null;
	private isRunning = false;
	private taskStatus: TaskStatus = {
		id: 'cache-preupdate',
		name: 'Cache Preupdate Task',
		interval: 10 * 60 * 1000, // 10 分钟
		enabled: true,
		errorCount: 0,
	};

	/**
	 * 启动定时任务
	 */
	public start(taskFunction: () => Promise<void>): void {
		if (this.isRunning) {
			logger.warn('Scheduler is already running');
			return;
		}

		this.isRunning = true;
		logger.info('Starting simple task scheduler...');

		// 立即执行一次
		logger.info('Executing cache preupdate immediately on startup');
		this.executeTask(taskFunction).catch((error) => {
			logger.error('Initial cache preupdate failed:', error);
		});

		// 设置定时器
		this.interval = setInterval(async () => {
			await this.executeTask(taskFunction);
		}, this.taskStatus.interval);

		this.taskStatus.nextRun = new Date(Date.now() + this.taskStatus.interval);
		logger.info(`Task scheduler started - next run: ${this.taskStatus.nextRun.toISOString()}`);
	}

	/**
	 * 停止定时任务
	 */
	public stop(): void {
		if (!this.isRunning) {
			logger.warn('Scheduler is not running');
			return;
		}

		this.isRunning = false;
		logger.info('Stopping task scheduler...');

		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}

		logger.info('Task scheduler stopped');
	}

	/**
	 * 获取任务状态
	 */
	public getStatus(): TaskStatus {
		return { ...this.taskStatus };
	}

	/**
	 * 执行任务
	 */
	private async executeTask(taskFunction: () => Promise<void>): Promise<void> {
		const startTime = Date.now();
		this.taskStatus.lastRun = new Date();

		try {
			logger.info('Executing scheduled cache preupdate');
			await taskFunction();

			const duration = Date.now() - startTime;
			this.taskStatus.errorCount = 0; // 重置错误计数
			this.taskStatus.nextRun = new Date(Date.now() + this.taskStatus.interval);

			logger.info(`Scheduled cache preupdate completed - duration: ${duration}ms`);
		} catch (error) {
			const duration = Date.now() - startTime;
			this.taskStatus.errorCount++;
			this.taskStatus.nextRun = new Date(Date.now() + this.taskStatus.interval);

			logger.error(`Scheduled cache preupdate failed - duration: ${duration}ms, error count: ${this.taskStatus.errorCount}`, error);
		}
	}
}

// 创建全局调度器实例
export const scheduler = new SimpleScheduler();
