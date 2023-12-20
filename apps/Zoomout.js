import plugin from '../../../lib/plugins/plugin.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Zoomout extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-拓展',
      /** 功能描述 */
      dsc: 'Midjourney 拓展',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?拓展([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'zoomout'
        }
      ]
    })
  }

  async zoomout (e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true)
      return true
    }

    const taskInfo = await JSON.parse(
      await redis.get(`mj:${e.msg.match(/\d{19}/)?.[0] || e.user_id}`)
    )

    if (!taskInfo) {
      if (e.msg.match(/\d{19}/)) {
        await e.reply('未找到指定的绘制结果，请检查ID是否正确', true)
        return true
      } else {
        await e.reply('未找到上一次的绘制结果，请先使用 #mj绘制', true)
        return true
      }
    }
    const index = e.msg.match(/2x|1.5x/)?.[0] || 'custom'

    if (index === 'custom') {
      const customNum = e.msg.match(/custom(\d+)/)?.[1]
      if (!customNum) {
        await e.reply('请指定要使用的拓展倍数，例如“#mj拓展custom2”', true)
        return true
      }
      if (customNum < 1 || customNum > 10) {
        await e.reply('拓展倍数超出范围，请指定1-5之间的数字', true)
        return true
      }
      taskInfo.content =
        taskInfo.content.match(/(?<=\*\*).+?(?=\*\*)/)?.[0] +
        ` --zoom ${customNum}`
    }

    if (!index) {
      await e.reply('请指定要使用的拓展倍数，例如“#mj拓展2x/1.5x”', true)
      return true
    }

    let customName
    if (index === '2x') {
      customName = 'Zoom Out 2x'
    } else if (index === '1.5x') {
      customName = 'Zoom Out 1.5x'
    } else {
      customName = 'Custom Zoom'
    }

    const zoomoutCustomID = taskInfo.options?.find(
      (o) => o.label === customName
    )?.custom

    if (!zoomoutCustomID) {
      await e.reply(
        `上一次的绘制结果不允许使用${customName}，请先使用 #mj放大`
      )
      return true
    }

    try {
      e.reply(`正在进行${customName}拓展，请稍后...`)
      const response = await mjClient.Custom({
        msgId: taskInfo.id.toString(),
        customId: zoomoutCustomID,
        content: taskInfo.content?.match(/(?<=\*\*).+?(?=\*\*)/)?.[0],
        flags: taskInfo.flags,
        loading: (uri, progress) => {
          Log.i(`[${progress}]绘制中，当前状态：${uri}`)
        }
      })

      await redis.set(`mj:${e.user_id}`, JSON.stringify(response))
      await redis.set(`mj:${response.id}`, JSON.stringify(response))

      try {
        const base64 = await getPic(response.uri)
        await e.reply(segment.image(`base64://${base64}`))
      } catch (err) {
        Log.e(err)
        await e.reply(response.uri)
        await e.reply('发送图片遇到问题，错误已发送至控制台')
      }
      const optionList = []
      for (let i = 0; i < response.options.length; i++) {
        optionList.push(`[${response.options[i].label}]`)
      }
      if (optionList.length > 0) {
        await e.reply(
          `[ID:${response.id}]\n可选的操作：\n${optionList.join(' | ')}`
        )
      }
    } catch (err) {
      Log.e(err)
      e.reply('Midjourney 返回错误：\n' + err, true)
    }
    return true
  }
}
