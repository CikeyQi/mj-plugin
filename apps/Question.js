import plugin from '../../../lib/plugins/plugin.js'
import puppeteer from '../../../lib/puppeteer/puppeteer.js'
import { fetch } from '../components/midjourney/queID.js'
import { list } from '../components/midjourney/queAll.js'
import { getPic } from '../components/midjourney/getPic.js'
import { pluginResources } from '../model/path.js'

export class Question extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-查询',
      /** 功能描述 */
      dsc: 'Midjourney 查询',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^/mj (question|q) all$',
          /** 执行方法 */
          fnc: 'QuestionAll'
        },
        {
          /** 命令正则匹配 */
          reg: '^/mj (question|q) (\\d+)$',
          /** 执行方法 */
          fnc: 'Question'
        }
      ]
    })
  }

  async Question (e) {
    // 判断命令中是否有任务ID
    const reg = /^\/mj (question|q) (\d+)$/
    const match = e.msg.match(reg)
    let taskId = ''
    if (!match) {
      taskId = await redis.get(`midjourney:taskId:${e.user_id}`)
    } else {
      taskId = match[2]
    }
    if (taskId.length != 16) {
      const queAll = await list()
      if (taskId > 0 && taskId <= queAll.data.length) {
        taskId = queAll.data[taskId - 1].id
      } else {
        e.reply('任务ID错误，请检查后重试')
        return true
      }
    }
    if (!taskId) {
      e.reply(
        '您还没有提交过绘图任务，请先使用/mj imagine提交绘图任务，任务保存时间为30分钟'
      )
      return true
    }
    const response = await fetch(taskId)
    if (response.data) {
      const action = response.data.action
      const status = response.data.status
      const progress = response.data.progress
      const description = response.data.description
        ? response.data.description
        : ''
      const failReason = response.data.failReason
        ? response.data.failReason
        : ''
      const msg = `${description}\n\n[${action}]\n[${status}] [${progress}]\n${failReason}`
      e.reply(msg, true)
      await redis.set(
        `midjourney:taskId:${e.user_id}`,
        taskId,
        'EX',
        1800
      )

    } else {
      e.reply(
        `Midjourney API返回错误：[${response.data.code} ${response.data.description}]`,
        true
      )
    }
    if (response.data.status == 'SUCCESS') {
      const base64 = await getPic(response.data.imageUrl)
      const resReply = await e.reply(
        [
          { ...segment.image(`base64://${base64}`), origin: true },
          `任务耗时：${
            (response.data.finishTime - response.data.startTime) / 1000
          }s`
        ],
        true
      )
      if (!resReply) {
        e.reply(
          `发送图像失败，可能是因为图像过大，或无法访问图像链接\n图像链接：${response.data.imageUrl}`
        )
      }
    }
    return true
  }

  async QuestionAll (e) {
    const response = await list()
    if (response.data) {
      const model = []
      for (let i = 0; i < response.data.length; i++) {
        let firstList = ''
        let secondList = ''
        let thirdList = ''
        let able = 0
        switch (response.data[i].action) {
          case 'IMAGINE':
            firstList = '想象(I)'
            break
          case 'UPSCALE':
            firstList = '放大(U)'
            break
          case 'VARIATION':
            firstList = '变化(V)'
            break
          case 'REROLL':
            firstList = '重绘(R)'
            break
          case 'DESCRIBE':
            firstList = '描述(D)'
            break
          case 'BLEND':
            firstList = '混合(B)'
            break
          default:
            firstList = response.data[i].action
            break
        }
        switch (response.data[i].status) {
          case 'NOT_START':
            secondList = '未开始'
            able = 1
            break
          case 'SUBMITTED':
            secondList = '已提交'
            able = 1
            break
          case 'IN_PROGRESS':
            secondList = '进行中'
            able = 2
            break
          case 'FAILURE':
            secondList = '失败'
            able = 3
            break
          case 'SUCCESS':
            secondList = '成功'
            break
          default:
            secondList = response.data[i].status
            break
        }
        switch (response.data[i].status) {
          case 'SUCCESS':
            thirdList = response.data[i].promptEn
            break
          case 'FAILURE':
            thirdList = response.data[i].failReason
            break
          case 'IN_PROGRESS':
            thirdList = response.data[i].progress
            break
          default:
            thirdList = response.data[i].description
            break
        }
        thirdList =
          thirdList.substring(0, 35) + (thirdList.length > 35 ? '...' : '')
        model.push({
          firstList,
          secondList,
          thirdList,
          able
        })
      }
      const base64 = await puppeteer.screenshot('mj-plugin', {
        imgType: 'png',
        saveId: 'swichModel',
        tplFile: `${pluginResources}/taskList/taskList.html`,
        pluginResources,
        headerText: 'Midjourney任务列表',
        firstList: '类型',
        secondList: '状态',
        thirdList: '任务信息',
        model,
        sideBarLabel: '默认接口',
        noticeText: '可以直接使用序号来查看指定任务结果，例如：/mj q 1'
      })
      const resReply = await e.reply(base64)
      if (!resReply) {
        e.reply('发送图像失败，可能是账号被风控，请查看控制台报错')
      }
    } else {
      e.reply(
        `Midjourney API返回错误：[${response.data.code} ${response.data.description}]`,
        true
      )
    }
  }
}
