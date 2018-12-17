const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanCSSPlugin = require("less-plugin-clean-css");
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = env => {
    const isProduction = env.production === 'true';

    return {
        devtool: isProduction ? false : "inline-source-map",
        entry: './src/Client/module/IndexPage/index.tsx',
        output: {
            path: path.resolve(__dirname, 'bin/Client'),
            filename: 'index.js'
        },
        resolve: {
            extensions: [".ts", ".tsx", ".js"]
        },
        module: {
            rules: [
                { test: /\.tsx?$/, use: 'ts-loader' },
                {
                    test: /\.less$/,
                    use: [
                        { loader: "style-loader" },
                        { loader: "css-loader", options: { sourceMap: !isProduction, modules: 'global' } },
                        { loader: "less-loader", options: { sourceMap: !isProduction, plugins: [new CleanCSSPlugin({ advanced: true })] } }
                    ]
                },
                { test: /\.css$/, use: ['style-loader', 'css-loader'] }
            ]
        },
        plugins: [
            new CopyWebpackPlugin([
                { from: 'src/Client/res/img', to: './res/img' },
                { from: 'src/Client/res/font', to: './res/font' },
                { from: 'src/Client/res/helper', to: './res/helper' },
                { from: 'node_modules/jquery/dist/jquery.min.js', to: './res/helper/jquery.min.js' },
            ]),
            new HtmlWebpackPlugin({ filename: 'index.html', template: 'src/Client/module/IndexPage/index.html' }),
            new MonacoWebpackPlugin(),
        ],
        resolveLoader: {
            alias: {
                "strip-dts-comment": path.resolve(__dirname, './webpack.strip_dts_comment.loader.js')
            }
        }
    };
};