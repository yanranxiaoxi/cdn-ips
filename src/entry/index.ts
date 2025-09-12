import { CONFIG } from '../config/config';
import venRouter from '../router';
import logger from '../utils/logger';
import { Venation } from '../utils/venation';
import { VenNodeDriver } from '../utils/venation/driver';

(async () => {
	const driver = new VenNodeDriver(logger);
	const venation = new Venation(logger);
	venation.addDriver(driver);
	await venRouter(venation);
	driver.listen(CONFIG.host, CONFIG.port);
})();
