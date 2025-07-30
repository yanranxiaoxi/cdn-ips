import NodeCache from '@cacheable/node-cache';

const cache = new NodeCache();

export async function getCachedData(tag: string, flushFn: () => Promise<Array<string>>): Promise<Array<string>> {
	const data: Array<string> | undefined = cache.get(tag);
	if (data) return data;
	const dataOptimism: Array<string> | undefined = cache.get(tag + 'Optimism');
	if (dataOptimism) {
		await flushFn();
		return dataOptimism;
	}
	return await flushFn();
}
