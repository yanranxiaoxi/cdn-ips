module.exports = {
	plugins: ['eslint-plugin-tsdoc'],
	extends: ['alloy', 'alloy/typescript'],
	ignorePatterns: ['/logs/', '/dist/', '/node_modules/', '/.eslintcache'],
	env: {
		node: true,
	},
	globals: {},
	rules: {
		'no-param-reassign': 'off',
		'max-params': 'off',
		'tsdoc/syntax': 'warn',
	},
	root: true,
};
