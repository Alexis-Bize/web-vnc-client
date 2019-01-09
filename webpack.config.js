const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { path } = require('app-root-path');
const { join } = require('path');

const env = process.env.NODE_ENV || 'production';
const isProductionEnvironment = env === 'production';

const { version } = JSON.parse(
    require('fs').readFileSync(join(path, 'package.json'))
);

module.exports = {
    entry: join(path, 'lib/client/index.js'),
    mode: isProductionEnvironment === true ? 'production' : 'development',
    output: {
        path: join(path, 'dist'),
        filename:
            isProductionEnvironment === true
                ? 'assets/bundles/vlc-client-[hash].bundle.min.js'
                : 'assets/bundles/vnc-client.js'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [{ loader: MiniCssExtractPlugin.loader }, 'css-loader']
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(env),
                APP_HOST: JSON.stringify(process.env.APP_HOST),
                APP_PORT: JSON.stringify(process.env.APP_PORT)
            }
        }),
        new MiniCssExtractPlugin({
            filename:
                isProductionEnvironment === true
                    ? 'assets/css/vlc-client-[hash].min.css'
                    : 'assets/css/vnc-client.css'
        }),
        new HtmlWebpackPlugin({
            inject: 'body',
            template: join(path, 'public/index.tpl.html'),
            DOMElements: {
                title: `VNC Client (${version})`
            }
        })
    ]
};
