# weibo-img-crypto
自动加密解密微博上传的图片

## 如何使用
在浏览器地址栏输入以下代码，上传图片时就会自动加密，在图片上点击鼠标右键就会自动解密。注意前面的 "`javascript:`" 必须手动输入，不能复制粘贴，否则会被浏览器自动去掉

```javascript
javascript:fetch('https://raw.githubusercontent.com/xfgryujk/weibo-img-crypto/master/weibo-img-crypto.js').then(res => res.text(), e => alert('载入失败：' + e)).then(res => {let script = document.createElement('script'); script.innerHTML = res; document.body.appendChild(script)})
```

## 效果
加密后：

![加密后](https://github.com/xfgryujk/weibo-img-crypto/blob/master/encrypted.jpg)

解密后：

![解密后](https://github.com/xfgryujk/weibo-img-crypto/blob/master/decrypted.png)

原图：

![原图](https://github.com/xfgryujk/weibo-img-crypto/blob/master/origin.jpg)
