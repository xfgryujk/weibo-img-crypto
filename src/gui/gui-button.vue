<template>
  <a href="javascript:void(0);" title="发色图" class="S_txt1" :style="style">
    <img src="https://ww1.sinaimg.cn/mw690/be15a4ddjw8fbet7h4rpoj209z0c7q39.jpg" width="20px" height="20px">
    发色图
  </a>
</template>

<script>
export default {
  props: [
    'isFloat'
  ],
  computed: {
    style () {
      let style = {
        'padding-top': '10px',
        display: 'inline-block',
        'line-height': '24px'
      }
      if (this.isFloat) {
        style.position = 'fixed'
        style.left = style.bottom = 0
      }
      return style
    }
  }
}
</script>
