import {initHooks} from './hooks'


function main () {
  initHooks()
}

if (!window.isWbImgCryptoLoaded) {
  window.isWbImgCryptoLoaded = true
  main()
}
