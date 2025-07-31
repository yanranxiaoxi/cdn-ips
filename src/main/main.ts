import {
	flushAkamai,
	flushAkamaiV4,
	flushAkamaiV6,
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
	flushFastly,
	flushFastlyV4,
	flushFastlyV6,
	flushGcore,
	flushGcoreV4,
	flushGcoreV6,
	flushGoogleCloud,
	flushGoogleCloudV4,
	flushGoogleCloudV6,
	flushKeyCDN,
	flushKeyCDNV4,
	flushKeyCDNV6,
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
	GoogleCloud = 'GoogleCloud',
	CDN77 = 'CDN77',
	ALL = 'all',
}

export enum EVersion {
	V4 = 'v4',
	V6 = 'v6',
	ALL = 'all',
}

export enum EFormat {
	// JSON = 'json',
	JSON_ARRAY = 'json-array',
	JSON_ARRAY_LIKE = 'json-array-like',
	COMMA = 'comma',
	SPACE = 'space',
	LINE = 'line',
}

export async function getData(providers: Array<EProviders>, version: EVersion): Promise<Array<string>> {
	const returns: Array<string> = [];
	if (providers.length === 1 && providers[0] === EProviders.ALL) {
		providers = [
			EProviders.CLOUDFLARE,
			EProviders.EDGEONE,
			EProviders.FASTLY,
			EProviders.GCORE,
			EProviders.BUNNY,
			EProviders.CLOUDFRONT,
			EProviders.KEYCDN,
			EProviders.QUIC_CLOUD,
			EProviders.CACHEFLY,
			EProviders.AKAMAI,
			EProviders.GoogleCloud,
			EProviders.CDN77,
		];
	}

	for (const provider of providers) {
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
			case EProviders.GoogleCloud: {
				version === EVersion.V4 && returns.push(...(await getCachedData('GoogleCloudV4', flushGoogleCloudV4)));
				version === EVersion.V6 && returns.push(...(await getCachedData('GoogleCloudV6', flushGoogleCloudV6)));
				version === EVersion.ALL && returns.push(...(await getCachedData('GoogleCloud', flushGoogleCloud)));
				break;
			}
			case EProviders.CDN77: {
				version === EVersion.V4 && returns.push(...(await getCachedData('CDN77V4', flushCDN77V4)));
				version === EVersion.V6 && returns.push(...(await getCachedData('CDN77V6', flushCDN77V6)));
				version === EVersion.ALL && returns.push(...(await getCachedData('CDN77', flushCDN77)));
				break;
			}
		}
	}

	return Array.from(new Set(returns));
}

export function transformData(data: Array<string>, format: EFormat): string {
	switch (format) {
		case EFormat.COMMA: {
			return data.join(',');
		}
		case EFormat.SPACE: {
			return data.join(' ');
		}
		case EFormat.LINE: {
			return data.join('\n');
		}
		case EFormat.JSON_ARRAY_LIKE: {
			return `${data.map((item) => `"${item}"`).join(',')}`;
		}
		case EFormat.JSON_ARRAY:
		default: {
			return JSON.stringify(data);
		}
	}
}
