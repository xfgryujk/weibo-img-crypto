window.isWbImgCryptoLoaded || (function () {
  window.isWbImgCryptoLoaded = true

  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')

  // TODO 使用更高级的加密
  function encrypt (data) {
    const KEY = 0xAA
    for (let i = 0; i < data.length; i += 4) {
      data[i] ^= KEY
      data[i + 1] ^= KEY
      data[i + 2] ^= KEY
    }
  }
  let decrypt = encrypt

  // Hook FileReader.readAsDataURL
  let originalReadAsDataURL = window.FileReader.prototype.readAsDataURL
  window.FileReader.prototype.readAsDataURL = function (file) {
    if (file.type.startsWith('image/') && file.type !== 'image/gif') { // GIF is not supported at present
      // Hook onloadend
      let originalOnloadend = this.onloadend
      this.onloadend = () => {
        let img = new window.Image()
        img.onload = () => {
          [canvas.width, canvas.height] = [img.width, img.height]
          ctx.drawImage(img, 0, 0)

          // 加密
          let imgData = ctx.getImageData(0, 0, img.width, img.height)
          encrypt(imgData.data)
          ctx.putImageData(imgData, 0, 0)

          // 替换上传的图片
          originalOnloadend({target: {result: canvas.toDataURL()}})
        }
        img.src = this.result
      }
    }
    originalReadAsDataURL.call(this, file)
  }

  // 监听右键菜单
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

      if (originImg.src.startsWith('data:')) {
        img.src = originImg.src
      } else {
        // 防缓存
        img.src = originImg.src + (originImg.src.indexOf('?') === -1 ? '?_t=' : '&_t=') + new Date().getTime()
      }
    }
  })
})()
