import { IncomingMessage, ServerResponse } from 'http';
import { Logger } from 'log4js';
import { IRequest, IResponse } from './venation/transport';

export abstract class VenDriver {
	/**
	 * 向驱动注册请求狗子，当一个请求送达后，执行一次回调
	 * @param cb 回调函数
	 */
	abstract onRequest(cb: (req: IncomingMessage, res: ServerResponse) => void): void;
}

export interface IContext extends ITransports {
	method: string;
	requestParams: any;
	requestFiles: any;
	getQuery: any;
	routerParams: any;
	logger: Logger;
	body: any;
	user: any;
	code: number;
}

export interface ITransports {
	req: IRequest;
	res: IResponse;
}

export interface IController {
	(ctx: IContext): Promise<void>;
}

export interface INext {
	(): Promise<any>;
}

export interface IMiddleware {
	(ctx: IContext, next: () => Promise<any>): Promise<void>;
}
