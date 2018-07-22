<template>
  <div>
    <p class="mb">这个功能是用来从微博之外选择图片加解密的</p>
    <el-form label-width="100px">
      <el-form-item label="处理">
        <el-switch v-model="isEncryption" active-text="加密" inactive-text="解密"></el-switch>
      </el-form-item>
      <el-form-item label="粘贴图片">
        <el-input @paste.native.prevent="onPaste" placeholder="也可以在此处粘贴图片"></el-input>
      </el-form-item>
      <el-form-item label="选择图片">
        <el-upload action="" drag multiple list-type="picture" :file-list="fileList" :before-upload="onUpload" :on-remove="onRemove" :on-preview="onPreview">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击选择</em></div>
        </el-upload>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {encrypt, decrypt} from '../codec'

export default {
  data () {
    return {
      isEncryption: true,
      fileList: []
    }
  },
  methods: {
    onPaste (event) {
      for (let item of event.clipboardData.items) {
        let file = item.getAsFile()
        if (file) {
          this.handleFile(file)
        }
      }
    },
    onUpload (file) {
      this.handleFile(file)
      return false
    },
    handleFile (file) {
      if (!file.type.startsWith('image') || file.type === 'image/gif') { // 暂时不支持GIF
        return
      }
      let reader = new window.FileReader()
      reader.onload = () => {
        let img = new window.Image()
        img.onload = () => {
          if (this.isEncryption) {
            this.fileList.push({name: file.name, url: encrypt(img)})
          } else {
            decrypt(img).then(url => this.fileList.push({name: file.name, url: url}))
          }
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
    },
    onRemove (file, fileList) {
      this.fileList = fileList
    },
    onPreview (file) {
      let url
      if (file.url.startsWith('data:')) {
        // file.url太长了，浏览器地址栏装不下
        let [memePart, base64Str] = file.url.split(',')
        let meme = /:(.*?);/.exec(memePart)[1]
        let dataStr = atob(base64Str)
        let data = new Uint8Array(dataStr.length)
        for (let i = 0; i < dataStr.length; i++) {
          data[i] = dataStr.charCodeAt(i)
        }
        url = window.URL.createObjectURL(new Blob([data], {type: meme}))
      } else {
        url = file.url
      }
      window.open(url)
    }
  }
}
</script>

<style scoped>
.mb {
  margin-bottom: 1em
}
</style>
