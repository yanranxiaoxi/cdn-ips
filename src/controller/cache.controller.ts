import {
	cache,
	flushALTERNcloud,
	flushALTERNcloudV4,
	flushALTERNcloudV6,
	flushAkamai,
	flushAkamaiV4,
	flushAkamaiV6,
	flushArvancloud,
	flushArvancloudV4,
	flushArvancloudV6,
	flushBunny,
	flushBunnyV4,
	flushBunnyV6,
	flushCDN77,
	flushCDN77V4,
	flushCDN77V6,
	flushCacheFly,
	flushCacheFlyV4,
	flushCacheFlyV6,
	flushCloudFront,
	flushCloudFrontV4,
	flushCloudFrontV6,
	flushCloudflare,
	flushCloudflareV4,
	flushCloudflareV6,
	flushEdgeOne,
	flushEdgeOneV4,
	flushEdgeOneV6,
	flushF5CDN,
	flushF5CDNV4,
	flushF5CDNV6,
	flushFastly,
	flushFastlyV4,
	flushFastlyV6,
	flushGcore,
	flushGcoreV4,
	flushGcoreV6,
	flushGoogleCloud,
	flushGoogleCloudLoadBalancing,
	flushGoogleCloudLoadBalancingV4,
	flushGoogleCloudLoadBalancingV6,
	flushGoogleCloudV4,
	flushGoogleCloudV6,
	flushImperva,
	flushImpervaV4,
	flushImpervaV6,
	flushKeyCDN,
	flushKeyCDNV4,
	flushKeyCDNV6,
	flushMedianova,
	flushMedianovaV4,
	flushMedianovaV6,
	flushQUICcloud,
	flushQUICcloudV4,
	flushQUICcloudV6,
} from '../main/flushData';
import { EProviders, EVersion } from '../main/main';
import type { IContext } from '../utils/interface';
import logger from '../utils/logger';
import { Controller } from './controller';

interface CacheUpdateResult {
	provider: string;
	version?: string;
	success: boolean;
	error?: string;
	message: string;
	ipCount: number;
}

interface CacheUpdateResponse {
	success: boolean;
	message: string;
	results: CacheUpdateResult[];
	totalUpdated: number;
	totalFailed: number;
	updatedAt: string;
}

class Cache extends Controller {
	/**
	 * 缓存预更新接口
	 * 检查并更新所有提供商的缓存
	 */
	public async preupdate(ctx: IContext) {
		logger.info('Cache preupdate requested for all providers');

		// 执行缓存更新
		const results = await this.updateCacheForProviders(Object.values(EProviders), EVersion.ALL, false);

		// 统计结果
		const totalUpdated = results.filter((r) => r.success).length;
		const totalFailed = results.filter((r) => !r.success).length;

		const response: CacheUpdateResponse = {
			success: totalFailed === 0,
			message:
				totalFailed === 0
					? `Successfully updated ${totalUpdated} cache entries`
					: `Updated ${totalUpdated} cache entries, ${totalFailed} failed`,
			results,
			totalUpdated,
			totalFailed,
			updatedAt: new Date().toISOString(),
		};

		ctx.res.setHeader('Content-Type', 'application/json; charset=utf-8');
		ctx.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		ctx.res.end(JSON.stringify(response, null, 2));
	}

	/**
	 * 获取缓存状态接口
	 */
	public async status(ctx: IContext) {
		const cacheStatus = this.getCacheStatus(Object.values(EProviders));

		ctx.res.setHeader('Content-Type', 'application/json; charset=utf-8');
		ctx.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		ctx.res.end(JSON.stringify(cacheStatus, null, 2));
	}

	/**
	 * 为指定的提供商更新缓存
	 */
	private async updateCacheForProviders(providers: EProviders[], version: EVersion, force: boolean): Promise<CacheUpdateResult[]> {
		const results: CacheUpdateResult[] = [];
		const updatePromises: Promise<CacheUpdateResult[]>[] = [];

		// 为每个提供商创建更新任务
		for (const provider of providers) {
			updatePromises.push(this.updateCacheForProvider(provider, version, force));
		}

		// 并发执行所有更新任务
		const allResults = await Promise.all(updatePromises);

		// 展平结果数组
		for (const providerResults of allResults) {
			results.push(...providerResults);
		}

		return results;
	}

	/**
	 * 为单个提供商更新缓存
	 */
	private async updateCacheForProvider(provider: EProviders, version: EVersion, force: boolean): Promise<CacheUpdateResult[]> {
		const results: CacheUpdateResult[] = [];
		const providerFuncs = this.getProviderFunctions(provider);

		if (!providerFuncs) {
			results.push({
				provider,
				success: false,
				error: 'Unknown provider',
				message: 'Provider not found',
				ipCount: 0,
			});
			return results;
		}

		// 根据版本参数决定更新哪些缓存
		const updateTasks: Array<{ version: string; func: () => Promise<string[]> }> = [];

		if (version === EVersion.ALL || version === EVersion.V4) {
			updateTasks.push({ version: 'V4', func: providerFuncs.v4 });
		}
		if (version === EVersion.ALL || version === EVersion.V6) {
			updateTasks.push({ version: 'V6', func: providerFuncs.v6 });
		}
		if (version === EVersion.ALL) {
			updateTasks.push({ version: 'ALL', func: providerFuncs.all });
		}

		// 执行更新任务
		for (const task of updateTasks) {
			try {
				// 如果强制更新，先清除相关缓存
				if (force) {
					this.clearProviderCache(provider, task.version);
				}

				// 检查缓存是否存在（如果不强制更新）
				if (!force && this.hasValidCache(provider, task.version)) {
					const existingData = cache.get(task.version === 'ALL' ? provider : `${provider}${task.version}`);
					const ipCount = existingData ? (existingData as string[]).length : 0;
					results.push({
						provider,
						version: task.version,
						success: true,
						message: 'Cache already exists and is valid',
						ipCount,
					});
					continue;
				}

				// 执行更新
				const startTime = Date.now();
				const ips = await task.func();
				const duration = Date.now() - startTime;

				results.push({
					provider,
					version: task.version,
					success: true,
					message: `Successfully updated cache with ${ips.length} IPs`,
					ipCount: ips.length,
				});

				logger.info(`Cache updated for ${provider} ${task.version}: ${ips.length} IPs in ${duration}ms`);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				results.push({
					provider,
					version: task.version,
					success: false,
					error: errorMessage,
					message: `Failed to update cache: ${errorMessage}`,
					ipCount: 0,
				});

				logger.error(`Failed to update cache for ${provider} ${task.version}:`, error);
			}
		}

		return results;
	}

	/**
	 * 获取提供商对应的函数映射
	 */
	private getProviderFunctions(provider: EProviders) {
		const PROVIDER_FUNCTIONS = {
			[EProviders.CLOUDFLARE]: { all: flushCloudflare, v4: flushCloudflareV4, v6: flushCloudflareV6 },
			[EProviders.EDGEONE]: { all: flushEdgeOne, v4: flushEdgeOneV4, v6: flushEdgeOneV6 },
			[EProviders.FASTLY]: { all: flushFastly, v4: flushFastlyV4, v6: flushFastlyV6 },
			[EProviders.GCORE]: { all: flushGcore, v4: flushGcoreV4, v6: flushGcoreV6 },
			[EProviders.BUNNY]: { all: flushBunny, v4: flushBunnyV4, v6: flushBunnyV6 },
			[EProviders.CLOUDFRONT]: { all: flushCloudFront, v4: flushCloudFrontV4, v6: flushCloudFrontV6 },
			[EProviders.KEYCDN]: { all: flushKeyCDN, v4: flushKeyCDNV4, v6: flushKeyCDNV6 },
			[EProviders.QUIC_CLOUD]: { all: flushQUICcloud, v4: flushQUICcloudV4, v6: flushQUICcloudV6 },
			[EProviders.CACHEFLY]: { all: flushCacheFly, v4: flushCacheFlyV4, v6: flushCacheFlyV6 },
			[EProviders.AKAMAI]: { all: flushAkamai, v4: flushAkamaiV4, v6: flushAkamaiV6 },
			[EProviders.GOOGLE_CLOUD]: { all: flushGoogleCloud, v4: flushGoogleCloudV4, v6: flushGoogleCloudV6 },
			[EProviders.GOOGLE_CLOUD_LOAD_BALANCING]: {
				all: flushGoogleCloudLoadBalancing,
				v4: flushGoogleCloudLoadBalancingV4,
				v6: flushGoogleCloudLoadBalancingV6,
			},
			[EProviders.CDN77]: { all: flushCDN77, v4: flushCDN77V4, v6: flushCDN77V6 },
			[EProviders.ARVANCLOUD]: { all: flushArvancloud, v4: flushArvancloudV4, v6: flushArvancloudV6 },
			[EProviders.F5_CDN]: { all: flushF5CDN, v4: flushF5CDNV4, v6: flushF5CDNV6 },
			[EProviders.IMPERVA]: { all: flushImperva, v4: flushImpervaV4, v6: flushImpervaV6 },
			[EProviders.MEDIANOVA]: { all: flushMedianova, v4: flushMedianovaV4, v6: flushMedianovaV6 },
			[EProviders.ALTERNCLOUD]: { all: flushALTERNcloud, v4: flushALTERNcloudV4, v6: flushALTERNcloudV6 },
		} as const;

		return PROVIDER_FUNCTIONS[provider];
	}

	/**
	 * 清除指定提供商的缓存
	 */
	private clearProviderCache(provider: EProviders, version: string) {
		const cacheKeys = [provider, `${provider}Optimism`];

		if (version === 'V4' || version === 'ALL') {
			cacheKeys.push(`${provider}V4`, `${provider}V4Optimism`);
		}

		if (version === 'V6' || version === 'ALL') {
			cacheKeys.push(`${provider}V6`, `${provider}V6Optimism`);
		}

		for (const key of cacheKeys) {
			cache.del(key);
		}

		logger.info(`Cleared cache for ${provider} ${version}: ${cacheKeys.join(', ')}`);
	}

	/**
	 * 检查缓存是否存在且有效
	 */
	private hasValidCache(provider: EProviders, version: string): boolean {
		const cacheKey = version === 'ALL' ? provider : `${provider}${version}`;
		const data = cache.get(cacheKey);
		return data !== undefined;
	}

	/**
	 * 获取缓存状态信息
	 */
	private getCacheStatus(providers: EProviders[]) {
		const status: any = {
			updatedAt: new Date().toISOString(),
			providers: {},
		};

		for (const provider of providers) {
			const providerStatus: any = {
				all: this.getCacheInfo(provider),
				v4: this.getCacheInfo(`${provider}V4`),
				v6: this.getCacheInfo(`${provider}V6`),
			};

			status.providers[provider] = providerStatus;
		}

		return status;
	}

	/**
	 * 获取单个缓存的详细信息
	 */
	private getCacheInfo(cacheKey: string) {
		const data = cache.get(cacheKey);
		const optimismData = cache.get(`${cacheKey}Optimism`);

		return {
			exists: data !== undefined,
			optimismExists: optimismData !== undefined,
			ipCount: data ? (data as string[]).length : 0,
			optimismIpCount: optimismData ? (optimismData as string[]).length : 0,
		};
	}
}

const cacheController = new Cache();
export default cacheController;
