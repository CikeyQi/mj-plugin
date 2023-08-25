import detectBannedWords from '../components/BannedWords.js'
import plugin from '../../../lib/plugins/plugin.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Blend extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'MJ-混合',
            /** 功能描述 */
            dsc: 'Midjourney 混合',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?(mj|MJ)混合$',
                    /** 执行方法 */
                    fnc: 'blend'
                }
            ]
        })
    }

    async blend(e) {

        const bannedWords = await detectBannedWords(e.msg)
        if (bannedWords.length > 0) {
            await e.reply(`检测到敏感词：${bannedWords.join('，')}，请修改后重试`, true);
            return true
        }

        if (!global.mjClient) {
            await e.reply("未连接到 Midjourney Bot，请先使用 #mj连接", true);
            return true
        }

        if (!e.img) {
            await e.reply("请发送要混合的图片", true);
            return true
        }

        if (e.img.length < 2) {
            await e.reply("请发送至少两张图片", true);
            return true
        }

        const prompt = e.img.map((img) => {
            return img
        }).join(' ');

        try {
            e.reply('正在混合，请稍后...')
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
