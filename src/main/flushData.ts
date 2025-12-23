import dns from 'node:dns/promises';
import NodeCache from '@cacheable/node-cache';

import { BasicException, BasicExceptionCode } from '../exceptions/basic.exception';
import logger from '../utils/logger';
import { httpGet, multiLineStrToArray, transformIPToCIDR } from '../utils/utils';

// 缓存配置常量
const CACHE_CONFIG = {
	MAX_KEYS: 1000,
	STD_TTL: 60 * 60 * 24, // 24 小时
	SHORT_TTL: 60 * 60 * 4, // 4 小时
	CHECK_PERIOD: 60 * 60, // 1 小时
	OPTIMISM_TTL: 60 * 60 * 24 * 7, // 7 天
} as const;

export const cache = new NodeCache<Array<string>>({
	maxKeys: CACHE_CONFIG.MAX_KEYS,
	stdTTL: CACHE_CONFIG.STD_TTL,
	checkperiod: CACHE_CONFIG.CHECK_PERIOD,
	useClones: false, // 不克隆对象，提高性能
});

function throwError(name: string, message?: string): any {
	message
		= message
			|| `Get ${
				name
			} CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues`;
	throw new BasicException(BasicExceptionCode.InternalServerError, message);
}

function returnDirectly(name: string, data: Array<string> = []): Array<string> {
	cache.set(name, data, CACHE_CONFIG.STD_TTL);
	cache.set(`${name}Optimism`, data, CACHE_CONFIG.OPTIMISM_TTL);
	return data;
}

function getResultObjectByKeys(getResultObject: { [key: string]: any }, keys: Array<string>, valueTransFn?: (data: any) => string): Array<string> {
	const result: Array<string> = [];
	for (const key of keys) {
		if (getResultObject[key]) {
			if (valueTransFn) {
				result.push(...getResultObject[key].map(valueTransFn));
			}
			else {
				result.push(...getResultObject[key]);
			}
		}
	}
	return result;
}

async function getByLines(name: string, url: string, ranges?: Array<{ start?: string; end?: string }>): Promise<Array<string>> {
	logger.info('Fetch:', url);
	const getResult = await httpGet(url);
	if (getResult) {
		let returns = multiLineStrToArray(getResult);
		if (ranges) {
			const newReturns: Array<string> = [];
			for (const range of ranges) {
				const start = range.start ? returns.indexOf(range.start) + 1 : 0;
				const end = range.end ? returns.indexOf(range.end) : returns.length;
				if (start >= 0 && end >= 0 && start < end) {
					newReturns.push(...returns.slice(start, end));
				}
			}
			returns = Array.from(new Set(newReturns)); // 去重
		}

		returns = transformIPToCIDR(returns);
		cache.set(name, returns, CACHE_CONFIG.STD_TTL);
		cache.set(`${name}Optimism`, returns, CACHE_CONFIG.OPTIMISM_TTL);
		return returns;
	}
	return throwError(name);
}

async function getByJson(
	name: string,
	url: string,
	v4Keys: Array<string>,
	v6Keys: Array<string>,
	parentTransFn?: (data: any) => { [key: string]: any },
	valueTransFn?: (data: any) => string,
): Promise<Array<string>> {
	logger.info('Fetch:', url);
	const getResult = await httpGet(url);
	if (getResult) {
		let getResultObject: { [key: string]: any } = JSON.parse(getResult);

		if (parentTransFn) {
			getResultObject = parentTransFn(getResultObject);
		}

		const v4Returns = transformIPToCIDR(getResultObjectByKeys(getResultObject, v4Keys, valueTransFn));
		const v6Returns = transformIPToCIDR(getResultObjectByKeys(getResultObject, v6Keys, valueTransFn));
		const returns = [...v4Returns, ...v6Returns];
		cache.set(name, returns, CACHE_CONFIG.STD_TTL);
		cache.set(`${name}Optimism`, returns, CACHE_CONFIG.OPTIMISM_TTL);
		cache.set(`${name}V4`, v4Returns, CACHE_CONFIG.STD_TTL);
		cache.set(`${name}V4Optimism`, v4Returns, CACHE_CONFIG.OPTIMISM_TTL);
		cache.set(`${name}V6`, v6Returns, CACHE_CONFIG.STD_TTL);
		cache.set(`${name}V6Optimism`, v6Returns, CACHE_CONFIG.OPTIMISM_TTL);
		return returns;
	}
	return throwError(name);
}

async function getFromSub(name: string, v4Fn: () => Promise<Array<string>>, v6Fn: () => Promise<Array<string>>): Promise<Array<string>> {
	const v4 = await v4Fn();
	const v6 = await v6Fn();
	if (v4 && v6) {
		const returns = [...v4, ...v6];
		cache.set(name, returns, CACHE_CONFIG.SHORT_TTL);
		cache.set(`${name}Optimism`, returns, CACHE_CONFIG.OPTIMISM_TTL);
		return returns;
	}
	return throwError(name);
}

async function getFromParent(name: string, parentFn: () => Promise<Array<string>>): Promise<Array<string>> {
	await parentFn(); // 确保数据已缓存
	const returns: Array<string> | undefined = cache.get(name);
	if (returns)
		return returns;
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
	return returnDirectly('BunnyV6'); // Bunny 没有提供回源 IPv6 列表
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
	return returnDirectly('CacheFlyV6'); // CacheFly 没有提供回源 IPv6 列表
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
	const spfRegex = /^v=spf1 (.+) (-|~)all$/;
	for (const dataLine of dnsResolvedData) {
		const regexResult = dataLine.join(' ').match(spfRegex);
		if (regexResult && regexResult[1]) {
			const ips = regexResult[1]
				.split(' ')
				.filter(item => item.startsWith('ip4:'))
				.map(item => item.slice(4));
			if (ips.length > 0) {
				const returns = transformIPToCIDR(ips);
				cache.set('GoogleCloudV4', returns, CACHE_CONFIG.SHORT_TTL);
				cache.set('GoogleCloudV4Optimism', returns, CACHE_CONFIG.OPTIMISM_TTL);
				return returns;
			}
			else {
				// 当长度为 0 时，表示没有找到 IPv4 地址
				// 这不应该发生，需要记录日志、缩短缓存时间、并使用乐观缓存的数据替代标准缓存
				const optimismCacheData: Array<string> | undefined = cache.get('GoogleCloudV4Optimism');
				if (optimismCacheData) {
					logger.warn('Google Cloud V4 IPs not found, using optimism cache data instead.');
					cache.set('GoogleCloudV4', optimismCacheData, 60 * 10); // 缓存 10 分钟
					return optimismCacheData;
				}
				else {
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
	return returnDirectly('GoogleCloudV6'); // Google Cloud 没有提供回源 IPv6 列表
}

export async function flushGoogleCloud(): Promise<Array<string>> {
	return await getFromSub('GoogleCloud', flushGoogleCloudV4, flushGoogleCloudV6);
}

export async function flushGoogleCloudLoadBalancingV4(): Promise<Array<string>> {
	// https://cloud.google.com/load-balancing/docs/https#firewall-rules
	return returnDirectly('GoogleCloudLoadBalancingV4', ['35.191.0.0/16', '130.211.0.0/22', '34.96.0.0/20', '34.127.192.0/18']);
}

export async function flushGoogleCloudLoadBalancingV6(): Promise<Array<string>> {
	// https://cloud.google.com/load-balancing/docs/https#firewall-rules
	return returnDirectly('GoogleCloudLoadBalancingV6', ['2600:2d00:1:b029::/64', '2600:2d00:1:1::/64']);
}

export async function flushGoogleCloudLoadBalancing(): Promise<Array<string>> {
	return await getFromSub('GoogleCloudLoadBalancing', flushGoogleCloudLoadBalancingV4, flushGoogleCloudLoadBalancingV6);
}

export async function flushCDN77V4(): Promise<Array<string>> {
	return await getFromParent('CDN77V4', flushCDN77);
}

export async function flushCDN77V6(): Promise<Array<string>> {
	return await getFromParent('CDN77V6', flushCDN77);
}
export async function flushCDN77(): Promise<Array<string>> {
	return await getByJson(
		'CDN77',
		'https://prefixlists.tools.cdn77.com/public_lmax_prefixes.json',
		['prefixes'],
		[],
		undefined,
		(data: { prefix: string }) => {
			return data.prefix;
		},
	);
}

export async function flushArvancloudV4(): Promise<Array<string>> {
	return await getByLines('ArvancloudV4', 'https://www.arvancloud.ir/en/ips.txt');
}

export async function flushArvancloudV6(): Promise<Array<string>> {
	return returnDirectly('ArvancloudV6'); // Arvancloud 没有提供回源 IPv6 列表
}

export async function flushArvancloud(): Promise<Array<string>> {
	return await getFromSub('Arvancloud', flushArvancloudV4, flushArvancloudV6);
}

export async function flushF5CDNV4(): Promise<Array<string>> {
	return await getByLines('F5CDNV4', 'https://docs.cloud.f5.com/docs-v2/downloads/platform/reference/network-cloud-ref/ips-domains.txt', [
		{
			start: '### Public IPv4 Subnet Ranges for F5 Content Distribution Network Services',
			end: '### Public IPv4 Addresses for F5 Secondary DNS Zone Transfer',
		},
	]);
}

export async function flushF5CDNV6(): Promise<Array<string>> {
	return returnDirectly('F5CDNV6'); // F5 CDN 没有提供回源 IPv6 列表
}

export async function flushF5CDN(): Promise<Array<string>> {
	return await getFromSub('F5CDN', flushF5CDNV4, flushF5CDNV6);
}

export async function flushImpervaV4(): Promise<Array<string>> {
	return await getFromParent('ImpervaV4', flushImperva);
}

export async function flushImpervaV6(): Promise<Array<string>> {
	return await getFromParent('ImpervaV6', flushImperva);
}

export async function flushImperva(): Promise<Array<string>> {
	return await getByJson('Imperva', 'https://my.imperva.com/api/integration/v1/ips', ['ipRanges'], ['ipv6Ranges']);
}

export async function flushMedianovaV4(): Promise<Array<string>> {
	return await getFromParent('MedianovaV4', flushMedianova);
}

export async function flushMedianovaV6(): Promise<Array<string>> {
	return await getFromParent('MedianovaV6', flushMedianova);
}

export async function flushMedianova(): Promise<Array<string>> {
	return await getByJson(
		'Medianova',
		'https://cloud.medianova.com/api/v1/ip/blocks-list',
		['ipv4_cidrs'],
		['ipv6_cidrs'],
		(data: { result: { ipv4_cidrs: Array<string>; ipv6_cidrs: Array<string> } }) => {
			return data.result;
		},
	);
}

export async function flushALTERNcloudV4(): Promise<Array<string>> {
	return await getFromParent('ALTERNcloudV4', flushALTERNcloud);
}

export async function flushALTERNcloudV6(): Promise<Array<string>> {
	return await getFromParent('ALTERNcloudV6', flushALTERNcloud);
}

export async function flushALTERNcloud(): Promise<Array<string>> {
	return await getByJson('ALTERNcloud', 'https://api.alt2-cdn.alterncloud.com/cdn/public-ip-list', ['addresses'], ['addresses_v6']);
}
