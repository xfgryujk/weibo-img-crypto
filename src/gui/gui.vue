<template>
  <div>
    <gui-button :isFloat="isButtonFloat" @click="dialogVisible = true"></gui-button>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="30%">
      <span>这是一段信息</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import GuiButton from './gui-button'

export default {
  components: {
    GuiButton
  },
  props: [
    'isButtonFloat'
  ],
  data () {
    return {
      dialogVisible: false
    }
  },
  methods: {
  }
}
</script>
