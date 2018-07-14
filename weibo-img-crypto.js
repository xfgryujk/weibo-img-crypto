window.isWbImgCryptoLoaded || (function () {
  window.isWbImgCryptoLoaded = true

  function encrypt (data) {
    const KEY = 0xAA
    for (let i = 0; i < data.length; i += 4) {
      data[i] ^= KEY
      data[i + 1] ^= KEY
      data[i + 2] ^= KEY
    }
  }

  // Hook FileReader.readAsDataURL
  let originalReadAsDataURL = window.FileReader.prototype.readAsDataURL
  window.FileReader.prototype.readAsDataURL = function (file) {
    if (file.type.startsWith('image/') && file.type !== 'image/gif') { // GIF is not supported at present
      // Hook onloadend
      let originalOnloadend = this.onloadend
      this.onloadend = () => {
        let img = new window.Image()
        img.onload = () => {
          let canvas = document.createElement('canvas');
          [canvas.width, canvas.height] = [img.width, img.height]
          let ctx = canvas.getContext('2d')
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
})()
