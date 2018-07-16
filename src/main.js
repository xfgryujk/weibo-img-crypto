import Vue from 'vue'
import ElementUI from 'element-ui'
import {initHooks} from './hooks'
import {initGui} from './gui'

function main () {
  Vue.use(ElementUI)

  initHooks()
  initGui()
}

if (!window.isWbImgCryptoLoaded) {
  window.isWbImgCryptoLoaded = true
  main()
}
