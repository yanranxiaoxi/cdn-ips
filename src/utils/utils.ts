import { randomUUID } from 'crypto';

import logger from './logger';

export function instanceValue<T>(initializer: () => T) {
	let firstRun = true;
	let value: T;
	return () => {
		if (firstRun) {
			firstRun = false;
			value = initializer();
		}
		return value;
	};
}

export function getOrInitMap<K, V>(map: Map<K, V>, key: K, initializer: (key: K) => V) {
	const value = map.get(key);
	if (value) {
		return value;
	} else {
		const newValue = initializer(key);
		map.set(key, newValue);
		return newValue;
	}
}

export function getUuid() {
	return randomUUID().replace(/-/g, '');
}

/**
 * HTTP GET 请求
 *
 * @param url - 请求的 URL
 * @param args - 查询参数对象，键为参数名，值为参数值
 * @returns 返回响应文本，如果请求失败或发生错误则返回 undefined
 */
export async function httpGet(url: string, args?: { [key: string]: string | number | boolean }): Promise<string | undefined> {
	if (typeof args === 'object') {
		url += '?';
		let argKVs = [];
		for (const [key, value] of Object.entries(args)) {
			if (value !== undefined && value !== null) {
				argKVs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`);
			}
		}
		url += argKVs.join('&');
	}

	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

	const options: RequestInit = {
		method: 'GET',
		cache: 'no-store',
		redirect: 'follow',
		signal: controller.signal,
		headers: {
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 CDN-IPs/1.0',
		},
	};
	try {
		const response = await fetch(url, options);
		clearTimeout(timeoutId);
		if (response.ok) {
			return await response.text();
		} else {
			logger.error('HTTP GET failed:', url, '\n', response.status, response.statusText);
			return undefined;
		}
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === 'AbortError') {
			logger.error('HTTP GET timeout:', url);
		} else {
			logger.error('HTTP GET failed:', url, '\n', error);
		}
		return undefined;
	}
}

/**
 * 将多行字符串拆分成字符串数组
 *
 * @remarks 空行会被忽略
 * @param str - 多行字符串
 * @returns 字符串数组
 */
export function multiLineStrToArray(str: string): Array<string> {
	const strList = str.split(/[\r\n]+/);
	strList.forEach((value, index) => {
		if (!value.trim()) {
			strList.splice(index, 1);
		}
	});
	return strList.map((value) => value.trim());
}

/**
 * 验证 IPv4 地址格式
 *
 * @param ip - IPv4 地址
 * @returns 验证结果
 */
export function isValidIPv4Address(ip: string): boolean {
	const ipv4Regex =
		/^((?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]))$/;
	return ipv4Regex.test(ip);
}

/**
 * 验证 IPv6 地址格式
 *
 * @param ip - IPv6 地址
 * @returns 验证结果
 */
export function isValidIPv6Address(ip: string): boolean {
	const ipv6Regex =
		/^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:)|(([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2})|(([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3})|(([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4})|(([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5})|([0-9A-Fa-f]{1,4}:((:[0-9A-Fa-f]{1,4}){1,6}))|(:((:[0-9A-Fa-f]{1,4}){1,7}|:))|(::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4][0-9])|(1[0-9]{2})|([1-9]?[0-9]))\.){3,3}(25[0-5]|(2[0-4][0-9])|(1[0-9]{2})|([1-9]?[0-9])))))$/;
	return ipv6Regex.test(ip);
}

/**
 * 验证 IP 地址格式
 *
 * @param ip - IP 地址
 * @returns 验证结果
 */
export function isValidIP(ip: string): boolean {
	return isValidIPv4Address(ip) || isValidIPv6Address(ip);
}

/**
 * 验证 IPv4 CIDR 格式
 *
 * @param cidr - IPv4 地址
 * @returns 验证结果
 */
export function isValidIPv4CIDR(cidr: string): boolean {
	const cidrRegex =
		/^((?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]))(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
	return cidrRegex.test(cidr);
}

/**
 * 验证 IPv6 CIDR 格式
 *
 * @param cidr - IPv6 地址
 * @returns 验证结果
 */
export function isValidIPv6CIDR(cidr: string): boolean {
	const cidrRegex =
		/^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:)|(([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2})|(([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3})|(([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4})|(([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5})|([0-9A-Fa-f]{1,4}:((:[0-9A-Fa-f]{1,4}){1,6}))|(:((:[0-9A-Fa-f]{1,4}){1,7}|:))|(::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4][0-9])|(1[0-9]{2})|([1-9]?[0-9]))\.){3,3}(25[0-5]|(2[0-4][0-9])|(1[0-9]{2})|([1-9]?[0-9])))))(\/([1-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/;
	return cidrRegex.test(cidr);
}

/**
 * 验证 IP CIDR 格式
 *
 * @param cidr - IP 地址
 * @returns 验证结果
 */
export function isValidCIDR(cidr: string): boolean {
	return isValidIPv4CIDR(cidr) || isValidIPv6CIDR(cidr);
}

/**
 * 验证严格的 IPv4 CIDR 格式
 *
 * @remarks IPv4 CIDR 格式要求最后必须有斜杠和前缀长度
 * @param cidr - IPv4 地址
 * @returns 验证结果
 */
export function isValidIPv4StrictCIDR(cidr: string): boolean {
	const cidrRegex =
		/^((?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[01]?[0-9]{1,2}|2[0-4][0-9]|25[0-5]))(\/([0-9]|[1-2][0-9]|3[0-2]))$/;
	return cidrRegex.test(cidr);
}

/**
 * 验证严格的 IPv6 CIDR 格式
 *
 * @remarks IPv6 CIDR 格式要求最后必须有斜杠和前缀长度
 * @param cidr - IPv6 地址
 * @returns 验证结果
 */
export function isValidIPv6StrictCIDR(cidr: string): boolean {
	const cidrRegex =
		/^((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:)|(([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2})|(([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3})|(([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4})|(([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5})|([0-9A-Fa-f]{1,4}:((:[0-9A-Fa-f]{1,4}){1,6}))|(:((:[0-9A-Fa-f]{1,4}){1,7}|:))|(::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4][0-9])|(1[0-9]{2})|([1-9]?[0-9]))\.){3,3}(25[0-5]|(2[0-4][0-9])|(1[0-9]{2})|([1-9]?[0-9])))))(\/([1-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))$/;
	return cidrRegex.test(cidr);
}

/**
 * 验证严格的 IP CIDR 格式
 *
 * @remarks IP CIDR 格式要求最后必须有斜杠和前缀长度
 * @param cidr - IP 地址
 * @returns 验证结果
 */
export function isValidStrictCIDR(cidr: string): boolean {
	return isValidIPv4StrictCIDR(cidr) || isValidIPv6StrictCIDR(cidr);
}

/**
 * 将 IP 地址转换为 CIDR 格式
 *
 * @remarks 如果 IP 地址已经是 CIDR 格式，则返回原值；如果是 IPv4 地址，则添加 /32 前缀；如果是 IPv6 地址，则添加 /128 前缀
 * @param ips - IP 地址数组
 * @returns 严格 CIDR 格式的 IP 地址数组
 */
export function transformIPToCIDR(ips: Array<string>): Array<string> {
	const returns: Array<string> = [];
	for (const ip of ips) {
		if (isValidCIDR(ip)) {
			if (isValidIPv4Address(ip)) {
				returns.push(`${ip}/32`);
			} else if (isValidIPv6Address(ip)) {
				returns.push(`${ip}/128`);
			} else {
				returns.push(ip); // 已经是严格 CIDR 格式
			}
		} else {
			logger.warn('Invalid IP address format:', ip);
		}
	}
	return returns;
}
