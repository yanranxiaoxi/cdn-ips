import { BasicException, ParamsExceptionCode } from '../exceptions/basic.exception';
import { EFormat, EProviders, EVersion, getTransformedData } from '../main/main';
import { IContext } from '../utils/interface';
import { Controller } from './controller';

const cache = new Map<string, any>();

class Main extends Controller {
	async get(ctx: IContext) {
		const params = {
			queryProviders: (ctx.getQuery.get('providers') || Object.values(EProviders).join(',')).split(','),
			queryVersion: ctx.getQuery.get('version') || EVersion.ALL,
			queryFormat: ctx.getQuery.get('format') || EFormat.JSON,
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

		switch (params.queryFormat) {
			case EFormat.COMMA:
			case EFormat.LINE:
			case EFormat.SPACE:
			case EFormat.JSON_ARRAY_WITHOUT_SQUARE_BRACKETS: {
				ctx.res.setHeader('Content-Type', 'text/plain; charset=utf-8');
				break;
			}
			case EFormat.JSON:
			case EFormat.JSON_TRANSPOSED:
			case EFormat.JSON_WITHOUT_PROVIDERS:
			case EFormat.JSON_WITHOUT_VERSIONS:
			case EFormat.JSON_ARRAY: {
				ctx.res.setHeader('Content-Type', 'application/json; charset=utf-8');
				break;
			}
		}
		ctx.res.setHeader('Cache-Control', 'public, max-age=7200'); // 缓存 2 小时
		ctx.res.end(await getTransformedData(params.queryProviders, params.queryVersion, params.queryFormat));
	}
}

const main = new Main();
export default main;
