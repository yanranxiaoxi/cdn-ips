import venRouter from '../router';
import logger from '../utils/logger';
import { CONFIG } from '../config/config';
import { VenNodeDriver } from '../utils/venation/driver';
import { Venation } from '../utils/venation';

(async () => {
	const driver = new VenNodeDriver(logger);
	const venation = new Venation(logger);
	venation.addDriver(driver);
	await venRouter(venation);
	driver.listen(CONFIG.host, CONFIG.port);
})();
