import detectBannedWords from '../components/BannedWords.js'
import { makeButton } from '../components/Button.js'
import plugin from '../../../lib/plugins/plugin.js'
import Log from '../utils/logs.js'

export class Shorten extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-优化',
      /** 功能描述 */
      dsc: 'Midjourney 优化',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?优化([\\s\\S]*)$',
          /** 执行方法 */
          fnc: 'shorten'
        }
      ]
    })
  }

  async shorten (e) {

    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }

    const prompt = e.msg.replace(/^#(mj|MJ)?优化/, '').trim()

    const bannedWords = await detectBannedWords(e.msg);
    if (bannedWords.length) {
      await e.reply(`检测到敏感词：${bannedWords.join('，')}，请修改后重试`, true);
      return true;
    }

    try {
      await e.reply('正在优化，请稍后...')
      const response = await mjClient.Shorten(prompt)

      await Promise.all([
        redis.set(`mj:${e.user_id}`, JSON.stringify(response)),
        redis.set(`mj:${response.id}`, JSON.stringify(response))
      ]);

      try {
        let buttons = await makeButton(response.options.map(option => option.label), response.id)
  
        await e.reply([
          response.prompts.join('\n'),
          ...buttons
        ]);
  
        if (response.options.length > 0) {
          await e.reply(`[ID:${response.id}]\n可选的操作：\n${response.options.map(option => `[${option.label}]`).join(' | ')}`);
        }
      } catch (err) {
        Log.e(err);
        await e.reply('发送内容遇到问题，错误已发送至控制台');
      }
    } catch (err) {
      Log.e(err);
      await e.reply('Midjourney 返回错误：\n' + err, true);
    }
    return true;
  }
}
