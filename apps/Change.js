import plugin from '../../../lib/plugins/plugin.js'
import { getPic } from '../components/midjourney/getPic.js'
import { change } from '../components/midjourney/upChange.js'
import { parseImg } from '../utils/utils.js'
import { getResults } from '../utils/task.js'


export class Change extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'MJ-变化',
            /** 功能描述 */
            dsc: 'Midjourney 变化',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [{
                /** 命令正则匹配 */
                reg: '^/mj change [UuVv] [1-4]$',
                /** 执行方法 */
                fnc: 'Change',
            }],
        })
    }

    async Change(e) {
        e = await parseImg(e)
        let action = ''
        let type = e.msg.split(' ')[2].toLowerCase()
        if (type == 'u') {
            action = 'UPSCALE'
        } else if (type == 'v') {
            action = 'VARIATION'
        }
        let index = e.msg.split(' ')[3]
        let taskId = await redis.get(`midjourney:taskId:${e.user_id}`)
        if (!taskId) {
            e.reply(`您还没有提交过绘图任务，请先使用/mj imagine提交绘图任务，任务保存时间为30分钟`)
            return true
        }
        let params = {
            action: action,
            index: index,
            notifyHook: '',
            state: '',
            taskId: taskId,
        }
        const response = await change(params);
        if (response.data) {
            if (response.data.code == 1) {
                e.reply(`绘图任务已提交成功，正在为您生成图像......\n任务ID：${response.data.result}`, true)
            } else if (response.data.code == 21) {
                e.reply(`该任务已存在，正在为您生成图像......\n任务ID：${response.data.result}`, true)
            } else if (response.data.code == 22) {
                e.reply(`任务${response.data.description}\n任务ID：${response.data.result}`, true)
            } else {
                e.reply(`Midjourney API返回错误：[${response.data.code} ${response.data.description}]`, true)
                return true
            }
            // 如果是变化任务，需要将任务ID存入redis，用于后续的变化任务
            if (action == 'VARIATION') {
                await redis.set(`midjourney:taskId:${e.user_id}`, response.data.result, 'EX', 1800)
            }
            let task = await getResults(response.data.result)
            if (!task) {
                e.reply(`生成图像失败，请查看控制台输出`)
                return true
            } else {
                const base64 = await getPic(task)
                let resReply = await e.reply([{ ...segment.image(`base64://${base64}`), origin: true }, `任务耗时：${(task.finishTime - task.startTime) / 1000}s`], true)
                if (!resReply) {
                    e.reply(`发送图像失败，可能是因为图像过大，或无法访问图像链接\n图像链接：${task.imageUrl}`)
                }
            }
        } else {
            e.reply(`调用Midjourney API失败，请查看控制台输出`)
        }
        return true
    }
}
