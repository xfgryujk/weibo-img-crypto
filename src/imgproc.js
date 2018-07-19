// 将图像数据分离为各通道一个数组，返回包含各通道的数组
export function splitChannels (data, nChannels = 4) {
  let nPixels = data.length / nChannels
  let channels = []
  for (let i = 0; i < nChannels; i++) {
    channels.push(new Uint8ClampedArray(nPixels))
  }
  for (let iChannel = 0; iChannel < nChannels; iChannel++) {
    for (let iPixel = 0; iPixel < nPixels; iPixel++) {
      channels[iChannel][iPixel] = data[iPixel * 4 + iChannel]
    }
  }
  return channels
}

// 将多个通道合并为一个数组
export function mergeChannels (channels) {
  let nChannels = channels.length
  let nPixels = channels[0].length
  let data = new Uint8ClampedArray(nChannels * nPixels)
  for (let iPixel = 0; iPixel < nPixels; iPixel++) {
    for (let iChannel = 0; iChannel < nChannels; iChannel++) {
      data[iPixel * 4 + iChannel] = channels[iChannel][iPixel]
    }
  }
  return data
}

// 3x3高斯模糊
export function gaussianBlur (imgData) {
  const KERNEL = [
    [1, 2, 1],
    [2, 4, 2],
    [1, 2, 1]
  ]
  const KERNEL_TOTAL = 16

  let channels = splitChannels(imgData.data)
  for (let iChannel = 0; iChannel < 3; iChannel++) {
    // 懒得做填充了，边界像素不处理
    for (let y = 1; y < imgData.height - 1; y++) {
      for (let x = 1; x < imgData.width - 1; x++) {
        let sum = 0
        for (let kernelY = 0; kernelY < 3; kernelY++) {
          for (let kernelX = 0; kernelX < 3; kernelX++) {
            sum += channels[iChannel][(y - 1 + kernelY) * imgData.width + (x - 1 + kernelX)] *
                   KERNEL[kernelY][kernelX]
          }
        }
        channels[iChannel][y * imgData.width + x] = sum / KERNEL_TOTAL
      }
    }
  }

  let data = mergeChannels(channels)
  for (let i = 0; i < data.length; i++) {
    imgData.data[i] = data[i]
  }
}

// 3x3中值滤波
export function medianBlur (imgData) {
  let channels = splitChannels(imgData.data)
  let buffer = new Array(3 * 3)
  for (let iChannel = 0; iChannel < 3; iChannel++) {
    // 懒得做填充了，边界像素不处理
    for (let y = 1; y < imgData.height - 1; y++) {
      for (let x = 1; x < imgData.width - 1; x++) {
        // 复制图像3x3区域到buffer
        for (let bufferY = 0; bufferY < 3; bufferY++) {
          for (let bufferX = 0; bufferX < 3; bufferX++) {
            buffer[bufferY * 3 + bufferX] = channels[iChannel][(y - 1 + bufferY) * imgData.width + (x - 1 + bufferX)]
          }
        }
        // 做5次选择排序，第5个成员就是中值
        for (let i = 0; i < 5; i++) {
          let min = buffer[i]
          let iMin = i
          for (let j = i + 1; j < buffer.length; j++) {
            if (buffer[j] < min) {
              min = buffer[j]
              iMin = j
            }
            buffer[iMin] = buffer[i]
            buffer[i] = min
          }
        }
        channels[iChannel][y * imgData.width + x] = buffer[4]
      }
    }
  }

  let data = mergeChannels(channels)
  for (let i = 0; i < data.length; i++) {
    imgData.data[i] = data[i]
  }
}
