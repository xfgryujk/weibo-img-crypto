import {encrypt, decrypt} from './codec'
import {getConfig} from './config'

export function initHooks () {
  hookUpload()
  hookContextMenu()
}

// Hook上传图片相关函数
function hookUpload () {
  let isUploadingGif = false

  // Hook读取图片函数，用来判断MIME type
  let originalReadAsDataURL = window.FileReader.prototype.readAsDataURL
  window.FileReader.prototype.readAsDataURL = function (file) {
    isUploadingGif = file.type === 'image/gif'
    originalReadAsDataURL.call(this, file)
  }

  // Hook微博HTTP请求函数，用来加密和去水印
  let root = window.STK.namespace ? window.STK.namespace.v6home : window.STK // 用来兼容查看原图页面
  let originalIjax = root.core.io.ijax
  root.core.io.ijax = function (args) {
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

// 监听右键菜单
function hookContextMenu () {
  document.addEventListener('contextmenu', event => {
    if (getConfig().enableDecryption &&
        event.target instanceof window.Image) {
      // event.preventDefault() // 为了右键保存图片这里先注释掉了
      decrypt(event.target)
    }
  })
}
