window.isWbImgCryptoLoaded || (function () {
  window.isWbImgCryptoLoaded = true

  // 抄Java的Random
  class Random {
    constructor (seed) {
      this._seed = seed
      this._multiplier = 0x5DEECE66D
      this._addend = 0xB
      this._mask = (1 << 16) - 1
    }

    next (bits) {
      let nextseed = (this._seed * this._multiplier + this._addend) & this._mask
      this._seed = nextseed
      return nextseed >> (16 - bits)
    }

    nextInt (bound) {
      let r = this.next(15)
      let m = bound - 1
      if ((bound & m) === 0) { // i.e., bound is a power of 2
        r = (bound * r) >> 15
      } else {
        for (let u = r; u - (r = u % bound) + m < 0; u = this.next(15));
      }
      return r
    }
  }

  // 生成不重复的序列
  class RandomSequence {
    constructor (seed, length) {
      this._rng = new Random(seed)
      this._list = new Array(length)
      for (let i = 0; i < length; i++) {
        this._list[i] = i
      }
      this._nextMin = 0
    }

    next () {
      if (this._nextMin >= this._list.length) {
        this._nextMin = 0
      }
      let index = this._nextMin + this._rng.nextInt(this._list.length - this._nextMin)
      let result = this._list[index]
      this._list[index] = this._list[this._nextMin]
      this._list[this._nextMin] = result
      this._nextMin++
      return result
    }
  }

  const RANDOM_SEED = 114514

  function encrypt (data) {
    let nRgbs = data.length / 4 * 3
    let seq = new RandomSequence(RANDOM_SEED, nRgbs)
    let buffer = new Uint8ClampedArray(nRgbs)
    // 每一个RGB值放到新的位置
    for (let i = 0; i < data.length; i += 4) {
      buffer[seq.next()] = data[i]
      buffer[seq.next()] = data[i + 1]
      buffer[seq.next()] = data[i + 2]
    }
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      data[i] = buffer[j]
      data[i + 1] = buffer[j + 1]
      data[i + 2] = buffer[j + 2]
    }
  }

  function decrypt (data) {
    let nRgbs = data.length / 4 * 3
    let buffer = new Uint8ClampedArray(nRgbs)
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      buffer[j] = data[i]
      buffer[j + 1] = data[i + 1]
      buffer[j + 2] = data[i + 2]
    }
    let seq = new RandomSequence(RANDOM_SEED, nRgbs)
    // 取新的位置，放回原来的位置
    for (let i = 0; i < data.length; i += 4) {
      data[i] = buffer[seq.next()]
      data[i + 1] = buffer[seq.next()]
      data[i + 2] = buffer[seq.next()]
    }
  }

  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')

  // Hook FileReader.readAsDataURL
  let originalReadAsDataURL = window.FileReader.prototype.readAsDataURL
  window.FileReader.prototype.readAsDataURL = function (file) {
    if (file.type.startsWith('image/') && file.type !== 'image/gif') { // 暂时不支持GIF
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
