import {Notification} from 'element-ui'
import {encrypt, decrypt} from './codec'
import {getConfig} from './config'

export function initHooks () {
  hookUpload()
  hookContextMenu()
}

// Hook上传图片相关函数
async function hookUpload () {
  let isUploadingGif = false

  // Hook读取图片函数，用来判断MIME type
  let originalReadAsDataURL = window.FileReader.prototype.readAsDataURL
  window.FileReader.prototype.readAsDataURL = function (file) {
    isUploadingGif = file.type === 'image/gif'
    originalReadAsDataURL.call(this, file)
  }

  // 等待微博模块初始化
  let originalIjax
  let retryCount = 0
  while (true) {
    try {
      originalIjax = window.STK.namespace.v6home.core.io.ijax
      break
    } catch (e) {
      if (retryCount++ > 10) {
        Notification.error({
          title: '初始化',
          message: 'Hook上传函数失败，可能当前页面不是微博主页？' + e,
          position: 'bottom-left'
        })
        return
      }
      await sleep(500)
    }
  }
  // Hook微博HTTP请求函数，用来加密和去水印
  window.STK.namespace.v6home.core.io.ijax = function (args) {
    if (!getConfig().enableEncryption ||
        !args.url.endsWith('/pic_upload.php') ||
        isUploadingGif) { // 暂时不支持GIF
      return originalIjax(args)
    }

    // 用来取消请求的句柄
    let handle = {
      isAborted: false,
      abort () {
        this.isAborted = true
      }
    }
    let imgDataInput = args.form.querySelector('input')
    let img = new window.Image()
    img.onload = () => {
      if (handle.isAborted) {
        return
      }
      // 去水印
      if (getConfig().noWaterMark) {
        args.args.url = 0
        args.args.markpos = ''
        args.args.logo = ''
        args.args.nick = 0
      }
      // 加密、替换图片
      imgDataInput.value = encrypt(img).split(',')[1]
      handle.abort = originalIjax(args).abort
    }
    img.src = 'data:image;base64,' + imgDataInput.value
    return handle
  }
}

async function sleep (time) {
  return new Promise((resolve, reject) => {
    window.setTimeout(resolve, time)
  })
}

// 监听右键菜单
function hookContextMenu () {
  document.addEventListener('contextmenu', event => {
    let originImg = event.target
    if (getConfig().enableDecryption &&
        originImg instanceof window.Image) {
      if (originImg.src.startsWith('data:')) { // 如果是'data:'开头说明已经解密过了
        return
      }
      event.preventDefault() // 解密时屏蔽右键菜单
      decrypt(originImg).then(url => {
        if (url) {
          originImg.src = url
        }
      })
    }
  })
}
