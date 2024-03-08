import plugin from '../../../lib/plugins/plugin.js'
import { makeButton } from '../components/Button.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Variation extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-变化',
      /** 功能描述 */
      dsc: 'Midjourney 变化',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?变化([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'variation'
        }
      ]
    })
  }

  async variation (e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }
  
    const taskId = e.msg.match(/\d{19}/)?.[0] || e.user_id;
    const taskInfoRaw = await redis.get(`mj:${taskId}`);
    const taskInfo = taskInfoRaw && JSON.parse(taskInfoRaw);
  
    if (!taskInfo) {
      const replyMsg = taskId !== e.user_id ? '未找到指定的绘制结果，请检查ID是否正确' : '未找到上一次的绘制结果，请先使用 #mj绘制';
      await e.reply(replyMsg, true);
      return true;
    }
  
    const Num = e.msg.match(/第([一二三四五六七八九十\d]+)张/)?.[1];
    if (!Num) {
      await e.reply('请指定要使用放大的图片，例如“#mj放大第一张”', true);
      return true;
    }
    const index = Num.replace(/[一二三四五六七八九十]/g, s => '一二三四五六七八九十'.indexOf(s) + 1);
  
    if (index < 1 || index > 4) {
      await e.reply('图片序号超出范围，请指定1-4之间的数字', true);
      return true;
    }
  
    const upscaleCustomID = taskInfo.options?.find(o => o.label === `V${index}`)?.custom;
    if (!upscaleCustomID) {
      await e.reply(`上一次的绘制结果不允许使用U${index}，请先使用 #mj绘制`, true);
      return true;
    }

    try {
      await e.reply('正在变化，请稍后...')
      const response = await mjClient.Custom({
        msgId: taskInfo.id.toString(),
        customId: variationCustomID,
        content: taskInfo.content?.match(/(?<=\*\*).+?(?=\*\*)/)?.[0],
        flags: taskInfo.flags,
        loading: (uri, progress) => {
          Log.i(`[${progress}]绘制中，当前状态：${uri}`)
        }
      })

      await Promise.all([
        redis.set(`mj:${e.user_id}`, JSON.stringify(response)),
        redis.set(`mj:${response.id}`, JSON.stringify(response))
      ]);

      try {
        const base64 = await getPic(response.uri);
        let buttons = await makeButton(response.options.map(option => option.label), response.id);
  
        await e.reply([
          { ...segment.image('base64://' + base64), origin: true },
          ...buttons
        ]);
  
        if (response.options.length > 0) {
          await e.reply(`[ID:${response.id}]\n可选的操作：\n${response.options.map(option => `[${option.label}]`).join(' | ')}`);
        }
      } catch (err) {
        Log.e(err);
        await e.reply(response.uri);
        await e.reply('发送图片遇到问题，错误已发送至控制台');
      }
    } catch (err) {
      Log.e(err);
      await e.reply('Midjourney 返回错误：\n' + err, true);
    }
    return true;
  }
}
