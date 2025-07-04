import { Logger } from 'log4js';
import { Router } from '../router';
import { VenNodeDriver } from './driver';

export class Venation extends Router {
	constructor(readonly logger: Logger) {
		super();
	}

	addDriver(driver: VenNodeDriver) {
		driver.onRequest(async (req, res) => {
			const ctx: any = {
				req: req,
				res: res,
				method: req.method ?? '',
				requestParams: {},
				requestFiles: {},
				getQuery: {},
				routerParams: {},
				logger: this.logger,
			};
			const path = req.url ? req.url.split('?')[0] : '';
			try {
				const routeIndex: Array<number> = [];
				const matched = this.checkRoute(ctx, path === '/' ? '' : path, routeIndex);
				if (!matched) {
					res.statusCode = 404;
					res.end('404 Not Found !!!');
				} else {
					await this.run(<any>ctx, path === '/' ? '' : path, routeIndex);
					res.end();
				}
			} catch (ex) {
				ctx.logger.error(ex);
				res.statusCode = 500;
				res.end('500 Internal Server Error !!!');
			}
		});
	}
}
