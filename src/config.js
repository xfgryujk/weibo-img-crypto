const DEFAULT_SEED = 114514

export function getConfig () {
  return Object.assign({
    enableEncryption: true,
    enableDecryption: true,
    noWaterMark: true,
    randomSeed: DEFAULT_SEED
  }, JSON.parse(localStorage.wbImgCryptoConfig || '{}'))
}

export function setConfig (config) {
  localStorage.wbImgCryptoConfig = JSON.stringify(config)
}
