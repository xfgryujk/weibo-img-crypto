<template>
  <div>
    <el-tooltip class="item" content="发色图救救北极熊">
      <a href="#" @click.prevent="openGui" style="position: fixed; left: 0; bottom: 0">
        <img src="https://ww1.sinaimg.cn/mw690/be15a4ddjw8fbet7h4rpoj209z0c7q39.jpg" width="40px" height="49px">
      </a>
    </el-tooltip>

    <el-dialog title="weibo-img-crypto v1.2.2" :visible.sync="dialogVisible">
      <el-tabs>
        <el-tab-pane label="基础">
          <el-form label-width="100px">
            <el-form-item label="加密">
              <el-switch v-model="form.enableEncryption"></el-switch>
            </el-form-item>
            <el-form-item label="解密">
              <el-switch v-model="form.enableDecryption"></el-switch>
            </el-form-item>
            <el-form-item label="自动去水印">
              <el-switch v-model="form.noWaterMark"></el-switch>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="高级">
          <el-form label-width="100px">
            <el-form-item label="算法">
              <el-select v-model="form.codecName" placeholder="无">
                <el-option label="反色" value="InvertRgbCodec"></el-option>
                <el-option label="随机移动RGB值" value="MoveRgbCodec"></el-option>
                <el-option label="随机移动8x8像素块" value="Move8x8BlockCodec"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="随机种子">
              <el-input v-model="form.randomSeed" type="number"></el-input>
            </el-form-item>
            <el-form-item label="解密后处理">
              <el-select v-model="form.postProcess" placeholder="无">
                <el-option label="无" value=""></el-option>
                <el-option label="高斯模糊（消除高频噪声）" value="gaussianBlur"></el-option>
                <el-option label="中值滤波（消除水印造成的椒盐噪声）" value="medianBlur"></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="选择图片">
          <select-img></select-img>
        </el-tab-pane>

        <el-tab-pane label="帮助和关于">
          <div class="child-mb">
            <p>
              使用方法：上传图片时自动加密，在图片上点击鼠标右键自动解密。加密解密时的算法、随机种子必须一致。如果加了水印，解密后的图片会有杂色，开启自动去水印会在上传时临时关闭你的水印。一般情况下不建议添加解密后处理，如果你实在忍受不了解密后的噪声再添加
            </p>
            <p>
              算法说明：推荐使用随机移动 8x8 像素块算法，这样不会出现有损压缩再解密造成的高频噪声。随机移动 RGB 值算法会出现有损压缩再解密造成的高频噪声。至于反色算法只是作者平时用来看某些博主的色图用的，不算加密
            </p>
            <p>
              推荐使用<a href="https://greasyfork.org/zh-CN/scripts/370359-weibo-img-crypto" target="_blank">油猴脚本</a>，可以最方便地使用 weibo-img-crypto，详情见 <a href="https://github.com/xfgryujk/weibo-img-crypto" target="_blank">GitHub 库 readme</a>
            </p>
            <p>
              作者：xfgryujk，微博 <a href="https://weibo.com/p/1005055023841292" target="_blank">@B1llyHerrington</a>。本项目以 MIT 协议开源，<a href="https://github.com/xfgryujk/weibo-img-crypto" target="_blank">上 GitHub 获取源码</a>
            </p>
          </div>
        </el-tab-pane>
      </el-tabs>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getConfig, setConfig} from '../config'
import SelectImg from './select-img'

export default {
  components: {
    SelectImg
  },
  data () {
    return {
      dialogVisible: false,
      form: getConfig(),
    }
  },
  methods: {
    openGui () {
      this.dialogVisible = true
      this.form = getConfig()
    },
    onOk () {
      this.dialogVisible = false
      this.form.randomSeed = parseInt(this.form.randomSeed)
      setConfig(this.form)
    }
  }
}
</script>

<style scoped>
.child-mb * {
  margin-bottom: 1em
}
</style>
