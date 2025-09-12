import { BasicException, ParamsExceptionCode } from '../exceptions/basic.exception';
import { EFormat, EProviders, EVersion, getTransformedData } from '../main/main';
import type { IContext } from '../utils/interface';
import { Controller } from './controller';

class Main extends Controller {
	public async get(ctx: IContext) {
		// 输入长度限制
		const providersParam = (ctx.getQuery.providers as string) || Object.values(EProviders).join(',');
		const versionParam = (ctx.getQuery.version as string) || EVersion.ALL;
		const formatParam = (ctx.getQuery.format as string) || EFormat.JSON;

		// 验证输入长度
		if (providersParam.length > 1000) {
			throw new BasicException(ParamsExceptionCode.InvalidOrFormatError, 'Providers parameter too long');
		}
		if (versionParam.length > 10) {
			throw new BasicException(ParamsExceptionCode.InvalidOrFormatError, 'Version parameter too long');
		}
		if (formatParam.length > 50) {
			throw new BasicException(ParamsExceptionCode.InvalidOrFormatError, 'Format parameter too long');
		}

		const params = {
			queryProviders: providersParam.split(','),
			queryVersion: versionParam,
			queryFormat: formatParam,
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

		const transformedData = await getTransformedData(
			params.queryProviders as EProviders[],
			params.queryVersion as EVersion,
			params.queryFormat as EFormat,
		);

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
		ctx.res.end(transformedData);
	}
}

const main = new Main();
export default main;
