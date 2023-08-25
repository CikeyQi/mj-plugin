import plugin from '../../../lib/plugins/plugin.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Imagine extends plugin {
<<<<<<< Updated upstream
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
      if (!currentGroupPolicy.group_cool_time_switch) return false
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
      if (!currentPrivatePolicy.private_cool_time_switch) return false
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
=======
    constructor() {
        super({
            /** 功能名称 */
            name: 'MJ-绘制',
            /** 功能描述 */
            dsc: 'Midjourney 绘制',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?(mj|MJ)绘制([\\s\\S]*)$',
                    /** 执行方法 */
                    fnc: 'imagine'
                }
            ]
        })
>>>>>>> Stashed changes
    }

    async imagine(e) {

        if (!global.mjClient) {
            await e.reply("未连接到 Midjourney Bot，请先使用 #mj连接", true);
            return true
        }

        const prompt = e.msg.replace(/^#?(mj|MJ)绘制/, "").trim();

        try {
            e.reply('正在绘制，请稍后...')
            const response = await mjClient.Imagine(prompt, (progress, id) => {
                Log.i(`[${id}]绘制中，当前状态：${progress}`);
            });

            await redis.set(`mj:${e.user_id}`, JSON.stringify(response));
            await redis.set(`mj:${response.id}`, JSON.stringify(response));

            try {
                const base64 = await getPic(response.uri);
                await e.reply(segment.image(`base64://${base64}`));
            } catch (err) {
                Log.e(err)
                await e.reply(response.uri)
                await e.reply('发送图片遇到问题，错误已发送至控制台')
            }
            let optionList = []
            for (let i = 0; i < response.options.length; i++) {
                optionList.push(`[${response.options[i].label}]`)
            }
            if (optionList.length > 0) {
                await e.reply(`[ID:${response.id}]\n可选的操作：\n${optionList.join(' | ')}`)
            }
        } catch (err) {
            Log.e(err)
            e.reply('Midjourney 返回错误：\n' + err, true)
        }
        return true
    }
}
