import plugin from '../../../lib/plugins/plugin.js'
import { imagine } from '../components/midjourney/upImagine.js'
import { parseImg } from '../utils/utils.js'
import { getResults } from '../utils/task.js'

export class Imagine extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'MJ-想象',
			/** 功能描述 */
			dsc: 'Midjourney 想象',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 1009,
			rule: [{
				/** 命令正则匹配 */
				reg: '^/mj imagine .*$',
				/** 执行方法 */
				fnc: 'Imagine',
			}],
		})
	}

	async Imagine(e) {
		e = await parseImg(e)
		let base64 = ''
		if (e.img) {
			let img = await axios.get(e.img[0], {
				responseType: 'arraybuffer'
			});
			base64 = Buffer.from(img.data, 'binary')
				.toString('base64');
		}
		let params = {
			base64: e.img ? "data:image/png;base64," + base64 : '',
			prompt: e.msg.replace('/mj imagine ', ''),
			notifyHook: '',
			state: '',
		}
		const response = await imagine(params);
		if (response.data) {
			if (response.data.code == 1) {
				e.reply(`绘图任务已提交成功，正在为您生成图像......\n任务ID：${response.data.result}`, true)
			} else if (response.data.code == 21) {
				e.reply(`该任务已存在，请稍后再试`, true)
			} else if (response.data.code == 22) {
				e.reply(`任务排队中，请稍后再试`, true)
			} else {
				e.reply(`Midjourney API返回错误：[${response.data.code} ${response.data.description}]`, true)
			}
			let task = await getResults(response.data.result)
			if (!task) {
				e.reply(`生成图像失败，请查看控制台输出`)
				return true
			} else {
				let resReply = await e.reply([{ ...segment.image(task.imageUrl), origin: true }, `任务耗时：${(task.finishTime - task.startTime) / 1000}s`], true)
				if (!resReply) {
					e.reply(`发送图像失败，可能是因为图像过大，或无法访问图像链接\n图像链接：${task.imageUrl}`)
				}
				redis.set(`midjourney:taskId:${e.user_id}`, response.data.result, 'EX', 1800)
			}
		} else {
			e.reply(`调用Midjourney API失败，请查看控制台输出`)
		}
		return true
	}
}