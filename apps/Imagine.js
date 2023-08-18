import plugin from '../../../lib/plugins/plugin.js'
import axios from 'axios'
import Config from '../components/config/config.js'
import { getPic } from '../components/midjourney/getPic.js'
import { imagine } from '../components/midjourney/upImagine.js'
import { parseImg } from '../utils/utils.js'
import { getResults } from '../utils/task.js'

export class Imagine extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-想象',
      /** 功能描述 */
      dsc: 'Midjourney 想象',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#想象.*$',
          /** 执行方法 */
          fnc: 'Imagine'
        }
      ]
    })
  }

  async Imagine (e) {
    // 是否在黑名单中
    if (await this.isBanned(e)) return true
    // 是否冷却中
    if (await this.isCoolTime(e)) return true
    e = await parseImg(e)
    let base64 = ''
    if (e.img) {
      const img = await axios.get(e.img[0], {
        responseType: 'arraybuffer'
      })
      base64 = Buffer.from(img.data, 'binary').toString('base64')
    }
    const params = {
      base64: e.img ? 'data:image/png;base64,' + base64 : '',
      prompt: e.msg.replace(/^#想象/, ''),
      notifyHook: '',
      state: ''
    }
    const response = await imagine(params)
    if (response.data) {
      if (response.data.code == 1) {
        e.reply(
          `您的绘图任务已提交成功，正在为您生成图像......\n任务ID：${response.data.result}`,
          true
        )
      } else if (response.data.code == 21) {
        e.reply('该任务已存在，请稍后再试', true)
      } else if (response.data.code == 22) {
        e.reply('任务排队中，请稍后再试', true)
      } else {
        e.reply(
          `Midjourney API返回错误：[${response.data.code} ${response.data.description}]`,
          true
        )
        this.clearCoolTime(e)
      }
      redis.set(`midjourney:taskId:${e.user_id}`, response.data.result, {
        EX: 1800
      })
      const task = await getResults(response.data.result)
      if (!task) {
        e.reply('生成图像失败，请查看控制台输出')
        this.clearCoolTime(e)
        return true
      } else {
        const base64 = await getPic(task.imageUrl)
        const resReply = await e.reply(
          [
            { ...segment.image(`base64://${base64}`), origin: true },
            `任务耗时：${(task.finishTime - task.startTime) / 1000}s`
          ],
          true
        )
        if (!resReply) {
          e.reply(
            `发送图像失败，可能是因为图像过大，或无法访问图像链接\n图像链接：${task.imageUrl}`
          )
        }
      }
    } else {
      e.reply('调用Midjourney API失败，请查看控制台输出')
    }
    return true
  }

  /** 查看是否在CD中
   * @param {object} e 消息
   * @returns {boolean} 是否在冷却中,冷却中为true
   */
  async isCoolTime (e) {
    // 判断主人
    if (e.isMaster) {
      return false
    }
    const record = {
      msg: e.msg,
      img: e.img || null,
      messageTime: e.time
    }
    // 是否在群聊中
    if (e.message_type === 'group') {
      // 获取当前群策略
      const currentGroupPolicy = Config.getGroupPolicy(e.group_id)
      // 判断CD开关是否开启
      if (currentGroupPolicy.group_cool_time_switch) return false
      // 查询是否在CD中
      const personRecord = JSON.parse(
        await redis.get(`MJ:PersonRecord:${e.group_id}:${e.user_id}`)
      )
      const groupRecord = JSON.parse(
        await redis.get(`MJ:GroupRecord:${e.group_id}`)
      )
      if (!personRecord && !groupRecord) {
        // 写入个人CD
        redis.set(
          `MJ:PersonRecord:${e.group_id}:${e.user_id}`,
          JSON.stringify(record),
          { EX: currentGroupPolicy.person_cool_time }
        )
        // 写入群共享CD
        redis.set(`MJ:GroupRecord:${e.group_id}`, JSON.stringify(record), {
          EX: currentGroupPolicy.group_cool_time
        })
      } else {
        const msg = [
          personRecord
            ? '您还需' +
              `${
                personRecord.messageTime +
                currentGroupPolicy.person_cool_time -
                e.time
              }秒` +
              '才能画噢'
            : groupRecord
              ? '当前群还需' +
              `${
                groupRecord.messageTime +
                currentGroupPolicy.group_cool_time -
                e.time
              }秒` +
              '才能画噢'
              : '查询CD失败'
        ]
        e.reply(msg, true)
        return true
      }
    } else {
      // 获取私聊策略
      const currentPrivatePolicy = Config.getPolicy()
      if (currentPrivatePolicy.private_cool_time_switch) return false
      const privateRecord = JSON.parse(
        await redis.get(`MJ:PrivateRecord:${e.user_id}`)
      )
      if (!privateRecord) {
        redis.set(`MJ:PrivateRecord:${e.user_id}`, JSON.stringify(record), {
          EX: currentPrivatePolicy.private_cool_time
        })
      } else {
        const msg = [
          privateRecord
            ? '您还需' +
              `${
                privateRecord.messageTime +
                currentPrivatePolicy.private_cool_time -
                e.time
              }秒` +
              '才能画噢'
            : '查询CD失败'
        ]
        e.reply(msg, true)
        return true
      }
    }
    return false
  }

  /** 清空当前用户以及群CD
   * @param {object} e 消息
   */
  async clearCoolTime (e) {
    // 是否在群聊中
    if (e.message_type === 'group') {
      redis.del(`MJ:PersonRecord:${e.group_id}:${e.user_id}`)
      redis.del(`MJ:GroupRecord:${e.group_id}`)
      return true
    } else {
      redis.del(`MJ:PrivateRecord:${e.user_id}`)
      return true
    }
  }

  /** 判断用户或群是否在黑名单中
   * @param {object} e 消息
   * @return {boolean} 是否在黑名单中
   */
  async isBanned (e) {
    const policy = await Config.getPolicy()
    // 是否在群聊中
    if (e.message_type === 'group') {
      if (policy.black_group.indexOf(e.group_id) !== -1) {
        e.reply('当前群已被禁止画图')
        return true
      }
    }
    if (policy.black_user.indexOf(e.user_id) !== -1) {
      e.reply('你已被主人禁止画图')
      return true
    }
    return false
  }
}
