import plugin from '../../../lib/plugins/plugin.js'

export class Fast extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-快速模式',
      /** 功能描述 */
      dsc: 'Midjourney 快速模式',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?快速模式$',
          /** 执行方法 */
          fnc: 'fast',
          /** 主人权限 */
          permission: 'master'
        }
      ]
    })
  }

  async fast (e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true)
      return true
    }
    await mjClient.Fast()
    await e.reply('Midjourney 已切换到快速模式')
    return true
  }
}
