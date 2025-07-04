import http, { ServerResponse } from 'http';
import { VenDriver } from '../interface';
import { Logger } from 'log4js';
import { IRequest, IResponse } from './transport';

export class VenNodeDriver extends VenDriver {
	readonly server;
	constructor(private readonly logger: Logger) {
		super();
		this.server = http.createServer({
			IncomingMessage: IRequest,
			ServerResponse: IResponse as typeof ServerResponse,
		});
	}

	listen(host: string, port: number) {
		this.server.on('listening', () => {
			this.logger.info(`server is listening on http://${host}:${port}`);
		});

		this.server.listen(port, host);
	}

	onRequest(cb: (req: IRequest, res: IResponse) => void) {
		this.server.on('request', (req, res) => {
			cb(req, res as IResponse);
		});
	}
}
