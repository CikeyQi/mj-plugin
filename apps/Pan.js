import detectBannedWords from '../components/BannedWords.js'
import plugin from '../../../lib/plugins/plugin.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Pan extends plugin {
    constructor() {
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
                    reg: '^#?(mj|MJ)平移([\\s\\S]*)$',
                    /** 执行方法 */
                    fnc: 'pan'
                }
            ]
        })
    }

    async pan(e) {

        const bannedWords = await detectBannedWords(e.msg)
        if (bannedWords.length > 0) {
            await e.reply(`检测到敏感词：${bannedWords.join('，')}，请修改后重试`, true);
            return true
        }

        if (!global.mjClient) {
            await e.reply("未连接到 Midjourney Bot，请先使用 #mj连接", true);
            return true
        }

        const taskInfo = await JSON.parse(await redis.get(`mj:${e.msg.match(/\d{19}/)?.[0] || e.user_id}`));

        if (!taskInfo) {
            if (e.msg.match(/\d{19}/)) {
                await e.reply("未找到指定的绘制结果，请检查ID是否正确", true);
                return true
            } else {
                await e.reply("未找到上一次的绘制结果，请先使用 #mj绘制", true);
                return true
            }
        }

        const index = e.msg.match(/上|下|左|右/)?.[0];

        if (!index) {
            await e.reply("请指定要使用的拓展倍数，例如“#mj拓展2x/1.5x”", true);
            return true
        }

        let customName;
        if (index === "上") {
            customName = '⬆️';
        } else if (index === "下") {
            customName = '⬇️';
        } else if (index === "左") {
            customName = '⬅️';
        } else {
            customName = '➡️';
        }


        const panCustomID = taskInfo.options?.find((o) => o.label === customName)?.custom;

        if (!panCustomID) {
            await e.reply(`上一次的绘制结果不允许使用${customName}，请先使用 #mj放大`);
            return true
        }

        try {
            e.reply(`正在进行${customName}平移，请稍后...`)
            const response = await mjClient.Custom({
                msgId: taskInfo.id.toString(),
                customId: panCustomID,
                content: taskInfo.content?.match(/(?<=\*\*).+?(?=\*\*)/)?.[0],
                flags: taskInfo.flags,
                loading: (uri, progress) => {
                    Log.i(`[${progress}]绘制中，当前状态：${uri}`);
                },
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
