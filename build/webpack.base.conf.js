const path = require('path')
const package = require('../package.json')

module.exports = {
  entry: path.resolve(__dirname, '..', 'src', 'main.js'),
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: `weibo-img-crypto-${package.version}.js`
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      }
    ]
  }
}
