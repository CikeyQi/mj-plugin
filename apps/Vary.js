import plugin from '../../../lib/plugins/plugin.js'
import { makeButton } from '../components/Button.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Vary extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: 'MJ-调整',
      /** 功能描述 */
      dsc: 'Midjourney 调整',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?调整([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'vary'
        }
      ]
    })
  }

  async vary(e) {

    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }

    const taskId = e.msg.match(/\d{19}/)?.[0] || e.user_id;
    const taskInfoJson = await redis.get(`mj:${taskId}`);
    const taskInfo = JSON.parse(taskInfoJson || '{}');

    if (!taskInfo || !taskInfoJson) {
      await e.reply(
        `未找到${taskId === e.user_id ? '上一次的' : '指定的'}绘制结果，请${e.msg.match(/\d{19}/) ? '检查ID是否正确' : '先使用 #mj绘制'}`,
        true
      );
      return true;
    }

    const adjustment = e.msg.includes('微妙') ? 'Vary (Subtle)'
      : e.msg.includes('强大') ? 'Vary (Strong)'
        : undefined;

    if (!adjustment) {
      await e.reply('请指定要使用的调整选项，例如“#mj调整微妙/强大”', true);
      return true;
    }

    const varyCustomID = taskInfo.options?.find(o => o.label === adjustment)?.custom;

    if (!varyCustomID) {
      await e.reply(`上一次的绘制结果不允许使用${adjustment}，请先使用 #mj放大`);
      return true;
    }

    const content = taskInfo.content?.match(/\*\*(.+?)\*\*/)?.[1];

    try {
      await e.reply(`正在对图片${index}处理，请稍后...`)
      const response = await mjClient.Custom({
        msgId: taskInfo.id.toString(),
        customId: varyCustomID,
        content: content,
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
