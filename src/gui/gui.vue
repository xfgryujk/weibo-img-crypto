<template>
  <div>
    <el-tooltip class="item" content="发色图救救北极熊">
      <a href="#" @click.prevent="openGui" style="position: fixed; left: 0; bottom: 0">
        <img src="https://ww1.sinaimg.cn/mw690/be15a4ddjw8fbet7h4rpoj209z0c7q39.jpg" width="40px" height="49px">
      </a>
    </el-tooltip>

    <el-dialog title="weibo-img-crypto v1.1.1" :visible.sync="dialogVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item label="加密">
          <el-switch v-model="form.enableEncryption"></el-switch>
        </el-form-item>
        <el-form-item label="解密">
          <el-switch v-model="form.enableDecryption"></el-switch>
        </el-form-item>
        <el-form-item label="自动去水印">
          <el-switch v-model="form.noWaterMark"></el-switch>
        </el-form-item>
        <el-form-item label="随机种子">
          <el-input v-model="form.randomSeed" type="number"></el-input>
        </el-form-item>
      </el-form>
      <p>
        有了<a href="https://greasyfork.org/zh-CN/scripts/370359-weibo-img-crypto" target="_blank">油猴脚本</a>，能更快使用 weibo-img-crypto，详情见 <a href="https://github.com/xfgryujk/weibo-img-crypto" target="_blank">GitHub 库 readme</a>
      </p>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {getConfig, setConfig} from '../config'

export default {
  props: [
    'isButtonFloat'
  ],
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
