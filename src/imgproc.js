// // 将图像数据分离为各通道一个数组，返回包含各通道的数组
// export function splitChannels (data, nChannels = 4) {
//   let nPixels = data.length / nChannels
//   let channels = []
//   for (let i = 0; i < nChannels; i++) {
//     channels.push(new Uint8ClampedArray(nPixels))
//   }
//   for (let iChannel = 0; iChannel < nChannels; iChannel++) {
//     for (let iPixel = 0; iPixel < nPixels; iPixel++) {
//       channels[iChannel][iPixel] = data[iPixel * 4 + iChannel]
//     }
//   }
//   return channels
// }

// // 将多个通道合并为一个数组
// export function mergeChannels (channels) {
//   let nChannels = channels.length
//   let nPixels = channels[0].length
//   let data = new Uint8ClampedArray(nChannels * nPixels)
//   for (let iPixel = 0; iPixel < nPixels; iPixel++) {
//     for (let iChannel = 0; iChannel < nChannels; iChannel++) {
//       data[iPixel * 4 + iChannel] = channels[iChannel][iPixel]
//     }
//   }
//   return data
// }

// 3x3高斯模糊
export function gaussianBlur (imgData) {
  const KERNEL_TOTAL = 16
  // JS中只有浮点数，全换成整数应该不能加速？
  const KERNEL = [
    1 / KERNEL_TOTAL, 2 / KERNEL_TOTAL, 1 / KERNEL_TOTAL,
    2 / KERNEL_TOTAL, 4 / KERNEL_TOTAL, 2 / KERNEL_TOTAL,
    1 / KERNEL_TOTAL, 2 / KERNEL_TOTAL, 1 / KERNEL_TOTAL
  ]

  let data = imgData.data
  let buffer = new Uint8ClampedArray(data.length / 4 * 3)
  for (let iChannel = 0; iChannel < 3; iChannel++) {
    // 懒得做填充了，边界像素不处理
    for (let y = 1; y < imgData.height - 1; y++) {
      for (let x = 1; x < imgData.width - 1; x++) {
        let sum = 0
        for (let kernelY = 0; kernelY < 3; kernelY++) {
          for (let kernelX = 0; kernelX < 3; kernelX++) {
            sum += data[((y - 1 + kernelY) * imgData.width + (x - 1 + kernelX)) * 4 + iChannel] *
                   KERNEL[kernelY * 3 + kernelX]
          }
        }
        buffer[(y * imgData.width + x) * 3 + iChannel] = Math.round(sum)
      }
    }
  }

  copy24BitsTo32Bits(data, buffer, imgData.width, imgData.height)
}

// 3x3中值滤波
export function medianBlur (imgData) {
  let data = imgData.data
  let buffer = new Uint8ClampedArray(data.length / 4 * 3)
  let buffer33 = new Uint8ClampedArray(3 * 3)
  for (let iChannel = 0; iChannel < 3; iChannel++) {
    // 懒得做填充了，边界像素不处理
    for (let y = 1; y < imgData.height - 1; y++) {
      for (let x = 1; x < imgData.width - 1; x++) {
        // 复制图像3x3区域到buffer33
        for (let bufferY = 0; bufferY < 3; bufferY++) {
          for (let bufferX = 0; bufferX < 3; bufferX++) {
            buffer33[bufferY * 3 + bufferX] = data[((y - 1 + bufferY) * imgData.width + (x - 1 + bufferX)) * 4 + iChannel]
          }
        }
        // 做5次选择排序，第5个成员就是中值
        for (let i = 0; i < 5; i++) {
          let min = buffer33[i]
          let iMin = i
          for (let j = i + 1; j < buffer33.length; j++) {
            if (buffer33[j] < min) {
              min = buffer33[j]
              iMin = j
            }
          }
          buffer33[iMin] = buffer33[i]
          buffer33[i] = min
        }
        buffer[(y * imgData.width + x) * 3 + iChannel] = buffer33[4]
      }
    }
  }

  copy24BitsTo32Bits(data, buffer, imgData.width, imgData.height)
}

// 将3通道图片复制到4通道图片，忽略边界1像素
function copy24BitsTo32Bits (dstData, srcData, width, height) {
  for (let y = 1; y < height - 1; y++) {
    let iDst = (y * width + 1) * 4
    let iSrc = (y * width + 1) * 3
    for (let x = 1; x < width - 1; x++, iDst += 4, iSrc += 3) {
      dstData[iDst] = srcData[iSrc]
      dstData[iDst + 1] = srcData[iSrc + 1]
      dstData[iDst + 2] = srcData[iSrc + 2]
    }
  }
}
