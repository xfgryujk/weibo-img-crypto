<template>
  <div>
    <gui-button :isFloat="isButtonFloat" @click="openGui"></gui-button>

    <el-dialog title="weibo-img-crypto" :visible.sync="dialogVisible">
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

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="onOk">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import GuiButton from './gui-button'
import {getConfig, setConfig} from '../config'

export default {
  components: {
    GuiButton
  },
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
