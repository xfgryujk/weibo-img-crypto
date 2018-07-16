import {encrypt, decrypt} from './codec'

export function initHooks () {
  hookUpload()
  hookContextMenu()
}

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

// Hook上传图片相关函数
function hookUpload (args) {
  let isUploadingGif = false

  // Hook读取图片函数，用来判断MIME type
  let originalReadAsDataURL = window.FileReader.prototype.readAsDataURL
  window.FileReader.prototype.readAsDataURL = function (file) {
    isUploadingGif = file.type === 'image/gif'
    originalReadAsDataURL.call(this, file)
  }

  // Hook微博HTTP请求函数，用来加密和去水印
  let originalIjax = window.STK.namespace.v6home.core.io.ijax
  window.STK.namespace.v6home.core.io.ijax = function (args) {
    if (!args.url.endsWith('/pic_upload.php') || isUploadingGif) { // 暂时不支持GIF
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

      // 加密
      [canvas.width, canvas.height] = [img.width, img.height]
      ctx.drawImage(img, 0, 0)
      let imgData = ctx.getImageData(0, 0, img.width, img.height)
      encrypt(imgData.data)
      ctx.putImageData(imgData, 0, 0)

      // 去水印
      args.args.url = 0
      args.args.markpos = ''
      args.args.logo = ''
      args.args.nick = 0
      // 替换图片
      imgDataInput.value = canvas.toDataURL().split(',')[1]
      handle.abort = originalIjax(args).abort
    }
    img.src = 'data:image;base64,' + imgDataInput.value
    return handle
  }
}

// 监听右键菜单
function hookContextMenu () {
  document.addEventListener('contextmenu', event => {
    if (event.target instanceof window.Image) {
      // event.preventDefault() // 为了右键保存图片这里先注释掉了
      let originImg = event.target
      if (!(originImg instanceof window.Image)) {
        return
      }

      // 跨域
      let img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.onerror = () => window.alert('载入图片失败，可能是跨域问题？')
      img.onload = () => {
        [canvas.width, canvas.height] = [img.width, img.height]
        ctx.drawImage(img, 0, 0)

        // 解密
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        decrypt(imgData.data)
        ctx.putImageData(imgData, 0, 0)
        originImg.src = canvas.toDataURL()
      }

      if (!originImg.src.startsWith('data:')) { // 如果是'data:'开头说明已经解密过了
        // 防缓存
        img.src = originImg.src + (originImg.src.indexOf('?') === -1 ? '?_t=' : '&_t=') + new Date().getTime()
      }
    }
  })
}
