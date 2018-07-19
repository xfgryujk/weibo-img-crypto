const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: path.resolve(__dirname, '..', 'src', 'main.js'),
  output: {
    path: path.resolve(__dirname, '..'),
    filename: `weibo-img-crypto.js`
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
        use: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },

  plugins: [
    new VueLoaderPlugin()
  ]
}
