import NodeCache from '@cacheable/node-cache';
import dns from 'node:dns/promises';

import { BasicException, BasicExceptionCode } from '../exceptions/basic.exception';
import logger from '../utils/logger';
import { httpGet, multiLineStrToArray } from '../utils/utils';

const cache = new NodeCache();

function throwError(name: string): any {
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		'Get ' +
			name +
			" CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

function returnBlank(name: string): Array<string> {
	cache.set(name, [], 60 * 60 * 24); // 缓存 24 小时
	cache.set(name + 'Optimism', [], 60 * 60 * 24 * 7); // 乐观缓存 7 天
	return [];
}

async function getByLines(name: string, url: string): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get(name);
	if (data) return data;

	logger.info('Fetch:', url);
	const getResult = await httpGet(url);
	if (getResult) {
		const returns = multiLineStrToArray(getResult);
		cache.set(name, returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set(name + 'Optimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	return throwError(name);
}

async function getByJson(
	name: string,
	url: string,
	v4Keys: Array<string>,
	v6Keys: Array<string>,
	transFn?: (data: any) => string,
): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get(name);
	if (data) return data;

	logger.info('Fetch:', url);
	const getResult = await httpGet(url);
	if (getResult) {
		const getResultObject: { [key: string]: Array<string> } = JSON.parse(getResult);

		function getResultObjectByKeys(keys: Array<string>): Array<string> {
			const result: Array<string> = [];
			for (const key of keys) {
				if (getResultObject[key]) {
					if (transFn) {
						result.push(...getResultObject[key].map(transFn));
					} else {
						result.push(...getResultObject[key]);
					}
				}
			}
			return result;
		}

		const v4Returns = getResultObjectByKeys(v4Keys);
		const v6Returns = getResultObjectByKeys(v6Keys);
		const returns = [...v4Returns, ...v6Returns];
		cache.set(name, returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set(name + 'Optimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set(name + 'V4', v4Returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set(name + 'V4Optimism', v4Returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set(name + 'V6', v6Returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set(name + 'V6Optimism', v6Returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	return throwError(name);
}

async function getFromSub(name: string, v4Fn: () => Promise<Array<string>>, v6Fn: () => Promise<Array<string>>): Promise<Array<string>> {
	const v4 = await v4Fn();
	const v6 = await v6Fn();
	if (v4 && v6) {
		const returns = Array.from(new Set([...v4, ...v6]));
		cache.set(name, returns, 60 * 60 * 4); // 缓存 4 小时
		cache.set(name + 'Optimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	return throwError(name);
}

async function getFromParent(name: string, parentFn: () => Promise<Array<string>>): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get(name);
	if (data) return data;

	await parentFn(); // 确保数据已缓存
	const returns: Array<string> | undefined = cache.get(name);
	if (returns) return returns;
	return throwError(name);
}

export async function flushEdgeOneV4(): Promise<Array<string>> {
	return await getByLines('EdgeOneV4', 'https://api.edgeone.ai/ips?version=v4');
}

export async function flushEdgeOneV6(): Promise<Array<string>> {
	return await getByLines('EdgeOneV6', 'https://api.edgeone.ai/ips?version=v6');
}

export async function flushEdgeOne(): Promise<Array<string>> {
	return await getByLines('EdgeOne', 'https://api.edgeone.ai/ips');
}

export async function flushCloudflareV4(): Promise<Array<string>> {
	return await getByLines('CloudflareV4', 'https://www.cloudflare.com/ips-v4/#');
}

export async function flushCloudflareV6(): Promise<Array<string>> {
	return await getByLines('CloudflareV6', 'https://www.cloudflare.com/ips-v6/#');
}

export async function flushCloudflare(): Promise<Array<string>> {
	return await getFromSub('Cloudflare', flushCloudflareV4, flushCloudflareV6);
}

export async function flushFastlyV4(): Promise<Array<string>> {
	return await getFromParent('FastlyV4', flushFastly);
}

export async function flushFastlyV6(): Promise<Array<string>> {
	return await getFromParent('FastlyV6', flushFastly);
}

export async function flushFastly(): Promise<Array<string>> {
	return await getByJson('Fastly', 'https://api.fastly.com/public-ip-list', ['addresses'], ['ipv6_addresses']);
}

export async function flushGcoreV4(): Promise<Array<string>> {
	return await getFromParent('GcoreV4', flushGcore);
}

export async function flushGcoreV6(): Promise<Array<string>> {
	return await getFromParent('GcoreV6', flushGcore);
}

export async function flushGcore(): Promise<Array<string>> {
	return await getByJson('Gcore', 'https://api.gcore.com/cdn/public-ip-list', ['addresses'], ['addresses_v6']);
}

export async function flushBunnyV4(): Promise<Array<string>> {
	return await getByLines('BunnyV4', 'https://api.bunny.net/system/edgeserverlist/plain');
}

export async function flushBunnyV6(): Promise<Array<string>> {
	return returnBlank('BunnyV6'); // Bunny 没有提供回源 IPv6 列表
}

export async function flushBunny(): Promise<Array<string>> {
	return await getFromSub('Bunny', flushBunnyV4, flushBunnyV6);
}

export async function flushCloudFrontV4(): Promise<Array<string>> {
	return await getFromParent('CloudFrontV4', flushCloudFront);
}

export async function flushCloudFrontV6(): Promise<Array<string>> {
	return await getFromParent('CloudFrontV6', flushCloudFront);
}

export async function flushCloudFront(): Promise<Array<string>> {
	return await getByJson(
		'CloudFront',
		'https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips',
		['CLOUDFRONT_GLOBAL_IP_LIST', 'CLOUDFRONT_REGIONAL_EDGE_IP_LIST'],
		[],
	);
}

export async function flushKeyCDNV4(): Promise<Array<string>> {
	return await getFromParent('KeyCDNV4', flushKeyCDN);
}

export async function flushKeyCDNV6(): Promise<Array<string>> {
	return await getFromParent('KeyCDNV6', flushKeyCDN);
}

export async function flushKeyCDN(): Promise<Array<string>> {
	return await getByJson('KeyCDN', 'https://www.keycdn.com/shield-prefixes.json', ['prefixes'], []);
}

export async function flushQUICcloudV4(): Promise<Array<string>> {
	return await getByLines('QUICcloudV4', 'https://www.quic.cloud/ips-v4');
}

export async function flushQUICcloudV6(): Promise<Array<string>> {
	return await getByLines('QUICcloudV6', 'https://www.quic.cloud/ips-v6');
}

export async function flushQUICcloud(): Promise<Array<string>> {
	return await getByLines('QUICcloud', 'https://www.quic.cloud/ips-all');
}

export async function flushCacheFlyV4(): Promise<Array<string>> {
	return await getByLines('CacheFlyV4', 'https://cachefly.cachefly.net/ips/rproxy.txt');
}

export async function flushCacheFlyV6(): Promise<Array<string>> {
	return returnBlank('CacheFlyV6'); // CacheFly 没有提供回源 IPv6 列表
}

export async function flushCacheFly(): Promise<Array<string>> {
	return await getFromSub('CacheFly', flushCacheFlyV4, flushCacheFlyV6);
}

export async function flushAkamaiV4(): Promise<Array<string>> {
	return await getByLines('AkamaiV4', 'https://techdocs.akamai.com/property-manager/pdfs/akamai_ipv4_CIDRs.txt');
}

export async function flushAkamaiV6(): Promise<Array<string>> {
	return await getByLines('AkamaiV6', 'https://techdocs.akamai.com/property-manager/pdfs/akamai_ipv6_CIDRs.txt');
}

export async function flushAkamai(): Promise<Array<string>> {
	return await getFromSub('Akamai', flushAkamaiV4, flushAkamaiV6);
}

export async function flushGoogleCloudV4(): Promise<Array<string>> {
	logger.info('Resolve:', '_cloud-eoips.googleusercontent.com');
	dns.setServers(['8.8.8.8', '8.8.4.4', '[2001:4860:4860::8888]', '[2001:4860:4860::8844]']);
	const dnsResolvedData: Array<Array<string>> = await dns.resolveTxt('_cloud-eoips.googleusercontent.com');
	const spfRegex = /^v\=spf1 (.+) (\-|\~)all$/;
	for (const dataLine of dnsResolvedData) {
		const regexResult = dataLine.join(' ').match(spfRegex);
		if (regexResult && regexResult[1]) {
			const ips = regexResult[1]
				.split(' ')
				.filter((item) => item.startsWith('ip4:'))
				.map((item) => item.slice(4));
			if (ips.length > 0) {
				cache.set('GoogleCloudV4', ips, 60 * 60 * 4); // 缓存 4 小时
				cache.set('GoogleCloudV4Optimism', ips, 60 * 60 * 24 * 7); // 乐观缓存 7 天
				return ips;
			} else {
				// 当长度为 0 时，表示没有找到 IPv4 地址
				// 这不应该发生，需要记录日志、缩短缓存时间、并使用乐观缓存的数据替代标准缓存
				const optimismCacheData: Array<string> | undefined = cache.get('GoogleCloudV4Optimism');
				if (optimismCacheData) {
					logger.warn('Google Cloud V4 IPs not found, using optimism cache data instead.');
					cache.set('GoogleCloudV4', optimismCacheData, 60 * 10); // 缓存 10 分钟
					return optimismCacheData;
				} else {
					// cache.set('GoogleCloudV4', [], 60 * 10); // 缓存 10 分钟
					// cache.set('GoogleCloudV4Optimism', [], 60 * 10); // 缓存 10 分钟
					// 乐观缓存也不存在数据时需要抛出异常
				}
			}
		}
	}
	return throwError('GoogleCloudV4');
}

export async function flushGoogleCloudV6(): Promise<Array<string>> {
	return returnBlank('GoogleCloudV6'); // Google Cloud 没有提供回源 IPv6 列表
}

export async function flushGoogleCloud(): Promise<Array<string>> {
	return await getFromSub('GoogleCloud', flushGoogleCloudV4, flushGoogleCloudV6);
}

export async function flushCDN77V4(): Promise<Array<string>> {
	return await getFromParent('CDN77V4', flushCDN77);
}

export async function flushCDN77V6(): Promise<Array<string>> {
	return await getFromParent('CDN77V6', flushCDN77);
}
export async function flushCDN77(): Promise<Array<string>> {
	return await getByJson('CDN77', 'https://prefixlists.tools.cdn77.com/public_lmax_prefixes.json', ['prefixes'], [], (data: { prefix: string }) => {
		return data.prefix;
	});
}
