const merge = require('webpack-merge')
const base = require('./webpack.base.conf')

module.exports = merge(base, {
  mode: 'development',

  // 开发测试用：
  // let script = document.createElement('script'); script.src = 'http://localhost:8080/weibo-img-crypto.js'; document.body.appendChild(script)
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
})
