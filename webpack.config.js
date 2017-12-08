const path = require('path')
const root = __dirname
const fs = require('fs')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: [
        'webpack/hot/only-dev-server',
        'webpack-dev-server/client',
        path.resolve(root, 'index.js'),
    ],
    module: {
        rules: [
            { test: /\.js?$/, use: ['babel-loader'], exclude: /node_modules/ }
        ]
    },
    output: {
        filename: 'router.js',
        path: path.resolve(root, 'dist'),
        publicPath: '/'
    },
    devServer: {
        hot: true, // 激活服务器的HMR
        contentBase: path.resolve(root, 'dist'),
        publicPath: '/',
        port: 8888,
        historyApiFallback: true
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'React Demo',
            template: path.resolve(root, 'index.html')
        }),
        new webpack.HotModuleReplacementPlugin(), // 热替换插件
        new webpack.NamedModulesPlugin() // 执行热替换时打印模块名字
    ]
}