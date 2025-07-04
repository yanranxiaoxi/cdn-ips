import 'dotenv/config';

export const CONFIG = {
	env: process.env.ENV_PRODUCT,
	host: process.env.SERVER_HOST || '',
	port: Number(process.env.SERVER_PORT) || 80,

	envProduct: process.env.ENV_PRODUCT || '',
	projectName: process.env.PROJECT_NAME || 'server',
	logLevel: process.env.LOG_LEVEL || 'debug',
};
