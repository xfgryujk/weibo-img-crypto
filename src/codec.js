import {RandomSequence} from './random'

export const DEFAULT_SEED = 114514

export function encrypt (data) {
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

export function decrypt (data) {
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
