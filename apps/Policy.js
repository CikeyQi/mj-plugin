import plugin from '../../../lib/plugins/plugin.js'
import Config from '../components/config/config.js'
import Log from '../utils/logs.js'

export class Setting extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: 'MJ-Policy',
            /** 功能描述 */
            dsc: 'Midjourney 策略设置',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 1009,
            rule: [{
                reg: '^/mj (全局)?(个人|群聊)(\\d{5,11})?setting (cd|CD) ((\\d{1,5})|关闭)$',
                fnc: 'setGroupCoolTime',
                permission: 'master',
            }, {
                reg: '^/mj 私聊setting (cd|CD) ((\\d{1,5})|关闭)$',
                fnc: 'setPrivateCoolTime',
                permission: 'master',
            },
            ],
        })
    }
    // 设置群聊冷却时间,当前群未设置时使用全局冷却时间
    async setGroupCoolTime(e) {
        let globalGroupReg = /^\/mj 全局群聊setting cd (\d{1,5}|关闭)$/i
        let globalPersonReg = /^\/mj 全局个人setting cd (\d{1,5}|关闭)$/i
        let currentGroupReg = /^\/mj 群聊(\d{5,11})?setting cd (\d{1,5}|关闭)$/i
        let currentPersonReg = /^\/mj 个人(\d{5,11})?setting cd (\d{1,5}|关闭)$/i
        let [globalGroupCoolTime, globalPersonCoolTime, currentGroupCoolTime, currentPersonCoolTime] = [
            globalGroupReg.exec(e.msg),
            globalPersonReg.exec(e.msg),
            currentGroupReg.exec(e.msg),
            currentPersonReg.exec(e.msg)
        ]
        // 未指定群则为当前群
        let groupID = e.msg.split(' ')[1].match(/\d{5,11}/) || e.group_id
        // 获取时长,关闭全局CD时为1
        let CoolTime = e.msg.split(' ')[3] || 1
        if (CoolTime === "关闭")
            CoolTime = 1
        // cd时长
        if (globalGroupCoolTime) {
            this.setGroupPolicy('global', 'group_cool_time', Number(CoolTime))
        }
        if (globalPersonCoolTime) {
            this.setGroupPolicy('global', 'person_cool_time', Number(CoolTime))
        }
        if (currentGroupCoolTime) {
            this.setGroupPolicy(groupID, 'group_cool_time', Number(CoolTime))
        }
        if (currentPersonCoolTime) {
            this.setGroupPolicy(groupID, 'person_cool_time', Number(CoolTime))
        }
        return true
    }
    // 设置私聊冷却时间
    async setPrivateCoolTime(e) {
        let privateReg = /^\/mj 私聊setting cd (\d{1,5}|关闭)$/i
        let privateCoolTime = privateReg.exec(e.msg)
        let CoolTime = e.msg.split(' ')[3] || 1
        if (CoolTime === "关闭")
            CoolTime = 1
        if (privateCoolTime) {
            this.setPrivatePolicy('private_cool_time', Number(CoolTime))
        }
        return true
    }

    /**写入群聊的策略
     * @param {*} groupID 群号
     * @param {*} key 属性名
     * @param {*} value 属性值
     */
    async setGroupPolicy(groupID, key, value) {
        let policy = await Config.getPolicy()
        // 判断是否是全局设置
        if (groupID === "global") {
            policy.group_property['global'][key] = value
        } else {
            // 判断群号是否存在
            if (!policy.group_property[groupID])
                policy.group_property[groupID] = {}
            policy.group_property[groupID][key] = value
            // 当设置的群属性与全局属性相同则删除当前该属性
            if (policy.group_property[groupID][key] === policy.group_property['global'][key])
                delete policy.group_property[groupID][key]
        }
        // 写入
        try {
            await Config.setPolicy(policy)
        } catch (err) {
            Log.e(err)
            Log.e(err.message)
            return this.e.reply("设置失败。请查看控制台报错", true)
        }
        // 回复
        let gname = '未知群聊'
        if (groupID != "global") {
            try {
                let ginfo = await Bot.getGroupInfo(Number(groupID))
                gname = ginfo ? ginfo.group_name : '未知群聊'
            } catch (err) {
                Log.e(err)
            }
        }
        let msg = [
            groupID == 'global' ? "全部群" : groupID == this.e.group_id ? "本群的" : `群[${gname}](${groupID})的`,
            key == 'group_cool_time' ? "共享cd"
                : key == 'person_cool_time' ? "个人cd"
                    : '???',
            `已设为`,
            (key == 'group_cool_time' || key == 'person_cool_time') ? (value == 1) ? '关闭' : `${value}秒` : '???'
        ]
        this.e.reply(msg, true)
        return true
    }

    /**写入私聊的策略
     * @param {*} key 属性名
     * @param {*} value 属性值
     */
    async setPrivatePolicy(key, value) {
        let policy = Config.getPolicy()
        policy[key] = value
        try {
            await Config.setPolicy(policy)
        } catch (err) {
            Log.e(err)
            Log.e(err.message)
            return this.e.reply("设置失败。请查看控制台报错", true)
        }
        let msg = ['私聊', key == 'private_cool_time' ? '冷却时间' : '???', '已设置为', (key == 'private_cool_time') ? (value == 1) ? '关闭' : `${value}秒` : '???']
        this.e.reply(msg, true)
        return true
    }
}