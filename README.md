# weibo-img-crypto
自动加密解密微博上传的图片

## 如何使用
### 方法 1，适合临时使用
在浏览器地址栏输入以下代码，上传图片时就会自动加密，在图片上点击鼠标右键就会自动解密。注意前面的 "`javascript:`" 必须手动输入，不能复制粘贴，否则会被浏览器自动去掉。执行成功后，点击左下角的北极熊 ~~（天哥哥）~~ 按钮可以打开设置界面

```javascript
javascript:fetch('https://raw.githubusercontent.com/xfgryujk/weibo-img-crypto/master/weibo-img-crypto.js').then(res => res.text(), e => alert('载入失败：' + e)).then(res => {let script = document.createElement('script'); script.innerHTML = res; document.body.appendChild(script)})
```

也可以按 `Ctrl + Shift + J` 打开控制台，在控制台输入。也可以将这些代码作为网址添加到书签/收藏夹，能更快使用

### 方法 2，适合长期使用
首先安装 [Tampermonkey](http://tampermonkey.net/) 浏览器扩展，然后[去 Greasy Fork 添加 weibo-img-crypto 脚本](https://greasyfork.org/zh-CN/scripts/370359-weibo-img-crypto)。这样访问微博时会自动执行方法 1 的代码

## 高级
加密的原理是把 RGB 数据随机移动到一个新位置，所以加密解密时的随机种子必须一样。默认的随机种子是 `114514`，可以在设置界面修改随机种子

由于 JPEG 是有损压缩，解密后的图片有高频噪声，不过可以被人眼自动过滤。理论上如果数据无损，解密后的图片和原图一样 ~~（都怪渣浪不用 PNG）~~

## 兼容性
目前不支持 GIF 图，以后可能支持

只在 Chrome、Edge 浏览器测试过，不保证支持其他浏览器 ~~（IE 是什么？我可不知道）~~

## 其他要注意的
如果加了水印，解密后的图片会有杂色

## 效果
加密后：

![加密后](https://github.com/xfgryujk/weibo-img-crypto/blob/master/demo/encrypted.jpg)

解密后：

![解密后](https://github.com/xfgryujk/weibo-img-crypto/blob/master/demo/decrypted.png)

原图：

![原图](https://github.com/xfgryujk/weibo-img-crypto/blob/master/demo/origin.jpg)

## FA♂Q
### 为什么不支持手机端？
目前实在没有找到支持手机端的简单方法，如果有可以告诉我

### 为什么不自己租个服务器放图片？
你出钱我就租

### 为什么不用傅里叶变换？
因为图片的灰度范围只有 256 个数，而傅里叶变换后的值域非常大，无法表示，更不用说 JPEG 压缩后的损失了

### 为什么不用异或？
初版用的就是异或的方法，但是经过 JPEG 压缩后再解密出现了严重的噪点，而且异或后的图片还是能看出轮廓，无法防止被二五仔举报

### 为什么不用 AES、RSA 等加密？
同上，我觉得保留原始像素数据能尽量减少数据损失，而且加密是怎么乱怎么来，最好不要留原图的轮廓以免被二五仔举报

### 默认随机种子 114514 是什么意思？
作者的恶趣味，自行百度

## TODO
* 图片过大的提示和自动缩小
* 解密后自动高斯模糊（或中值滤波？）消除噪声
* 分块加密防止 JPEG 压缩
