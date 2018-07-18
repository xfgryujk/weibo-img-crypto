import { Notification } from 'element-ui'
import {RandomSequence} from './random'
import {getConfig} from './config'

let canvas = document.createElement('canvas')
let ctx = canvas.getContext('2d')

// 加密图片，返回data URL
export function encrypt (img) {
  [canvas.width, canvas.height] = [img.width, img.height]
  ctx.drawImage(img, 0, 0)
  let imgData = ctx.getImageData(0, 0, img.width, img.height)
  Codec.getCodec().encrypt(imgData.data)
  ctx.putImageData(imgData, 0, 0)
  return canvas.toDataURL()
}

// 解密图片，直接替换img.src
export async function decrypt (originImg) {
  if (originImg.src.startsWith('data:')) { // 如果是'data:'开头说明已经解密过了
    return
  }
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
    return
  }

  // 解密
  [canvas.width, canvas.height] = [img.width, img.height]
  ctx.drawImage(img, 0, 0)
  let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  Codec.getCodec().decrypt(imgData.data)
  ctx.putImageData(imgData, 0, 0)
  originImg.src = canvas.toDataURL()
}

function getImgSrcToDecrypt (originImg) {
  // 获取原图地址，防止微博缩小图片尺寸导致解密失败
  const IMG_URL_REG = /^(https?:\/\/wx\d+\.sinaimg\.cn\/)mw\d+(\/.*)$/i
  let match = IMG_URL_REG.exec(originImg.src)
  let src = match ? `${match[1]}large${match[2]}` : originImg.src
  // 防缓存，为了跨域
  src += (originImg.src.indexOf('?') === -1 ? '?_t=' : '&_t=') + new Date().getTime()
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
  encrypt (data) {}
  decrypt (data) {}
}
Codec._codecs = {}
Codec.getCodec = function (name) {
  return name in Codec._codecs ? Codec._codecs[name] : Codec._codecs.MoveRgbCodec
}

// 反色
class InvertRgbCodec {
  // TODO 实现
  encrypt (data) {}
  decrypt (data) {}
}
Codec._codecs.InvertRgbCodec = new InvertRgbCodec()

// 将RGB值随机移动
class MoveRgbCodec {
  encrypt (data) {
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
  }

  decrypt (data) {
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
  }
}
Codec._codecs.MoveRgbCodec = new MoveRgbCodec()

// 将8x8像素块随机移动
class Move8x8BlockCodec {
  // TODO 实现
  encrypt (data) {}
  decrypt (data) {}
}
Codec._codecs.Move8x8BlockCodec = new Move8x8BlockCodec()
