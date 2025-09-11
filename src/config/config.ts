import 'dotenv/config';

// 验证必需的环境变量
function validateEnvVar(name: string, value: string | undefined, defaultValue?: string): string {
	if (!value && defaultValue === undefined) {
		throw new Error(`Required environment variable ${name} is not set`);
	}
	return value || defaultValue!;
}

function validatePort(port: string | undefined, defaultPort: number): number {
	const portNum = port ? Number(port) : defaultPort;
	if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
		throw new Error(`Invalid port number: ${port}. Must be between 1 and 65535`);
	}
	return portNum;
}

export const CONFIG = {
	env: validateEnvVar('ENV_PRODUCT', process.env.ENV_PRODUCT, 'development'),
	host: validateEnvVar('SERVER_HOST', process.env.SERVER_HOST, '0.0.0.0'),
	port: validatePort(process.env.SERVER_PORT, 80),

	envProduct: validateEnvVar('ENV_PRODUCT', process.env.ENV_PRODUCT, 'development'),
	projectName: validateEnvVar('PROJECT_NAME', process.env.PROJECT_NAME, 'cdn-ips'),
	logLevel: validateEnvVar('LOG_LEVEL', process.env.LOG_LEVEL, 'info'),
};
