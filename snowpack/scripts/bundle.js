import fs from 'fs';
import glob from 'glob';
import path from 'path';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import builtins from 'builtin-modules';
import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';

if (fs.readFileSync('./lib/index.js', 'utf8').startsWith(`'use strict';`)) {
  throw new Error('Input is already bundled! Re-run build to regenerate');
}

const config = {
  input: './lib/index.js',
  inlineDynamicImports: true,
  output: [
    {
      file: './lib/index.js',
      format: 'cjs',
      compact: true,
      freeze: false,
      interop: false,
      namespaceToStringTag: false,
      externalLiveBindings: false,
      preferConst: true,
      exports: 'auto',
      // },{
      // 	file: 'index.bundle.mjs',
      // 	format: 'esm',
      // 	compact: true,
      // 	freeze: false,
      // 	interop: false,
      // 	namespaceToStringTag: false,
      // 	externalLiveBindings: false,
      // 	preferConst: true,
    },
  ],
  external: [...builtins, 'vm2', 'rollup-plugin-node-polyfills', 'postcss-modules', 'htmlparser2'],
  plugins: [
    {
      name: 'clear-bundled-files',
      generateBundle() {
        glob
          .sync('**/*.js', {
            cwd: path.resolve('lib'),
            nodir: true,
            absolute: true,
          })
          .map((f) => fs.unlinkSync(f));
      },
    },
    alias({
      entries: [
        {find: /^postcss$/, replacement: 'postcss-es6'},
        {find: /^postcss[/\\]$/, replacement: `postcss-es6${path.sep}`},
        // 		// bypass native modules aimed at production WS performance:
        {find: /^bufferutil$/, replacement: `bufferutil${path.sep}fallback.js`},
        {find: /^utf-8-validate$/, replacement: `utf-8-validate${path.sep}fallback.js`},
        // just use native streams:
        {find: /(^|[/\\])readable-stream$/, replacement: require.resolve('./~readable-stream.js')},
        {
          find: /(^|[/\\])readable-stream[/\\]duplex/,
          replacement: require.resolve('./~readable-stream-duplex.js'),
        },
        // just use util:
        {find: /^inherits$/, replacement: require.resolve('./~inherits.js')},
        // only pull in fsevents when its exports are accessed (avoids exceptions):
        {find: /^fsevents$/, replacement: require.resolve('./~fsevents.js')},
      ],
    }),
    commonjs({
      exclude: [/\.mjs$/, /\/rollup\//, path.resolve('lib')],
      ignore: builtins,
      transformMixedEsModules: true,
    }),
    nodeResolve({
      preferBuiltins: true,
      extensions: ['.mjs', '.js', '.json', '.es6', '.node'],
    }),
    json(),
  ],
};

export default config;
