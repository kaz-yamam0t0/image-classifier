// rollup.config.js
import typescript   from "@rollup/plugin-typescript";
import nodeResolve  from '@rollup/plugin-node-resolve'
import commonjs     from '@rollup/plugin-commonjs'
import babel        from 'rollup-plugin-babel';
import {terser}     from 'rollup-plugin-terser';

const is_develop = false;

export default {
	input: 'src/js/main.ts',

	output: {
		format: 'iife' ,
		file: 'dist/main.js',
		sourcemap: is_develop,
		//globals: { jquery: 'jQuery' }
	},
	plugins: [
		typescript(),
		nodeResolve({ jsnext: true }),
		commonjs({ extensions: [".js",".ts"] }), 
		babel(), 
		terser(),
	],
	//external: ['jquery']
}

