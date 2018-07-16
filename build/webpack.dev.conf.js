const merge = require('webpack-merge')
const base = require('./webpack.base.conf')

module.exports = merge(base, {
  mode: 'development'
})
