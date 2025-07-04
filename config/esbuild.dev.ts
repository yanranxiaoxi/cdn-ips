import esbuild from 'esbuild';
import common from './esbuild.common';
(async () => {
	const ctx = await esbuild.context(common);
	if (process.argv.includes('--watch')) {
		ctx.watch();
	} else {
		await ctx.rebuild();
		process.exit();
	}
})();
