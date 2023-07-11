import plugin from '../../../lib/plugins/plugin.js'
import axios from 'axios'
import Config from '../components/config/config.js'
import Log from '../utils/logs.js'

export class Setting extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'MJ-设置',
            /** 功能描述 */
            dsc: 'Midjourney 设置',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [{
                /** 命令正则匹配 */
                reg: '^/mj setting .+ .+$',
                /** 执行方法 */
                fnc: 'Setting',
                /** 主人权限 */
                permission: "master",
            }],
        })
    }

    async Setting(e) {
        // 取出参数
        let key = e.msg.split(' ')[2]
        let value = e.msg.split(' ')[3]
        Log.i('更新配置项', key, value)
        // 读取配置
        let config = await Config.getSetting()
        // 判断是否存在
        if (!config[key]) {
            e.reply(`配置项${key}不存在`)
            return true
        } else {
            // 如果是midjourney_proxy_api，判断是否能够请求/mj/task/list
            if (key == 'midjourney_proxy_api') {
                if (value.endsWith('/')) {
                    value = value.substring(0, value.length - 1)
                }
                try {
                    let response = await axios.get(`${value}/mj/task/list`)
                    // 如果是200，说明接口正常
                    if (response.status == 200) {
                        config[key] = value
                        Config.setSetting(config)
                        e.reply(`配置项${key}已修改为${value}`)
                        return true
                    }
                } catch (e) {
                    e.reply(`配置项${key}修改失败，测试接口连通性失败，请检查配置是否正确`)
                    return true
                }
            } else {
                if (value == 'true') {
                    value = true
                } else if (value == 'false') {
                    value = false
                }
                config[key] = value
                Config.setSetting(config)
                e.reply(`配置项${key}已修改为${value}`)
                return true
            }
        }
    }
}