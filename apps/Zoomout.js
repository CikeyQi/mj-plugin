import plugin from '../../../lib/plugins/plugin.js'
import { makeBotton } from '../components/Botton.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Zoomout extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-拓展',
      /** 功能描述 */
      dsc: 'Midjourney 拓展',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?拓展([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'zoomout'
        }
      ]
    })
  }

  async zoomout (e) {

    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }
    
    const taskId = e.msg.match(/\d{19}/)?.[0] || e.user_id;
    const taskInfoStr = await redis.get(`mj:${taskId}`);
    const taskInfo = taskInfoStr ? JSON.parse(taskInfoStr) : null;

    if (!taskInfo) {
      const replyMessage = taskId === e.user_id
        ? '未找到上一次的绘制结果，请先使用 #mj绘制'
        : '未找到指定的绘制结果，请检查ID是否正确';
      await e.reply(replyMessage, true);
      return true;
    }
    const zoomRegex = /(?<zoom>2x|1.5x|custom\d+)/;
    const zoomMatch = e.msg.match(zoomRegex);
    const zoom = zoomMatch ? zoomMatch.groups.zoom : null;
    let customName;
    
    switch (zoom) {
      case '2x':
        customName = 'Zoom Out 2x';
        break;
      case '1.5x':
        customName = 'Zoom Out 1.5x';
        break;
      default:
        if (zoom && zoom.startsWith('custom')) {
          const customNum = parseInt(zoom.replace('custom', ''), 10);
          if (isNaN(customNum) || customNum < 1 || customNum > 10) {
            await e.reply('拓展倍数超出范围或不正确，请指定1-10之间的数字', true);
            return true;
          }
          taskInfo.content +=
            ` --zoom ${customNum}`;
          customName = 'Custom Zoom';
          break;
        }

        await e.reply('请指定要使用的拓展倍数，例如“#mj拓展2x/1.5x/custom2”', true);
        return true;
    }
    
    const zoomoutCustomID = taskInfo.options?.find(
      (o) => o.label === customName
    )?.custom;
    
    if (!zoomoutCustomID) {
      await e.reply(
        `上一次的绘制结果不允许使用${customName}，请先使用 #mj放大`
      )
      return true;
    }

    try {
      await e.reply(`正在进行${customName}拓展，请稍后...`)
      const response = await mjClient.Custom({
        msgId: taskInfo.id.toString(),
        customId: zoomoutCustomID,
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
