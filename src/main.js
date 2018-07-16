window.isWbImgCryptoLoaded || (function () {
  window.isWbImgCryptoLoaded = true

  // 从谷歌V8引擎抄来的 https://github.com/v8/v8/blob/dae6dfe08ba9810abbe7eee81f7c58e999ae8525/src/math.js#L144
  class Random {
    constructor (seed) {
      if (seed === undefined) {
        seed = new Date().getTime()
      }
      this._rngstate = [seed & 0x0000FFFF, seed >>> 16]
    }

    // 返回[0, 1)
    random () {
      let r0 = (Math.imul(18030, this._rngstate[0] & 0xFFFF) + (this._rngstate[0] >>> 16)) | 0
      this._rngstate[0] = r0
      let r1 = (Math.imul(36969, this._rngstate[1] & 0xFFFF) + (this._rngstate[1] >>> 16)) | 0
      this._rngstate[1] = r1
      let x = ((r0 << 16) + (r1 & 0xFFFF)) | 0
      // Division by 0x100000000 through multiplication by reciprocal.
      return (x < 0 ? (x + 0x100000000) : x) * 2.3283064365386962890625e-10
    }

    // 返回[min, max]的整数
    randint (min, max) {
      return Math.floor(min + this.random() * (max - min + 1))
    }
  }

  // 生成[0, length)的随机序列，每次调用next()返回和之前不重复的值，直到[0, length)用完
  class RandomSequence {
    constructor (length, seed) {
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
      let index = this._rng.randint(this._nextMin, this._list.length - 1)
      let result = this._list[index]
      this._list[index] = this._list[this._nextMin]
      this._list[this._nextMin] = result
      this._nextMin++
      return result
    }
  }

  const DEFAULT_SEED = 114514

  function encrypt (data) {
    let nRgbs = data.length / 4 * 3
    let seq = new RandomSequence(nRgbs, window.randomSeed || DEFAULT_SEED)
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
    let seq = new RandomSequence(nRgbs, window.randomSeed || DEFAULT_SEED)
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

      if (!originImg.src.startsWith('data:')) { // 如果是'data:'开头说明已经解密过了
        // 防缓存
        img.src = originImg.src + (originImg.src.indexOf('?') === -1 ? '?_t=' : '&_t=') + new Date().getTime()
      }
    }
  })
})()
