import plugin from '../../../lib/plugins/plugin.js'
import { makeBotton } from '../components/Botton.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class FaceSwap extends plugin {
  constructor () {
    super({
      /** 功能名称 */
      name: 'MJ-换脸',
      /** 功能描述 */
      dsc: 'Midjourney 换脸',
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 1009,
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#(mj|MJ)?换脸$',
          /** 执行方法 */
          fnc: 'faceswap'
        }
      ]
    })
  }

  async faceswap (e) {
    if (!global.mjClient) {
      await e.reply('未连接到 Midjourney Bot，请先使用 #mj连接', true);
      return true;
    }
  
    if (!e.img || e.img.length !== 2) {
      const errMsg = !e.img
        ? '请发送要换脸的图片，第一张为靶图片，第二张为源图片'
        : '请按正确顺序发送两张图片，第一张为靶图片，第二张为源图片';
      await e.reply(errMsg, true);
      return true;
    }
  
    const [target, source] = e.img;
  
    try {
      await e.reply('正在换脸，请稍后...');
      const response = await mjClient.FaceSwap(target, source);

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
