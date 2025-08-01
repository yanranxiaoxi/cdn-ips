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

	const options: RequestInit = {
		method: 'GET',
		cache: 'no-store',
		redirect: 'follow',
		headers: {
			'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Safari/537.36 cdn-ips/1.0',
		},
	};
	try {
		const response = await fetch(url, options);
		if (response.ok) {
			return await response.text();
		} else {
			logger.error('HTTP GET failed:', response.status, response.statusText);
			return undefined;
		}
	} catch (error) {
		logger.error('HTTP GET failed:', error);
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
