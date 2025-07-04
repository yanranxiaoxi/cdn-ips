import main from '../controller/main.controller';
import api from '../middleware/api.middleware';
import parameterMid from '../middleware/parameter.middleware';
import { Venation } from '../utils/venation';

export default async (ven: Venation) => {
	await ven.router('', api(), parameterMid).then((sub) => {
		sub.get('', main.get);
	});
};
