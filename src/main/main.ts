import {
	flushALTERNcloudCDN,
	flushALTERNcloudCDNV4,
	flushALTERNcloudCDNV6,
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
	flushGoogleCloudCDN,
	flushGoogleCloudCDNV4,
	flushGoogleCloudCDNV6,
	flushGoogleCloudLoadBalancing,
	flushGoogleCloudLoadBalancingV4,
	flushGoogleCloudLoadBalancingV6,
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
import { getCachedData } from './getCachedData';

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
	GOOGLE_CLOUD_CDN = 'GoogleCloudCDN',
	GOOGLE_CLOUD_LOAD_BALANCING = 'GoogleCloudLoadBalancing',
	CDN77 = 'CDN77',
	ARVANCLOUD = 'Arvancloud',
	F5_CDN = 'F5CDN',
	IMPERVA = 'Imperva',
	MEDIANOVA = 'Medianova',
	ALTERNCLOUD_CDN = 'ALTERNcloudCDN',
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

async function getProviderData(provider: EProviders, version: EVersion): Promise<Array<string>> {
	const returns: Array<string> = [];
	switch (provider) {
		case EProviders.CLOUDFLARE: {
			version === EVersion.V4 && returns.push(...(await getCachedData('CloudflareV4', flushCloudflareV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('CloudflareV6', flushCloudflareV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Cloudflare', flushCloudflare)));
			break;
		}
		case EProviders.EDGEONE: {
			version === EVersion.V4 && returns.push(...(await getCachedData('EdgeOneV4', flushEdgeOneV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('EdgeOneV6', flushEdgeOneV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('EdgeOne', flushEdgeOne)));
			break;
		}
		case EProviders.FASTLY: {
			version === EVersion.V4 && returns.push(...(await getCachedData('FastlyV4', flushFastlyV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('FastlyV6', flushFastlyV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Fastly', flushFastly)));
			break;
		}
		case EProviders.GCORE: {
			version === EVersion.V4 && returns.push(...(await getCachedData('GcoreV4', flushGcoreV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('GcoreV6', flushGcoreV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Gcore', flushGcore)));
			break;
		}
		case EProviders.BUNNY: {
			version === EVersion.V4 && returns.push(...(await getCachedData('BunnyV4', flushBunnyV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('BunnyV6', flushBunnyV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Bunny', flushBunny)));
			break;
		}
		case EProviders.CLOUDFRONT: {
			version === EVersion.V4 && returns.push(...(await getCachedData('CloudFrontV4', flushCloudFrontV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('CloudFrontV6', flushCloudFrontV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('CloudFront', flushCloudFront)));
			break;
		}
		case EProviders.KEYCDN: {
			version === EVersion.V4 && returns.push(...(await getCachedData('KeyCDNV4', flushKeyCDNV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('KeyCDNV6', flushKeyCDNV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('KeyCDN', flushKeyCDN)));
			break;
		}
		case EProviders.QUIC_CLOUD: {
			version === EVersion.V4 && returns.push(...(await getCachedData('QUICcloudV4', flushQUICcloudV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('QUICcloudV6', flushQUICcloudV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('QUICcloud', flushQUICcloud)));
			break;
		}
		case EProviders.CACHEFLY: {
			version === EVersion.V4 && returns.push(...(await getCachedData('CacheFlyV4', flushCacheFlyV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('CacheFlyV6', flushCacheFlyV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('CacheFly', flushCacheFly)));
			break;
		}
		case EProviders.AKAMAI: {
			version === EVersion.V4 && returns.push(...(await getCachedData('AkamaiV4', flushAkamaiV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('AkamaiV6', flushAkamaiV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Akamai', flushAkamai)));
			break;
		}
		case EProviders.GOOGLE_CLOUD_CDN: {
			version === EVersion.V4 && returns.push(...(await getCachedData('GoogleCloudCDNV4', flushGoogleCloudCDNV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('GoogleCloudCDNV6', flushGoogleCloudCDNV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('GoogleCloudCDN', flushGoogleCloudCDN)));
			break;
		}
		case EProviders.GOOGLE_CLOUD_LOAD_BALANCING: {
			version === EVersion.V4 && returns.push(...(await getCachedData('GoogleCloudLoadBalancingV4', flushGoogleCloudLoadBalancingV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('GoogleCloudLoadBalancingV6', flushGoogleCloudLoadBalancingV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('GoogleCloudLoadBalancing', flushGoogleCloudLoadBalancing)));
			break;
		}
		case EProviders.CDN77: {
			version === EVersion.V4 && returns.push(...(await getCachedData('CDN77V4', flushCDN77V4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('CDN77V6', flushCDN77V6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('CDN77', flushCDN77)));
			break;
		}
		case EProviders.ARVANCLOUD: {
			version === EVersion.V4 && returns.push(...(await getCachedData('ArvancloudV4', flushArvancloudV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('ArvancloudV6', flushArvancloudV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Arvancloud', flushArvancloud)));
			break;
		}
		case EProviders.F5_CDN: {
			version === EVersion.V4 && returns.push(...(await getCachedData('F5CDNV4', flushF5CDNV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('F5CDNV6', flushF5CDNV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('F5CDN', flushF5CDN)));
			break;
		}
		case EProviders.IMPERVA: {
			version === EVersion.V4 && returns.push(...(await getCachedData('ImpervaV4', flushImpervaV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('ImpervaV6', flushImpervaV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Imperva', flushImperva)));
			break;
		}
		case EProviders.MEDIANOVA: {
			version === EVersion.V4 && returns.push(...(await getCachedData('MedianovaV4', flushMedianovaV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('MedianovaV6', flushMedianovaV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('Medianova', flushMedianova)));
			break;
		}
		case EProviders.ALTERNCLOUD_CDN: {
			version === EVersion.V4 && returns.push(...(await getCachedData('ALTERNcloudCDNV4', flushALTERNcloudCDNV4)));
			version === EVersion.V6 && returns.push(...(await getCachedData('ALTERNcloudCDNV6', flushALTERNcloudCDNV6)));
			version === EVersion.ALL && returns.push(...(await getCachedData('ALTERNcloudCDN', flushALTERNcloudCDN)));
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
		await getProviderData(provider, version);
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
