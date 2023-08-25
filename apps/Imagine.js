import detectBannedWords from '../components/BannedWords.js'
import plugin from '../../../lib/plugins/plugin.js'
import Translate from '../utils/translate.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Imagine extends plugin {
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
  }

  async imagine(e) {

    if (!global.mjClient) {
      await e.reply("未连接到 Midjourney Bot，请先使用 #mj连接", true);
      return true
    }

    const chineseText = e.msg.match(/[\u4e00-\u9fa5]+/g);
    let prompt = e.msg;
    
    if (chineseText !== null) {
      for (let i = 0; i < chineseText.length; i++) {
        const translation = await Translate.translate(chineseText[i]);
        if (translation !== false) {
          prompt = prompt.replace(chineseText[i], translation.translatedText);
        } else {
          await e.reply('翻译失败了，请检查配置后再试', true);
          break;
        }
      }
    }

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
