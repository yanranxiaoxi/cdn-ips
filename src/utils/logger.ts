import log4js, { Configuration } from 'log4js';
import { CONFIG } from '../config/config';
import { join } from 'path';

// 日志同时输出到控制台和文件
const config: Configuration = {
	appenders: {
		file: {
			type: 'dateFile',
			filename: join('./logs/', CONFIG.projectName),
			pattern: 'yyyy-MM-dd.log',
			alwaysIncludePattern: true,
		},
		console: {
			type: 'console',
			layout: {
				type: 'pattern',
				pattern: '%[[%d{ISO8601}] %o[%p] [%X{customField}]%] - %m',
			},
		},
	},
	categories: {
		default: {
			appenders: ['file', 'console'],
			level: 'info',
		},
	},
};

log4js.configure(config);

const logger = log4js.getLogger(CONFIG.projectName);
logger.level = CONFIG.logLevel.toLocaleLowerCase();
logger.addContext('customField', 'null');

export default logger;
