const path = require('path');

/** 
 * Some packages just don't work with Rollup. As a workaround,
 * we just bundle the with Webpack instead which has much better
 * CJS support.
 */
module.exports = () => ([
    {
        target: 'node',
        mode: 'production',
        entry: require.resolve('htmlparser2'),
        output: {
            path: path.resolve(__dirname, '../vendor/generated'),
            filename: '~htmlparser2.js',
            libraryTarget: 'commonjs',
        },
    },
    {
        target: 'node',
        mode: 'production',
        entry: require.resolve('rollup-plugin-node-polyfills'),
        output: {
            path: path.resolve(__dirname, '../vendor/generated'),
            filename: '~rollup-plugin-node-polyfills.js',
            libraryTarget: 'commonjs',
        },
    }]
);