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
		cache.set('FastlyV4Optimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		cache.set('FastlyV6', getResultObject.ipv6_addresses, 60 * 60 * 24); // 缓存 24 小时
		cache.set('FastlyV6Optimism', returns, 60 * 60 * 24 * 7); // 乐观缓存 7 天
		return returns;
	}
	throw new BasicException(
		BasicExceptionCode.InternalServerError,
		"Get CDN provider's IPs API error. This should be a temporary issue. Send report: https://github.com/yanranxiaoxi/cdn-ips/issues",
	);
}
