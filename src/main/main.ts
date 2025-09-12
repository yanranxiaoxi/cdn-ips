import logger from '../utils/logger';
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
} from './flushData';

export enum EProviders {
	CLOUDFLARE = 'Cloudflare',
	EDGEONE = 'EdgeOne',
	FASTLY = 'Fastly',
	GCORE = 'Gcore',
	BUNNY = 'Bunny',
	CLOUDFRONT = 'CloudFront',
	KEYCDN = 'KeyCDN',
	QUIC_CLOUD = 'QUICcloud',
	CACHEFLY = 'CacheFly',
	AKAMAI = 'Akamai',
	GOOGLE_CLOUD = 'GoogleCloud',
	GOOGLE_CLOUD_LOAD_BALANCING = 'GoogleCloudLoadBalancing',
	CDN77 = 'CDN77',
	ARVANCLOUD = 'Arvancloud',
	F5_CDN = 'F5CDN',
	IMPERVA = 'Imperva',
	MEDIANOVA = 'Medianova',
	ALTERNCLOUD = 'ALTERNcloud',
}

export enum EVersion {
	V4 = 'v4',
	V6 = 'v6',
	ALL = 'all',
}

export enum EFormat {
	COMMA = 'comma',
	SPACE = 'space',
	LINE = 'line',
	JSON_ARRAY_WITHOUT_SQUARE_BRACKETS = 'json-array-without-square-brackets',
	JSON = 'json',
	JSON_TRANSPOSED = 'json-transposed',
	JSON_WITHOUT_PROVIDERS = 'json-without-providers',
	JSON_WITHOUT_VERSIONS = 'json-without-versions',
	JSON_ARRAY = 'json-array',
}

// 并发控制 Map，避免重复请求
const pendingRequests = new Map<string, Promise<string[]>>();

async function getCachedData(tag: string, flushFn: () => Promise<string[]>): Promise<string[]> {
	const data: string[] | undefined = cache.get(tag);
	if (data) return data;

	const dataOptimism: string[] | undefined = cache.get(tag + 'Optimism');
	if (dataOptimism) {
		// 异步更新缓存，不阻塞当前请求
		flushFn().catch((error) => {
			logger.error(`Failed to refresh cache for ${tag}:`, error);
		});
		return dataOptimism;
	}

	// 检查是否有正在进行的相同请求
	if (pendingRequests.has(tag)) {
		return await pendingRequests.get(tag)!;
	}

	// 创建新的请求 Promise
	const requestPromise = flushFn();
	pendingRequests.set(tag, requestPromise);

	try {
		const result = await requestPromise;
		return result;
	} finally {
		// 清理 pending 请求
		pendingRequests.delete(tag);
	}
}

async function matchVersionFn(
	version: EVersion,
	provider: EProviders,
	allFn: () => Promise<string[]>,
	v4Fn: () => Promise<string[]>,
	v6Fn: () => Promise<string[]>,
): Promise<string[]> {
	switch (version) {
		case EVersion.V4:
			return await getCachedData(`${provider}V4`, v4Fn);
		case EVersion.V6:
			return await getCachedData(`${provider}V6`, v6Fn);
		case EVersion.ALL:
			return await getCachedData(provider, allFn);
	}
}

// Provider 函数映射，减少重复代码
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

async function getProviderData(provider: EProviders, version: EVersion): Promise<string[]> {
	const providerFuncs = PROVIDER_FUNCTIONS[provider];
	if (!providerFuncs) {
		logger.warn(`Unknown provider: ${provider}`);
		return [];
	}

	return await matchVersionFn(version, provider, providerFuncs.all, providerFuncs.v4, providerFuncs.v6);
}

type TCompositeObject = {
	[P in EProviders]?: {
		[EVersion.V4]?: string[];
		[EVersion.V6]?: string[];
	};
};

async function getCompositeObject(providers: EProviders[], version: EVersion): Promise<TCompositeObject> {
	const result: TCompositeObject = {};
	for (const provider of providers) {
		if (!result[provider]) {
			result[provider] = {};
		}
		if (version === EVersion.ALL) {
			result[provider]![EVersion.V4] = await getProviderData(provider, EVersion.V4);
			result[provider]![EVersion.V6] = await getProviderData(provider, EVersion.V6);
		} else {
			result[provider]![version] = await getProviderData(provider, version);
		}
	}
	return result;
}

async function getPlainObject(providers: EProviders[], version: EVersion): Promise<string[]> {
	const returns: string[] = [];

	for (const provider of providers) {
		returns.push(...(await getProviderData(provider, version)));
	}

	return Array.from(new Set(returns));
}

export async function getTransformedData(providers: EProviders[], version: EVersion, format: EFormat): Promise<string> {
	switch (format) {
		case EFormat.COMMA: {
			return (await getPlainObject(providers, version)).join(',');
		}
		case EFormat.SPACE: {
			return (await getPlainObject(providers, version)).join(' ');
		}
		case EFormat.LINE: {
			return (await getPlainObject(providers, version)).join('\n');
		}
		case EFormat.JSON_ARRAY_WITHOUT_SQUARE_BRACKETS: {
			return `${(await getPlainObject(providers, version)).map((item) => `"${item}"`).join(',')}`;
		}
		case EFormat.JSON: {
			return JSON.stringify(await getCompositeObject(providers, version));
		}
		case EFormat.JSON_TRANSPOSED: {
			const jsonObject = await getCompositeObject(providers, version);
			const transformedObject: { [EVersion.V4]: { [P in EProviders]?: string[] }; [EVersion.V6]: { [P in EProviders]?: string[] } } = {
				[EVersion.V4]: {},
				[EVersion.V6]: {},
			};
			for (const provider of providers) {
				if (version === EVersion.ALL) {
					transformedObject[EVersion.V4][provider] = jsonObject[provider]![EVersion.V4]!;
					transformedObject[EVersion.V6][provider] = jsonObject[provider]![EVersion.V6]!;
				} else {
					transformedObject[version][provider] = jsonObject[provider]![version]!;
				}
			}
			return JSON.stringify(transformedObject);
		}
		case EFormat.JSON_WITHOUT_PROVIDERS: {
			const jsonObject = await getCompositeObject(providers, version);
			const transformedObject: { [EVersion.V4]: string[]; [EVersion.V6]: string[] } = { [EVersion.V4]: [], [EVersion.V6]: [] };
			for (const provider of providers) {
				if (version === EVersion.ALL) {
					transformedObject[EVersion.V4].push(...jsonObject[provider]![EVersion.V4]!);
					transformedObject[EVersion.V6].push(...jsonObject[provider]![EVersion.V6]!);
				} else {
					transformedObject[version].push(...jsonObject[provider]![version]!);
				}
			}
			return JSON.stringify(transformedObject);
		}
		case EFormat.JSON_WITHOUT_VERSIONS: {
			const jsonObject = await getCompositeObject(providers, version);
			const transformedObject: Record<string, string[]> = {};
			for (const provider of providers) {
				transformedObject[provider] = [];
				if (version === EVersion.ALL) {
					transformedObject[provider].push(...jsonObject[provider]![EVersion.V4]!);
					transformedObject[provider].push(...jsonObject[provider]![EVersion.V6]!);
				} else {
					transformedObject[provider].push(...jsonObject[provider]![version]!);
				}
			}
			return JSON.stringify(transformedObject);
		}
		case EFormat.JSON_ARRAY: {
			return JSON.stringify(await getPlainObject(providers, version));
		}
	}
}
