import plugin from '../../../lib/plugins/plugin.js'
import { makeBotton } from '../components/Botton.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Reroll extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-重绘',
      /** 功能描述 */
      dsc: 'Midjourney 重绘',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?重绘([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'reroll'
        }
      ]
    })
  }

  async reroll(e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }
  
    const taskId = e.msg.match(/\d{19}/)?.[0] || e.user_id;
    const taskInfoJson = await redis.get(`mj:${taskId}`);
    const taskInfo = JSON.parse(taskInfoJson || 'null');
  
    if (!taskInfo) {
      await e.reply(
        `未找到${taskId !== e.user_id ? '指定的' : '上一次的'}绘制结果，请${taskId !== e.user_id ? '检查ID是否正确' : '先使用 #mj绘制'}`,
        true
      );
      return true;
    }
  
    const rerollCustomID = taskInfo.options?.find(o => o.label === '🔄')?.custom;
    if (!rerollCustomID) {
      await e.reply('上一次的绘制结果不允许使用🔄，请先使用 #mj绘制', true);
      return true;
    }
  
    try {
      await e.reply('正在重绘，请稍后...');
      const response = await mjClient.Custom({
        msgId: taskInfo.id.toString(),
        customId: rerollCustomID,
        flags: taskInfo.flags,
        loading: (uri, progress) => {
          Log.i(`[${progress}]绘制中，当前状态：${uri}`);
        }
      });

      await Promise.all([
        redis.set(`mj:${e.user_id}`, JSON.stringify(response)),
        redis.set(`mj:${response.id}`, JSON.stringify(response))
      ]);

      try {
        const base64 = await getPic(response.uri);
        let buttons = await makeBotton(response.options.map(option => option.label), response.id);
  
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
