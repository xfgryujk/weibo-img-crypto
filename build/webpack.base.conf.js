const path = require('path')
const pkg = require('../package.json')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: path.resolve(__dirname, '..', 'src', 'main.js'),
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: `weibo-img-crypto-${pkg.version}.js`
  },

  resolve: {
    extensions: ['.js', '.vue']
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  },

  plugins: [
    new VueLoaderPlugin()
  ]
}
