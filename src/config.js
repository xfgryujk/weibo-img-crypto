const DEFAULT_SEED = '114514'

export function getConfig () {
  return Object.assign({
    enableEncryption: true,
    enableDecryption: true,
    noWaterMark: true,
    codecName: 'Move8x8BlockCodec',
    randomSeed: DEFAULT_SEED,
    postProcess: ''
  }, JSON.parse(window.localStorage.wbImgCryptoConfig || '{}'))
}

export function setConfig (config) {
  window.localStorage.wbImgCryptoConfig = JSON.stringify(config)
}
