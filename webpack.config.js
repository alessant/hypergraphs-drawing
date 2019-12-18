const path = require('path')

module.exports = {
    mode: 'development', //'development', //production
    entry: {
        hypergraphsdrawing: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js',
        publicPath: '/assets/',
        libraryTarget: 'umd',
        library: 'hgd'
    },
    devServer: {
        port: 1234,
        contentBase: path.join(__dirname, 'dist')
    }
};