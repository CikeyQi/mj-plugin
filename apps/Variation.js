import plugin from '../../../lib/plugins/plugin.js'
import getPic from '../components/Proxy.js'
import Log from '../utils/logs.js'

export class Variation extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'MJ-变化',
            /** 功能描述 */
            dsc: 'Midjourney 变化',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?(mj|MJ)变化([\\s\\S]*)$',
                    /** 执行方法 */
                    fnc: 'variation'
                }
            ]
        })
    }

    async variation(e) {

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
        
        const Num = e.msg.match(/第([一二三四五六七八九十\d]+)张/)?.[1];

        if (!Num) {
            await e.reply("请指定要使用变化的图片，例如“#mj变化第一张”", true);
            return true
        }

        const index = Num.replace(/[一二三四五六七八九十]/g, (s) => {
            return '一二三四五六七八九十'.indexOf(s) + 1
        });

        if (index < 1 || index > 4) {
            await e.reply("图片序号超出范围，请指定1-4之间的数字", true);
            return true
        }

        const variationCustomID = taskInfo.options?.find((o) => o.label === `V${index}`)?.custom;

        if (!variationCustomID) {
            await e.reply(`上一次的绘制结果不允许使用V${index}，请先使用 #mj绘制`, true);
            return true
        }

        try {
            e.reply(`正在变化，请稍后...`)
            const response = await mjClient.Custom({
                msgId: taskInfo.id.toString(),
                customId: variationCustomID,
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
