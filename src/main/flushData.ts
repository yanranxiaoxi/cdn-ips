import NodeCache from '@cacheable/node-cache';

import { BasicException, BasicExceptionCode } from '../exceptions/basic.exception';
import logger from '../utils/logger';
import { httpGet, multiLineStrToArray } from '../utils/utils';

const cache = new NodeCache();

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
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
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
	const v4 = await flushCloudflareV4();
	const v6 = await flushCloudflareV6();
	if (v4 && v6) {
		const returns = Array.from(new Set([...v4, ...v6]));
		cache.set('Cloudflare', returns, 60 * 60 * 4); // 缓存 4 小时
		cache.set('CloudflareOptimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushFastlyV4(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('FastlyV4');
	if (data) return data;

	await flushFastly(); // 确保 Fastly 数据已缓存
	const returns: Array<string> | undefined = cache.get('FastlyV4');
	if (returns) {
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushFastlyV6(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('FastlyV6');
	if (data) return data;

	await flushFastly(); // 确保 Fastly 数据已缓存
	const returns: Array<string> | undefined = cache.get('FastlyV6');
	if (returns) {
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushFastly(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('Fastly');
	if (data) return data;

	logger.info('Fetch:', 'https://api.fastly.com/public-ip-list');
	const getResult = await httpGet('https://api.fastly.com/public-ip-list');
	if (getResult) {
		const getResultObject: { addresses: Array<string>; ipv6_addresses: Array<string> } = JSON.parse(getResult);
		const returns = Array.from(new Set([...getResultObject.addresses, ...getResultObject.ipv6_addresses]));
		cache.set('Fastly', returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set('FastlyOptimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set('FastlyV4', getResultObject.addresses, 60 * 60 * 24); // 缓存 24 小时
		cache.set('FastlyV4Optimism', getResultObject.addresses, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set('FastlyV6', getResultObject.ipv6_addresses, 60 * 60 * 24); // 缓存 24 小时
		cache.set('FastlyV6Optimism', getResultObject.ipv6_addresses, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushGcoreV4(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('GcoreV4');
	if (data) return data;

	await flushGcore(); // 确保 Gcore 数据已缓存
	const returns: Array<string> | undefined = cache.get('GcoreV4');
	if (returns) {
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushGcoreV6(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('GcoreV6');
	if (data) return data;

	await flushGcore(); // 确保 Gcore 数据已缓存
	const returns: Array<string> | undefined = cache.get('GcoreV6');
	if (returns) {
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushGcore(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('Gcore');
	if (data) return data;

	logger.info('Fetch:', 'https://api.gcore.com/cdn/public-ip-list');
	const getResult = await httpGet('https://api.gcore.com/cdn/public-ip-list');
	if (getResult) {
		const getResultObject: { addresses: Array<string>; addresses_v6: Array<string> } = JSON.parse(getResult);
		const returns = Array.from(new Set([...getResultObject.addresses, ...getResultObject.addresses_v6]));
		cache.set('Gcore', returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set('GcoreOptimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set('GcoreV4', getResultObject.addresses, 60 * 60 * 24); // 缓存 24 小时
		cache.set('GcoreV4Optimism', getResultObject.addresses, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set('GcoreV6', getResultObject.addresses_v6, 60 * 60 * 24); // 缓存 24 小时
		cache.set('GcoreV6Optimism', getResultObject.addresses_v6, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushBunnyV4(): Promise<Array<string>> {
	return await getByLines('Bunny', 'https://api.bunny.net/system/edgeserverlist/plain');
}

export async function flushBunnyV6(): Promise<Array<string>> {
	// Bunny 没有提供回源 IPv6 列表
	cache.set('BunnyV6', [], 60 * 60 * 24); // 缓存 24 小时
	cache.set('BunnyV6Optimism', [], 60 * 60 * 24 * 7); // 乐观缓存 7 天
	return [];
}

export async function flushBunny(): Promise<Array<string>> {
	const v4 = await flushBunnyV4();
	const v6 = await flushBunnyV6();
	if (v4 && v6) {
		const returns = Array.from(new Set([...v4, ...v6]));
		cache.set('Bunny', returns, 60 * 60 * 4); // 缓存 4 小时
		cache.set('BunnyOptimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushCloudFrontV4(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('CloudFrontV4');
	if (data) return data;

	await flushCloudFront(); // 确保 CloudFront 数据已缓存
	const returns: Array<string> | undefined = cache.get('CloudFrontV4');
	if (returns) {
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushCloudFrontV6(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('CloudFrontV6');
	if (data) return data;

	await flushCloudFront(); // 确保 CloudFront 数据已缓存
	const returns: Array<string> | undefined = cache.get('CloudFrontV6');
	if (returns) {
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}

export async function flushCloudFront(): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get('CloudFront');
	if (data) return data;

	logger.info('Fetch:', 'https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips');
	const getResult = await httpGet('https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips');
	if (getResult) {
		const getResultObject: { CLOUDFRONT_GLOBAL_IP_LIST: Array<string>; CLOUDFRONT_REGIONAL_EDGE_IP_LIST: Array<string> } = JSON.parse(getResult);
		const returns = Array.from(new Set([...getResultObject.CLOUDFRONT_GLOBAL_IP_LIST, ...getResultObject.CLOUDFRONT_REGIONAL_EDGE_IP_LIST]));
		cache.set('CloudFront', returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set('CloudFrontOptimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set('CloudFrontV4', returns, 60 * 60 * 24); // 缓存 24 小时
		cache.set('CloudFrontV4Optimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		// CloudFront 没有提供回源 IPv6 列表
		cache.set('CloudFrontV6', [], 60 * 60 * 24); // 缓存 24 小时
		cache.set('CloudFrontV6Optimism', [], 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}
