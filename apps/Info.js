import plugin from '../../../lib/plugins/plugin.js'
import { pluginResources } from '../model/path.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'

export class Info extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-信息',
      /** 功能描述 */
      dsc: 'Midjourney 信息',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#?(mj|MJ)信息$',
          /** 执行方法 */
          fnc: 'info'
        }
      ]
    })
  }

  async info (e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true)
      return true
    }
    const response = await mjClient.Info()
    if (response.subscription.includes('<t:')) {
      const reg = /<t:(\d+)>/g
      const match = response.subscription.match(reg)
      for (let i = 0; i < match.length; i++) {
        const time = match[i].replace('<t:', '').replace('>', '')
        const date = new Date(time * 1000)
        response.subscription = response.subscription.replace(
          match[i],
          date.toLocaleString()
        )
      }
    }
    const TmpModels = [
      [
        { list1: '订阅类型', list2: response.subscription },
        { list1: '工作模式', list2: response.jobMode },
        { list1: '可见性模式', list2: response.visibilityMode },
        { list1: '快速模式剩余时间', list2: response.fastTimeRemaining },
        { list1: '总使用量', list2: response.lifetimeUsage },
        { list1: '舒缓模式使用统计', list2: response.relaxedUsage },
        { list1: '快速模式队列', list2: response.queuedJobsFast },
        { list1: '舒缓模式队列', list2: response.queuedJobsRelax },
        { list1: '正在运行的任务', list2: response.runningJobs }
      ]
    ]
    const base64 = await puppeteer.screenshot('mj-plugin', {
      saveId: 'Info',
      imgType: 'png',
      tplFile: `${pluginResources}/listTemp/listTemp.html`,
      pluginResources,
      header: 'Midjourney 信息',
      lable: '查看您的账号信息，与 Midjourney剩余额度',
      sidebar: '我的信息',
      list1: '内容',
      list2: '状态',
      modelsGroup: TmpModels,
      notice: ''
    })
    await e.reply(base64)
    return true
  }
}
