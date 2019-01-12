const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const { path: rootPath } = require('app-root-path');
const { join } = require('path');

const env = process.env.NODE_ENV || 'production';
const isProductionEnvironment = env === 'production';

const { version } = JSON.parse(
    require('fs').readFileSync(join(rootPath, 'package.json'))
);

const mode = isProductionEnvironment === true ? 'production' : 'development';
const resolve = { extensions: ['.ts', '.js'] };
const definePlugin = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify(env),
        APP_HOST: JSON.stringify(process.env.APP_HOST),
        APP_PORT: JSON.stringify(process.env.APP_PORT)
    }
});

module.exports = [
    {
        entry: join(rootPath, 'src/client/index.ts'),
        target: 'web',
        mode: mode,
        output: {
            path: join(rootPath, 'dist/client'),
            filename:
                isProductionEnvironment === true
                    ? 'assets/bundles/client-[hash].bundle.min.js'
                    : 'assets/bundles/client.js'
        },
        module: {
            rules: [
                {
                    test: /\.css$/,
                    use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader']
                },
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: resolve,
        plugins: [
            definePlugin,
            new MiniCssExtractPlugin({
                filename:
                    isProductionEnvironment === true
                        ? 'assets/css/client-[hash].min.css'
                        : 'assets/css/client.css'
            }),
            new HtmlWebpackPlugin({
                inject: 'body',
                template: join(rootPath, 'templates/index.tpl.html'),
                DOMElements: {
                    title: `VNC Client (${version})`
                }
            })
        ]
    },
    {
        entry: join(rootPath, 'src/server/index.ts'),
        target: 'node',
        externals: [nodeExternals()],
        mode: mode,
        output: {
            path: join(rootPath, 'dist/server'),
            filename: 'server.js'
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: resolve,
        plugins: [definePlugin]
    }
];
