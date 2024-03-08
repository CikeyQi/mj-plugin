import plugin from '../../../lib/plugins/plugin.js'
import { makeButton } from '../components/Button.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Pan extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-平移',
      /** 功能描述 */
      dsc: 'Midjourney 平移',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?平移([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'pan'
        }
      ]
    })
  }

  async pan (e) {

    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }
  
    const msgId = e.msg.match(/\d{19}/)?.[0] || e.user_id;
    const taskInfoRaw = await redis.get(`mj:${msgId}`);
    const taskInfo = JSON.parse(taskInfoRaw);
  
    if (!taskInfo) {
      const replyMsg = e.msg.match(/\d{19}/)
        ? '未找到指定的绘制结果，请检查ID是否正确'
        : '未找到上一次的绘制结果，请先使用 #mj绘制';
      await e.reply(replyMsg, true);
      return true;
    }
  
    const index = e.msg.match(/上|下|左|右/)?.[0];
    if (!index) {
      await e.reply('请指定要使用的平移方向，如“上”、“下”、“左”、“右”', true);
      return true;
    }
  
    const directionMap = { '上': '⬆️', '下': '⬇️', '左': '⬅️', '右': '➡️' };
    const customName = directionMap[index];
  
    const panCustomID = taskInfo.options?.find(
      (o) => o.label === customName
    )?.custom;
  
    if (!panCustomID) {
      await e.reply(`上一次的绘制结果不允许使用${index}方向，请先使用 #mj绘制生成新的内容`, true);
      return true;
    }
  
    const content = taskInfo.content?.match(/\*\*(.+?)\*\*/)?.[1];
  
    try {
      await e.reply(`正在进行${customName}平移，请稍后...`);
      const response = await mjClient.Custom({
        msgId: taskInfo.id.toString(),
        customId: panCustomID,
        content: content,
        flags: taskInfo.flags,
      });

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
