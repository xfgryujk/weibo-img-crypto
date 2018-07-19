import Vue from 'vue'
import ElementUI from 'element-ui'
import {initHooks} from './hooks'
import {initGui} from './gui'

function main () {
  Vue.use(ElementUI)
  // 引入CSS的偷懒方法（其实是因为webpack总是编译失败放弃了）
  let css = document.createElement('link')
  css.rel = 'stylesheet'
  css.href = 'https://unpkg.com/element-ui/lib/theme-chalk/index.css'
  document.body.appendChild(css)

  initHooks()
  initGui()
}

if (window.isWbImgCryptoLoaded) {
  window.alert('weibo-img-crypto 已经加载，请不要重复加载')
} else {
  window.isWbImgCryptoLoaded = true
  main()
}
