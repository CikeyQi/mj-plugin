import plugin from '../../../lib/plugins/plugin.js'
import { imagine } from '../components/midjourney/upImagine.js'
import { fetch } from '../components/midjourney/queID.js'

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
		let params = {
			base64: e.img? e.img[0]: '',
			prompt: e.msg.replace('/mj imagine ', ''),
			notifyHook: '',
			state: '',
		}
		const response = await imagine(params);
		if (response.data) {
			e.reply(`[${response.data.code} ${response.data.description}]`)
			if (response.data.code == 1) {
				let task = await fetch(response.data.result)
				while (task.data.status == 'IN_PROGRESS' || task.data.status == 'NOT_START' || task.data.status == 'SUBMITTED') {
					await new Promise((resolve) => {
						setTimeout(() => {
							resolve()
						}, 3000)
					})
					task = await fetch(response.data.result)
				}
				if (task.data.status == 'SUCCESS') {
					e.reply(segment.image(task.data.imageUrl), true)
				} else {
					e.reply(`[${task.data.status}]任务失败，原因：${task.data.description}`)
				}
			}
		} else {
			e.reply(`调用Midjourney API失败，请查看控制台`)
		}
		return true
	}
}