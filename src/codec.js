import {Notification} from 'element-ui'
import {RandomSequence} from './random'
import {getConfig} from './config'
import {gaussianBlur, medianBlur} from './imgproc'

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

// 加密图片，返回data URL
export function encrypt (img) {
  return doCodecCommon(img, imgData =>
    Codec.createCodec(getConfig().codecName, imgData).encrypt()
  )
}

// 解密图片，返回data URL
export async function decrypt (originImg) {
  let img
  try {
    img = await loadImage(getImgSrcToDecrypt(originImg), true)
  } catch (e) {
    Notification.error({
      title: '解密图片',
      message: '载入图片失败，可能是跨域问题？',
      position: 'bottom-left',
      duration: 3000
    })
    return ''
  }
  return doCodecCommon(img, imgData => {
    imgData = Codec.createCodec(getConfig().codecName, imgData).decrypt()
    postProcess(imgData)
    return imgData
  })
}

// 加密解密通用的部分，返回处理后的data URL。handleImgData传入imgData，返回新的imgData
function doCodecCommon (img, handleImgData) {
  [canvas.width, canvas.height] = [img.width, img.height]
  // 微博会把透明图片和白色混合
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, img.width, img.height)
  ctx.drawImage(img, 0, 0)
  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  imgData = handleImgData(imgData);
  [canvas.width, canvas.height] = [imgData.width, imgData.height]
  ctx.putImageData(imgData, 0, 0)
  return canvas.toDataURL()
}

// 解密后的处理，比如滤波
function postProcess (imgData) {
  switch (getConfig().postProcess) {
    case 'gaussianBlur':
      gaussianBlur(imgData)
      break
    case 'medianBlur':
      medianBlur(imgData)
      break
  }
}

function getImgSrcToDecrypt (originImg) {
  // 获取原图地址，防止微博缩小图片尺寸导致解密失败
  const IMG_URL_REG = /^(https?:\/\/wx\d+\.sinaimg\.cn\/)mw\d+(\/.*)$/i
  let match = IMG_URL_REG.exec(originImg.src)
  let src = match ? `${match[1]}large${match[2]}` : originImg.src
  if (!originImg.src.startsWith('data:')) {
    // 防缓存，为了跨域
    src += (originImg.src.indexOf('?') === -1 ? '?_t=' : '&_t=') + new Date().getTime()
  }
  return src
}

async function loadImage (src, isCrossOrigin = false) {
  let img = new window.Image()
  if (isCrossOrigin) {
    img.crossOrigin = 'anonymous'
  }
  return new Promise((resolve, reject) => {
    img.onerror = () => reject(new Error('载入图片失败'))
    img.onload = () => resolve(img)
    img.src = src
  })
}

class Codec {
  constructor (imgData) {
    this._imgData = imgData
  }
  // 加密，返回加密后的imgData
  encrypt () {}
  // 解密，返回解密后的imgData
  decrypt () {}
}
Codec._codecClasses = {}
Codec.createCodec = function (name, imgData) {
  let CodecClass = name in Codec._codecClasses ? Codec._codecClasses[name] : Codec._codecClasses.Move8x8BlockCodec
  return new CodecClass(imgData)
}

// 反色
class InvertRgbCodec extends Codec {
  encrypt () { return this._invertColor(this._imgData) }
  decrypt () { return this._invertColor(this._imgData) }
  _invertColor (imgData) {
    let data = imgData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = ~data[i] & 0xFF
      data[i + 1] = ~data[i + 1] & 0xFF
      data[i + 2] = ~data[i + 2] & 0xFF
    }
    return imgData
  }
}
Codec._codecClasses.InvertRgbCodec = InvertRgbCodec

// 将RGB值随机移动
class MoveRgbCodec extends Codec {
  encrypt () {
    let data = this._imgData.data
    let nRgbs = data.length / 4 * 3
    let seq = new RandomSequence(nRgbs, getConfig().randomSeed)
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
    return this._imgData
  }

  decrypt () {
    let data = this._imgData.data
    let nRgbs = data.length / 4 * 3
    let buffer = new Uint8ClampedArray(nRgbs)
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      buffer[j] = data[i]
      buffer[j + 1] = data[i + 1]
      buffer[j + 2] = data[i + 2]
    }
    let seq = new RandomSequence(nRgbs, getConfig().randomSeed)
    // 取新的位置，放回原来的位置
    for (let i = 0; i < data.length; i += 4) {
      data[i] = buffer[seq.next()]
      data[i + 1] = buffer[seq.next()]
      data[i + 2] = buffer[seq.next()]
    }
    return this._imgData
  }
}
Codec._codecClasses.MoveRgbCodec = MoveRgbCodec

// 将8x8像素块随机移动
// 由于JPEG是分成8x8的小块在块内压缩，分成8x8小块处理可以避免压缩再解密造成的高频噪声
class Move8x8BlockCodec extends Codec {
  encrypt () {
    return this._doCommon((result, blockX, blockY, newBlockX, newBlockY) =>
      this._copyBlock(result, newBlockX, newBlockY, this._imgData, blockX, blockY)
    )
  }

  decrypt () {
    return this._doCommon((result, blockX, blockY, newBlockX, newBlockY) =>
      this._copyBlock(result, blockX, blockY, this._imgData, newBlockX, newBlockY)
    )
  }

  _doCommon (handleCopy) {
    // 尺寸不是8的倍数则去掉边界
    let blockWidth = Math.floor(this._imgData.width / 8)
    let blockHeight = Math.floor(this._imgData.height / 8)
    let result = ctx.createImageData(blockWidth * 8, blockHeight * 8)
    let seq = new RandomSequence(blockWidth * blockHeight, getConfig().randomSeed)
    for (let blockY = 0; blockY < blockHeight; blockY++) {
      for (let blockX = 0; blockX < blockWidth; blockX++) {
        let index = seq.next()
        let newBlockX = index % blockWidth
        let newBlockY = Math.floor(index / blockWidth)
        handleCopy(result, blockX, blockY, newBlockX, newBlockY)
      }
    }
    return result
  }

  _copyBlock (dstImgData, dstBlockX, dstBlockY, srcImgData, srcBlockX, srcBlockY) {
    let iDstStart = (dstBlockY * dstImgData.width + dstBlockX) * 8 * 4
    let iSrcStart = (srcBlockY * srcImgData.width + srcBlockX) * 8 * 4
    for (let y = 0; y < 8; y++) {
      for (let i = 0; i < 8 * 4; i++) {
        dstImgData.data[iDstStart + i] = srcImgData.data[iSrcStart + i]
      }
      iDstStart += dstImgData.width * 4
      iSrcStart += srcImgData.width * 4
    }
  }
}
Codec._codecClasses.Move8x8BlockCodec = Move8x8BlockCodec
