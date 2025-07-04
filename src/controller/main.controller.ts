import { BasicException, ParamsExceptionCode } from '../exceptions/basic.exception';
import { EFormat, EProviders, EVersion, getData, transformData } from '../main/main';
import { IContext } from '../utils/interface';
import { Controller } from './controller';

const cache = new Map<string, any>();

class Main extends Controller {
	async get(ctx: IContext) {
		const params = {
			queryProviders: (ctx.getQuery.get('providers') || EProviders.ALL).split(','),
			queryVersion: ctx.getQuery.get('version') || EVersion.ALL,
			queryFormat: ctx.getQuery.get('format') || EFormat.LINE,
		};

		const unverified = this.verifyParam(
			{
				queryProviders: {
					type: 'array',
					itemType: 'enum',
					rule: {
						values: Object.values(EProviders),
					},
				},
				queryVersion: {
					type: 'enum',
					values: Object.values(EVersion),
				},
				queryFormat: {
					type: 'enum',
					values: Object.values(EFormat),
				},
			},
			params,
		);
		if (unverified) {
			throw new BasicException(ParamsExceptionCode.InvalidOrFormatError, JSON.stringify(unverified));
		}

		const allIPsData = await getData(params.queryProviders, params.queryVersion);

		switch (params.queryFormat) {
			case EFormat.COMMA:
			case EFormat.LINE:
			case EFormat.SPACE: {
				ctx.res.setHeader('Content-Type', 'text/plain; charset=utf-8');
				break;
			}
			case EFormat.JSON_ARRAY: {
				ctx.res.setHeader('Content-Type', 'application/json; charset=utf-8');
				break;
			}
		}
		ctx.res.setHeader('Cache-Control', 'public, max-age=7200'); // 缓存 2 小时
		ctx.res.end(transformData(allIPsData, params.queryFormat));
	}
}

const main = new Main();
export default main;
