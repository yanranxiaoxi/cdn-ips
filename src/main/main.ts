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

async function getCachedData(tag: string, flushFn: () => Promise<Array<string>>): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get(tag);
	if (data) return data;

	const dataOptimism: Array<string> | undefined = cache.get(tag + 'Optimism');
	if (dataOptimism) {
		await flushFn();
		return dataOptimism;
	}
	return await flushFn();
}

async function matchVersionFn(
	version: EVersion,
	provider: EProviders,
	allFn: () => Promise<Array<string>>,
	v4Fn: () => Promise<Array<string>>,
	v6Fn: () => Promise<Array<string>>,
): Promise<Array<string>> {
	switch (version) {
		case EVersion.V4:
			return await getCachedData(`${provider}V4`, v4Fn);
		case EVersion.V6:
			return await getCachedData(`${provider}V6`, v6Fn);
		case EVersion.ALL:
			return await getCachedData(provider, allFn);
	}
}

async function getProviderData(provider: EProviders, version: EVersion): Promise<Array<string>> {
	const returns: Array<string> = [];
	switch (provider) {
		case EProviders.CLOUDFLARE: {
			returns.push(...(await matchVersionFn(version, EProviders.CLOUDFLARE, flushCloudflare, flushCloudflareV4, flushCloudflareV6)));
			break;
		}
		case EProviders.EDGEONE: {
			returns.push(...(await matchVersionFn(version, EProviders.EDGEONE, flushEdgeOne, flushEdgeOneV4, flushEdgeOneV6)));
			break;
		}
		case EProviders.FASTLY: {
			returns.push(...(await matchVersionFn(version, EProviders.FASTLY, flushFastly, flushFastlyV4, flushFastlyV6)));
			break;
		}
		case EProviders.GCORE: {
			returns.push(...(await matchVersionFn(version, EProviders.GCORE, flushGcore, flushGcoreV4, flushGcoreV6)));
			break;
		}
		case EProviders.BUNNY: {
			returns.push(...(await matchVersionFn(version, EProviders.BUNNY, flushBunny, flushBunnyV4, flushBunnyV6)));
			break;
		}
		case EProviders.CLOUDFRONT: {
			returns.push(...(await matchVersionFn(version, EProviders.CLOUDFRONT, flushCloudFront, flushCloudFrontV4, flushCloudFrontV6)));
			break;
		}
		case EProviders.KEYCDN: {
			returns.push(...(await matchVersionFn(version, EProviders.KEYCDN, flushKeyCDN, flushKeyCDNV4, flushKeyCDNV6)));
			break;
		}
		case EProviders.QUIC_CLOUD: {
			returns.push(...(await matchVersionFn(version, EProviders.QUIC_CLOUD, flushQUICcloud, flushQUICcloudV4, flushQUICcloudV6)));
			break;
		}
		case EProviders.CACHEFLY: {
			returns.push(...(await matchVersionFn(version, EProviders.CACHEFLY, flushCacheFly, flushCacheFlyV4, flushCacheFlyV6)));
			break;
		}
		case EProviders.AKAMAI: {
			returns.push(...(await matchVersionFn(version, EProviders.AKAMAI, flushAkamai, flushAkamaiV4, flushAkamaiV6)));
			break;
		}
		case EProviders.GOOGLE_CLOUD: {
			returns.push(...(await matchVersionFn(version, EProviders.GOOGLE_CLOUD, flushGoogleCloud, flushGoogleCloudV4, flushGoogleCloudV6)));
			break;
		}
		case EProviders.GOOGLE_CLOUD_LOAD_BALANCING: {
			returns.push(
				...(await matchVersionFn(
					version,
					EProviders.GOOGLE_CLOUD_LOAD_BALANCING,
					flushGoogleCloudLoadBalancing,
					flushGoogleCloudLoadBalancingV4,
					flushGoogleCloudLoadBalancingV6,
				)),
			);
			break;
		}
		case EProviders.CDN77: {
			returns.push(...(await matchVersionFn(version, EProviders.CDN77, flushCDN77, flushCDN77V4, flushCDN77V6)));
			break;
		}
		case EProviders.ARVANCLOUD: {
			returns.push(...(await matchVersionFn(version, EProviders.ARVANCLOUD, flushArvancloud, flushArvancloudV4, flushArvancloudV6)));
			break;
		}
		case EProviders.F5_CDN: {
			returns.push(...(await matchVersionFn(version, EProviders.F5_CDN, flushF5CDN, flushF5CDNV4, flushF5CDNV6)));
			break;
		}
		case EProviders.IMPERVA: {
			returns.push(...(await matchVersionFn(version, EProviders.IMPERVA, flushImperva, flushImpervaV4, flushImpervaV6)));
			break;
		}
		case EProviders.MEDIANOVA: {
			returns.push(...(await matchVersionFn(version, EProviders.MEDIANOVA, flushMedianova, flushMedianovaV4, flushMedianovaV6)));
			break;
		}
		case EProviders.ALTERNCLOUD: {
			returns.push(...(await matchVersionFn(version, EProviders.ALTERNCLOUD, flushALTERNcloud, flushALTERNcloudV4, flushALTERNcloudV6)));
			break;
		}
	}
	return returns;
}

type TCompositeObject = {
	[P in EProviders]?: {
		[EVersion.V4]?: Array<string>;
		[EVersion.V6]?: Array<string>;
	};
};

async function getCompositeObject(providers: Array<EProviders>, version: EVersion): Promise<TCompositeObject> {
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

async function getPlainObject(providers: Array<EProviders>, version: EVersion): Promise<Array<string>> {
	const returns: Array<string> = [];

	for (const provider of providers) {
		returns.push(...(await getProviderData(provider, version)));
	}

	return Array.from(new Set(returns));
}

export async function getTransformedData(providers: Array<EProviders>, version: EVersion, format: EFormat): Promise<string> {
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
			const transformedObject: { [EVersion.V4]: { [P in EProviders]?: Array<string> }; [EVersion.V6]: { [P in EProviders]?: Array<string> } } =
				{ [EVersion.V4]: {}, [EVersion.V6]: {} };
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
			const transformedObject: { [EVersion.V4]: Array<string>; [EVersion.V6]: Array<string> } = { [EVersion.V4]: [], [EVersion.V6]: [] };
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
			const transformedObject: { [provider: string]: Array<string> } = {};
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
