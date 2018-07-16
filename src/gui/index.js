import Vue from 'vue'
import GuiButton from './gui-button'

export function initGui () {
  addButton()
}

function addButton () {
  let button = document.createElement('a')
  let parent = document.querySelector('.func_area')
  // 兼容查看原图页面
  let isFloat = !parent
  if (isFloat) {
    parent = document.body
  }
  parent.appendChild(button)
  /* eslint-disable no-new */
  new Vue({
    el: button,
    render: h => h(GuiButton, {
      props: {
        isFloat
      }
    })
  })
}
