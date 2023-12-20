import plugin from '../../../lib/plugins/plugin.js'
import Log from '../utils/logs.js'

export class Describe extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-描述',
      /** 功能描述 */
      dsc: 'Midjourney 描述',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?描述$',
          /** 执行方法 */
          fnc: 'describe'
        }
      ]
    })
  }

  async describe (e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true)
      return true
    }

    if (!e.img) {
      await e.reply('请发送要描述的图片', true)
      return true
    }

    try {
      e.reply('正在描述，请稍后...')
      const response = await mjClient.Describe(e.img[0])
      await e.reply(response.descriptions.join('\n'), true)

      await redis.set(`mj:${e.user_id}`, JSON.stringify(response))
      await redis.set(`mj:${response.id}`, JSON.stringify(response))

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
