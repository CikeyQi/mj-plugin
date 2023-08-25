import plugin from '../../../lib/plugins/plugin.js'
import { Main } from './Main.js'

export class Connect extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'MJ-连接',
      /** 功能描述 */
      dsc: 'Midjourney 连接',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(mj|MJ)(连接|重连|断开)$',
          /** 执行方法 */
          fnc: 'connect'
        }
      ]
    })
  }

  async connect(e) {
    if (e.msg.includes('连接')) {
      if (global.mjClient) {
        await e.reply("当前已连接到 Midjourney Bot，如需强制重连请使用 #mj重连");
      } else {
        await e.reply("正在连接 Midjourney Bot，请稍后...")
        await Main();
        if (!global.mjClient) {
          await e.reply("连接 Midjourney 失败，请检查配置后重试", true);
        } else {
          await e.reply("已连接到 Midjourney Bot");
        }
      }
    } else if (e.msg.includes('重连')) {
      if (!global.mjClient) {
        await e.reply("当前未连接到 Midjourney Bot，如需连接请使用 #mj连接");
      } else {
        await e.reply("正在连接 Midjourney Bot，请稍后...")
        await Main();
        if (!global.mjClient) {
          await e.reply("连接 Midjourney 失败，请检查配置后重试", true);
        } else {
          await e.reply("已连接到 Midjourney Bot");
        }
      }
    } else if (e.msg.includes('断开')) {
      if (!global.mjClient) {
        await e.reply("当前未连接到 Midjourney Bot，无需断开");
      } else {
        await global.mjClient.Close();
        await e.reply("已断开 Midjourney Bot");
      }
    }
    return true
  }
}
