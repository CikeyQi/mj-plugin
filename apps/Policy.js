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
                reg: '^(#mj|/mj )(全局)?群聊(\\d{5,11})?(共享|个人)(setting|设置) ?(cd|CD) ?((\\d{1,5})|关闭)$',
                fnc: 'setGroupCoolTime',
                permission: 'master',
            }, {
                reg: '^(#mj|/mj )私聊(setting|设置) ?(cd|CD) ?((\\d{1,5})|关闭)$',
                fnc: 'setPrivateCoolTime',
                permission: 'master',
            },
            {
                reg: '^(#mj解?封禁?|/mj (un)?ban)群 ?(\\d{5,11})?$',
                fnc: 'setBlackGroup',
                permission: 'master',
            },
            {
                reg: '^(#mj((解除)?拉黑|解黑)|/mj (un)?ban)[\s\S]*$',
                fnc: 'setBlackUser',
                permission: 'master',
            }
            ],
        })
    }
    // 设置群聊冷却时间,当前群未设置时使用全局冷却时间
    async setGroupCoolTime(e) {
        let globalGroupReg = /^(#mj|\/mj )全局群聊共享(setting|设置) ?(cd|CD) ?(\d{1,5}|关闭)$/i
        let globalPersonReg = /^(#mj|\/mj )全局群聊个人(setting|设置) ?(cd|CD) ?(\d{1,5}|关闭)$/i
        let currentGroupReg = /^(#mj|\/mj )群聊(\d{5,11})?共享(setting|设置) ?(cd|CD) ?(\d{1,5}|关闭)$/i
        let currentPersonReg = /^(#mj|\/mj )群聊(\d{5,11})?个人(setting|设置) ?(cd|CD) ?(\d{1,5}|关闭)$/i
        let [globalGroupCoolTime, globalPersonCoolTime, currentGroupCoolTime, currentPersonCoolTime] = [
            globalGroupReg.exec(e.msg),
            globalPersonReg.exec(e.msg),
            currentGroupReg.exec(e.msg),
            currentPersonReg.exec(e.msg)
        ]
        // 未指定群则为当前群
        let groupID = e.msg.match(/群聊(\d{5,11})?/)[1] || e.group_id
        // 获取时长,关闭全局CD时为1
        let CoolTime = e.msg.match(/(cd|CD) ?(\d{1,5}|关闭)/)[2] || 1
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
        let privateReg = /^(#mj|\/mj )私聊(setting|设置) ?(cd|CD) ?(\d{1,5}|关闭)$/i
        let privateCoolTime = privateReg.exec(e.msg)
        let CoolTime = e.msg.match(/(\d{1,5}|关闭)/)[1] || 1
        Log.e(CoolTime)
        if (CoolTime === "关闭")
            CoolTime = 1
        if (privateCoolTime) {
            this.setPrivatePolicy('private_cool_time', Number(CoolTime))
        }
        return true
    }
    // 设置群黑名单
    async setBlackGroup(e) {
        let setBlackReg = /^(#mj封禁?|\/mj ban)群 ?(\d{5,11})?$/i
        let unsetBlackReg = /^(#mj解封|\/mj unban)群 ?(\d{5,11})?$/i
        let [setBlack, unsetBlack] = [
            setBlackReg.exec(e.msg),
            unsetBlackReg.exec(e.msg)
        ]
        // 获取群号
        let groupNumber = null
        if (e.msg.match(/\d{5,11}/)) {
            groupNumber = Number(e.msg.match(/\d{5,11}/))
        } else {
            groupNumber = e.group_id
        }
        // 判断是拉黑
        if (setBlack) {
            this.setBlackList('black_group', groupNumber, true)
        }
        // 判断是解除拉黑
        if (unsetBlack) {
            this.setBlackList('black_group', groupNumber, false)
        }
        return true
    }
    // 设置用户黑名单
    async setBlackUser(e) {
        let setBlackReg = /^(#mj拉黑|\/mj ban)( \d{5,11})?$/i
        let unsetBlackReg = /^(#mj解(除拉)?黑|\/mj unban)( \d{5,11})?$/i
        let [setBlack, unsetBlack] = [
            setBlackReg.exec(e.msg),
            unsetBlackReg.exec(e.msg)
        ]
        // 获取QQ号
        let qqNumber = null
        if (e.at) {
            qqNumber = e.at
        } else if (e.msg.match(/\d{5,11}/)) {
            qqNumber = Number(e.msg.match(/\d{5,11}/))
        } else {
            e.reply("请检查是否输入正确的QQ号")
            return true
        }
        // 判断是拉黑
        if (setBlack) {
            this.setBlackList('black_user', qqNumber, true)
        }
        // 判断是解除拉黑
        if (unsetBlack) {
            this.setBlackList('black_user', qqNumber, false)
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
        } catch (err) {
            Log.e(err)
            Log.e(err.message)
            return this.e.reply("设置失败。请查看控制台报错", true)
        }
        return true
    }

    /**写入私聊CD的策略
     * @param {*} key 属性名
     * @param {*} value 属性值
     */
    async setPrivatePolicy(key, value) {
        let policy = await Config.getPolicy()
        policy[key] = value
        try {
            await Config.setPolicy(policy)
            let msg = ['私聊', key == 'private_cool_time' ? '冷却时间' : '???', '已设置为', (key == 'private_cool_time') ? (value == 1) ? '关闭' : `${value}秒` : '???']
            this.e.reply(msg, true)
        } catch (err) {
            Log.e(err)
            Log.e(err.message)
            return this.e.reply("设置失败。请查看控制台报错", true)
        }
        return true
    }

    /**写入键存在时,增删列表值的策略
     * @param {*} key 属性名
     * @param {*} value 属性值
     * @param {boolean} isAdd True为为该列表增加元素,False为为该列表删除元素
     */
    async setBlackList(key, value, isAdd) {
        let policy = await Config.getPolicy()
        // 如果值存在,找到该值的索引
        const index = policy[key].indexOf(value)
        if (isAdd) {
            if (index > -1) {
                this.e.reply([key == 'black_user' ? '用户'
                    : key == 'black_group' ? '群号'
                        : '???',
                `${value}已经在黑名单里啦`], true)
                return true
            } else
                policy[key].push(value)
        } else {
            if (index > -1) {
                policy[key].splice(index, 1)
            }
        }
        try {
            await Config.setPolicy(policy)
            let msg = [
                key == 'black_user' ? isAdd ? `已把用户${value}拖入黑名单了` : `已把用户${value}从黑名单揪出来了`
                    : key == 'black_group' ? isAdd ? `已把群号${value}拖入黑名单了` : `已把群号${value}从黑名单揪出来了`
                        : "???"
            ]
            this.e.reply(msg, true)
        } catch (err) {
            Log.e(err)
            Log.e(err.message)
            return this.e.reply("设置失败。请查看控制台报错", true)
        }
        return true
    }
}