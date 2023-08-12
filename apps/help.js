import plugin from '../../../lib/plugins/plugin.js'
import { sendHelpPic } from '../components/createPic/sendHelpPic.js'

export class help extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'MJ-帮助',
            /** 功能描述 */
            dsc: 'Midjourney 帮助',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [
                {
                    /** 命令正则匹配 */
                    reg: '^#?(mj|MJ)帮助$',
                    /** 执行方法 */
                    fnc: 'Help'
                }
            ]
        })
    }
    async Help(e) {
        return await sendHelpPic(e)
    }
}