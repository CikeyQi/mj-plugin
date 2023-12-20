import plugin from '../../../lib/plugins/plugin.js'

export class Relax extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-舒缓模式',
      /** 功能描述 */
      dsc: 'Midjourney 舒缓模式',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?舒缓模式$',
          /** 执行方法 */
          fnc: 'relax',
          /** 主人权限 */
          permission: 'master'
        }
      ]
    })
  }

  async relax (e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true)
      return true
    }
    await mjClient.Relax()
    await e.reply('Midjourney 已切换到舒缓模式')
    return true
  }
}
