import { cache } from '../main/flushData';
import { EProviders } from '../main/main';
import type { IContext } from '../utils/interface';
import { Controller } from './controller';

interface HealthStatus {
	status: 'healthy' | 'unhealthy';
	message: string;
	details: {
		cacheStatus: {
			totalProviders: number;
			healthyProviders: number;
			unhealthyProviders: number;
			providers: Array<{
				provider: string;
				status: 'healthy' | 'unhealthy';
				missingCaches: string[];
			}>;
		};
	};
	updatedAt: string;
}

class Health extends Controller {
	/**
	 * 就绪检查端点 - 检查服务是否准备好接收请求
	 * 包括缓存状态检查
	 */
	public async ready(ctx: IContext) {
		const healthStatus = this.checkHealth();

		// 如果有任何缓存缺失，认为服务未就绪
		const isReady = healthStatus.status === 'healthy';

		ctx.res.statusCode = isReady ? 200 : 503;
		ctx.res.setHeader('Content-Type', 'application/json; charset=utf-8');
		ctx.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		ctx.res.end(JSON.stringify(healthStatus, null, 2));
	}

	/**
	 * 存活检查端点 - 检查服务是否存活
	 * 只检查基本服务状态，不检查缓存
	 */
	public async live(ctx: IContext) {
		const liveStatus = {
			status: 'healthy' as const,
			message: 'Service is alive',
			updatedAt: new Date().toISOString(),
		};

		ctx.res.statusCode = 200;
		ctx.res.setHeader('Content-Type', 'application/json; charset=utf-8');
		ctx.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		ctx.res.end(JSON.stringify(liveStatus, null, 2));
	}

	/**
	 * 检查健康状态
	 */
	private checkHealth(): HealthStatus {
		const providers = Object.values(EProviders);
		const providerStatuses: Array<{
			provider: string;
			status: 'healthy' | 'unhealthy';
			missingCaches: string[];
		}> = [];

		let healthyCount = 0;
		let unhealthyCount = 0;

		for (const provider of providers) {
			const missingCaches: string[] = [];

			// 检查每个提供商的所有缓存键
			const cacheKeys = [
				provider, // 主缓存
				`${provider}V4`, // IPv4 缓存
				`${provider}V6`, // IPv6 缓存
			];

			for (const key of cacheKeys) {
				const data = cache.get(key);
				if (!data) {
					missingCaches.push(key);
				}
			}

			const isHealthy = missingCaches.length === 0;
			if (isHealthy) {
				healthyCount++;
			} else {
				unhealthyCount++;
			}

			providerStatuses.push({
				provider,
				status: isHealthy ? 'healthy' : 'unhealthy',
				missingCaches,
			});
		}

		const overallHealthy = unhealthyCount === 0;

		return {
			status: overallHealthy ? 'healthy' : 'unhealthy',
			message: overallHealthy
				? `All ${providers.length} CDN providers have valid cache`
				: `${unhealthyCount} out of ${providers.length} CDN providers have missing cache`,
			details: {
				cacheStatus: {
					totalProviders: providers.length,
					healthyProviders: healthyCount,
					unhealthyProviders: unhealthyCount,
					providers: providerStatuses,
				},
			},
			updatedAt: new Date().toISOString(),
		};
	}
}

const healthController = new Health();
export default healthController;
