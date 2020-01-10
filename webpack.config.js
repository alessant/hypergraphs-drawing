const path = require('path')

module.exports = {
    mode: 'production', //'development', //production
    entry: {
        hypergraphsdrawing: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'js/[name].js',
        publicPath: '/assets/',
        libraryTarget: 'var', //'umd
        library: 'hgd'
    },
    devServer: {
        port: 1234,
        contentBase: path.join(__dirname, 'dist')
    }
};