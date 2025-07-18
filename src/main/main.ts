import {
	getCloudflare,
	getCloudflareV4,
	getCloudflareV6,
	getEdgeOne,
	getEdgeOneV4,
	getEdgeOneV6,
	getFastly,
	getFastlyV4,
	getFastlyV6,
} from './getData';

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
				version === EVersion.V4 && returns.push(...(await getCloudflareV4()));
				version === EVersion.V6 && returns.push(...(await getCloudflareV6()));
				version === EVersion.ALL && returns.push(...(await getCloudflare()));
				break;
			}
			case EProviders.EDGEONE: {
				version === EVersion.V4 && returns.push(...(await getEdgeOneV4()));
				version === EVersion.V6 && returns.push(...(await getEdgeOneV6()));
				version === EVersion.ALL && returns.push(...(await getEdgeOne()));
				break;
			}
			case EProviders.FASTLY: {
				version === EVersion.V4 && returns.push(...(await getFastlyV4()));
				version === EVersion.V6 && returns.push(...(await getFastlyV6()));
				version === EVersion.ALL && returns.push(...(await getFastly()));
				break;
			}
			case EProviders.ALL:
			default: {
				version === EVersion.V4 && returns.push(...(await getCloudflareV4()), ...(await getEdgeOneV4()), ...(await getFastlyV4()));
				version === EVersion.V6 && returns.push(...(await getCloudflareV6()), ...(await getEdgeOneV6()), ...(await getFastlyV6()));
				version === EVersion.ALL && returns.push(...(await getCloudflare()), ...(await getEdgeOne()), ...(await getFastly()));
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
