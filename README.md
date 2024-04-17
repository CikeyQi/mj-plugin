![mj-plugin](https://socialify.git.ci/CikeyQi/mj-plugin/image?description=1&font=Raleway&forks=1&issues=1&language=1&name=1&owner=1&pattern=Circuit%20Board&pulls=1&stargazers=1&theme=Auto)

<img decoding="async" align=right src="resources/readme/girl.png" width="35%">

# MJ-PLUGIN🥥

- 一个适用于 [Yunzai 系列机器人框架](https://github.com/yhArcadia/Yunzai-Bot-plugins-index) 的的 AI 绘图插件，让你在输入框中拥有便捷的AI绘画体验

- 使用强大的的 [Midjourney](https://www.midjourney.com) 作为后端，**付费**使用，生成的质量更高，理解能力更好，只需一句话即可生成高质量图片

- **使用中遇到问题请加QQ群咨询：[707331865](https://qm.qq.com/q/TXTIS9KhO2)**

> [!TIP]
> 继 [AP-PLUGIN](https://github.com/AiPreface/ap-plugin) 的下一个AI绘图插件，这时 [渔火](https://github.com/yhArcadia) 就已经跑了。在我独自开发这个插件时，[二枣子](https://github.com/erzaozi) 加入了开发队伍，为我提供了很多帮助，帮我处理了繁琐的部分，让我专注于核心代码开发。

## 安装插件

#### 1. 克隆仓库

```
git clone https://github.com/CikeyQi/mj-plugin.git ./plugins/mj-plugin
```

> [!NOTE]
> 如果你的网络环境较差，无法连接到Github，可以使用 [GitHub Proxy](https://mirror.ghproxy.com/) 提供的文件代理加速下载服务
> ```
> git clone https://mirror.ghproxy.com/https://github.com/CikeyQi/mj-plugin.git ./plugins/mj-plugin
> ```

#### 2. 安装依赖

```
pnpm install --filter=mj-plugin
```

## 插件配置

> [!WARNING]
> 非常不建议手动修改配置文件，本插件已兼容 [Guoba-plugin](https://github.com/guoba-yunzai/guoba-plugin) ，请使用锅巴插件对配置项进行修改

- <details> <summary>获取 Salai Token</summary>

  [登录 Discord](https://discord.com/channels/@me) F12 或者 [Ctrl + Shift + I] 或者 [Command + Option + I] 打开开发者工具，然后在 Console 中输入以下代码：

  ```javascript
  window.webpackChunkdiscord_app.push([
    [Math.random()],
    {},
    (req) => {
      for (const m of Object.keys(req.c)
        .map((x) => req.c[x].exports)
        .filter((x) => x)) {
        if (m.default && m.default.getToken !== undefined) {
          return copy(m.default.getToken());
        }
        if (m.getToken !== undefined) {
          return copy(m.getToken());
        }
      }
    },
  ]);
  console.log("%cWorked!", "font-size: 50px");
  console.log(`%您的Token在剪贴板了!`, "font-size: 16px");
  ```

  也可以通过 查看 Network： [获取 Discord Token](https://www.androidauthority.com/get-discord-token-3149920/)

  </details>

- <details> <summary>获取 Server_id 和 Channel_id</summary>

  [创建一个 Discord 服务器](https://discord.com/blog/starting-your-first-discord-server) 并邀请 [Midjourney Bot](https://docs.midjourney.com/docs/invite-the-bot)

  ```bash
  # 在浏览器中复制你的服务器网址
  # `https://discord.com/channels/$SERVER_ID/$CHANNEL_ID`
  ```
  </details>

## 功能列表

请使用 `#mj帮助` 获取完整帮助

- [x] Imagine 想象/绘制
- [x] Variation 变化
- [x] Upscale 放大
- [x] Reroll 重绘
- [x] Blend 融合
- [x] FaceSwap 换脸
- [x] Shorten 优化
- [x] Describe 描述
- [x] Vary 调整
- [x] Zoomout 拓展
- [x] Custom 按钮
- [x] Pan 平移
- [x] Info 信息
- [x] Setting 设置

## 常见问题
1. 我为什么连接不上？
   + 大陆服务器无法直接访问 Discord，需要使用代理服务器，请配置代理。
   + 请确保你的配置文件填写正确无误。

## 支持与贡献

如果你喜欢这个项目，请不妨点个 Star🌟，这是对开发者最大的动力， 当然，你可以对我 [爱发电](https://afdian.net/a/sumoqi) 赞助，呜咪~❤️

有意见或者建议也欢迎提交 [Issues](https://github.com/CikeyQi/mj-plugin/issues) 和 [Pull requests](https://github.com/CikeyQi/mj-plugin/pulls)。

## 相关项目
* [midjourney-api](https://github.com/erictik/midjourney-api)：MidJourney client. Unofficial Node.js client

## 许可证
本项目使用 [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) 作为开源许可证。