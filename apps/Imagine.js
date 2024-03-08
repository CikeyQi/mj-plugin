import plugin from '../../../lib/plugins/plugin.js'
import { makeBotton } from '../components/Botton.js'
import Translate from '../utils/translate.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Imagine extends plugin {
  constructor () {
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
          reg: '^#(mj|MJ)?(绘制|想象)([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'imagine'
        }
      ]
    })
  }

  async imagine(e) {

    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }
  
    const msg = e.msg.replace(/#(mj|MJ)?(绘制|想象)/, '').trim();
  
    const chineseText = msg.match(/[\u4e00-\u9fa5]+/g);
    let prompt = msg;
    if (chineseText) {
      for (let chineseSegment of chineseText) {
        const translation = await Translate.translate(chineseSegment);
        if (translation) {
          prompt = prompt.replace(chineseSegment, translation);
        } else {
          await e.reply('翻译失败了，请检查配置后再试', true);
          return true;
        }
      }
    }
  
    if (!e.isMaster) {
      prompt = prompt.replace(/--(fast|turbo)/g, '');
    }
  
    try {
      await e.reply('正在绘制，请稍后...');
      const response = await mjClient.Imagine(prompt, (progress, id) => {
        Log.i(`[${id}]绘制中，当前状态：${progress}`);
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
