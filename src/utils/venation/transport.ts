import { IncomingMessage, ServerResponse } from 'http';
/**
 * 此文件用来抽象通信协议层
 */

export class IRequest extends IncomingMessage {
	constructor(socket: any) {
		super(socket);
	}
}

export class IResponse extends ServerResponse<IRequest> {
	constructor(req1: IRequest) {
		super(req1);
	}

	addHeader(name: string, value: string) {
		const headers = this.getHeader(name);
		if (headers) {
			if (Array.isArray(headers)) {
				headers.push(value);
				this.setHeader(name, headers);
			} else {
				this.setHeader(name, [headers.toString(), value]);
			}
		} else {
			this.setHeader(name, value);
		}
	}
}
