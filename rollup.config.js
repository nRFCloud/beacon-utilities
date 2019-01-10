import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import builtins from 'rollup-plugin-node-builtins';
import json from 'rollup-plugin-json';
import pkg from './package.json';

export default [
	{
		input: 'src/main.ts',
		output: {
			name: 'beacons',
			file: pkg.browser,
			format: 'umd'
		},
		plugins: [
			resolve(),
			commonjs(),
			builtins(),
			typescript(),
			json()
		]
	},

	{
		input: 'src/main.ts',
		external: ['ms'],
		plugins: [
			resolve(),
			commonjs(),
			builtins(),
			typescript(),
			json()
		],
		output: [
			{file: pkg.main, format: 'cjs'},
			{file: pkg.module, format: 'es'}
		]
	}
];
