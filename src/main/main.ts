import {
	flushCloudflare,
	flushCloudflareV4,
	flushCloudflareV6,
	flushEdgeOne,
	flushEdgeOneV4,
	flushEdgeOneV6,
	flushFastly,
	flushFastlyV4,
	flushFastlyV6,
} from './flushData';
import { getCachedData } from './getCachedData';

export enum EProviders {
	CLOUDFLARE = 'Cloudflare',
	EDGEONE = 'EdgeOne',
	FASTLY = 'Fastly',
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
			case EProviders.ALL:
			default: {
				version === EVersion.V4 &&
					returns.push(
						...(await getCachedData('CloudflareV4', flushCloudflareV4)),
						...(await getCachedData('EdgeOneV4', flushEdgeOneV4)),
						...(await getCachedData('FastlyV4', flushFastlyV4)),
					);
				version === EVersion.V6 &&
					returns.push(
						...(await getCachedData('CloudflareV6', flushCloudflareV6)),
						...(await getCachedData('EdgeOneV6', flushEdgeOneV6)),
						...(await getCachedData('FastlyV6', flushFastlyV6)),
					);
				version === EVersion.ALL &&
					returns.push(
						...(await getCachedData('Cloudflare', flushCloudflare)),
						...(await getCachedData('EdgeOne', flushEdgeOne)),
						...(await getCachedData('Fastly', flushFastly)),
					);
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
