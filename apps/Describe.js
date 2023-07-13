import plugin from '../../../lib/plugins/plugin.js'
import axios from 'axios'
import { describe } from '../components/midjourney/upDescribe.js'
import { parseImg } from '../utils/utils.js'
import { getResults } from '../utils/task.js'

export class Describe extends plugin {
	constructor() {
		super({
			/** 功能名称 */
			name: 'MJ-描述',
			/** 功能描述 */
			dsc: 'Midjourney 描述',
			event: 'message',
			/** 优先级，数字越小等级越高 */
			priority: 1009,
			rule: [{
				/** 命令正则匹配 */
				reg: '^/mj describe$',
				/** 执行方法 */
				fnc: 'Describe',
			}],
		})
	}

	async Describe(e) {
		e = await parseImg(e)
		if (!e.img) {
			e.reply("未获取到图片", false)
			return true
		}
		let img = await axios.get(e.img[0], {
			responseType: 'arraybuffer'
		});
		let base64 = Buffer.from(img.data, 'binary')
			.toString('base64');
		let params = {
			base64: "data:image/png;base64," + base64,
			notifyHook: '',
			state: '',
		}
		const response = await describe(params);
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
			let task = await getResults(response.data.result)
			if (!task) {
				e.reply(`生成图像失败，请查看控制台输出`)
				return true
			} else {
				let resReply = await e.reply(task.prompt, true)
				if (!resReply) {
					e.reply(`发送消息失败，可能是因为消息过长`)
				}
			}
		} else {
			e.reply(`调用Midjourney API失败，请查看控制台输出`)
		}
		return true
	}
}