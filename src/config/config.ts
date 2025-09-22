import process from 'node:process';
import * as packageJson from '../../package.json';
import 'dotenv/config';

/**
 * 验证必需的环境变量
 * @param name - 环境变量名称
 * @param value - 环境变量值
 * @param defaultValue - 默认值
 * @returns 验证后的环境变量值
 */
function validateEnvVar(name: string, value: string | undefined, defaultValue?: string): string {
	if (!value && defaultValue === undefined) {
		throw new Error(`Required environment variable ${name} is not set`);
	}
	return value || defaultValue!;
}

/**
 * 验证端口号
 * @param port - 端口号字符串
 * @param defaultPort - 默认端口号
 * @returns 验证后的端口号
 */
function validatePort(port: string | undefined, defaultPort: number): number {
	const portNum = port ? Number(port) : defaultPort;
	if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
		throw new Error(`Invalid port number: ${port}. Must be between 1 and 65535`);
	}
	return portNum;
}

/**
 * 验证布尔类型环境变量
 * @param name - 环境变量名称
 * @param value - 环境变量值
 * @param defaultValue - 默认值
 * @returns 验证后的布尔值
 */
function validateBooleanEnvVar(name: string, value: string | undefined, defaultValue: boolean): boolean {
	if (!value) {
		return defaultValue;
	}
	const lowerValue = value.toLowerCase();
	if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
		return true;
	}
	if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
		return false;
	}
	throw new Error(`Invalid boolean value for environment variable ${name}: ${value}. Must be true/false, 1/0, or yes/no`);
}

export const CONFIG = {
	env: validateEnvVar('ENV_PRODUCT', process.env.ENV_PRODUCT, 'development'),
	host: validateEnvVar('SERVER_HOST', process.env.SERVER_HOST, '0.0.0.0'),
	port: validatePort(process.env.SERVER_PORT, 80),

	envProduct: validateEnvVar('ENV_PRODUCT', process.env.ENV_PRODUCT, 'development'),
	projectName: validateEnvVar('PROJECT_NAME', process.env.PROJECT_NAME, packageJson.name),
	logLevel: validateEnvVar('LOG_LEVEL', process.env.LOG_LEVEL, 'info'),

	// 控制是否开放缓存预更新接口
	enableCachePreupdate: validateBooleanEnvVar('ENABLE_CACHE_PREUPDATE', process.env.ENABLE_CACHE_PREUPDATE, true),
} as const;
