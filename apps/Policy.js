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
                reg: '^#mj(全局)?群聊(\\d{5,11})?设置(共享|个人)(cd|CD|冷却)(\\d{1,5}|关闭|开启)$',
                fnc: 'setGroupCoolTime',
                permission: 'master',
            }, {
                reg: '^#mj私聊设置(cd|CD|冷却)(\\d{1,5}|关闭|开启)$',
                fnc: 'setPrivateCoolTime',
                permission: 'master',
            },
            {
                reg: '^#mj解?封禁?本?群(\\d{5,11})?$',
                fnc: 'setBlackGroup',
                permission: 'master',
            },
            {
                reg: '^#mj((解除)?拉黑|解黑)([\\s\\S]*)$',
                fnc: 'setBlackUser',
                permission: 'master',
            }
            ],
        })
    }
    // 设置群聊冷却时间,当前群未设置时使用全局冷却时间
    async setGroupCoolTime(e) {
        const globalGroupReg = /^#mj全局群聊设置共享(cd|冷却)\d{1,5}$/i
        const globalPersonReg = /^#mj全局群聊设置个人(cd|冷却)\d{1,5}$/i
        const currentGroupReg = /^#mj群聊(\d{5,11})?设置共享(cd|冷却)\d{1,5}$/i
        const currentPersonReg = /^#mj群聊(\d{5,11})?设置个人(cd|冷却)\d{1,5}$/i
        const switchGroupReg = /#mj(全局|群聊(\d{5,11})?).*(共享).*(关闭|开启)/i
        const switchPersonReg = /#mj(全局|群聊(\d{5,11})?).*(个人).*(关闭|开启)/i
        const [globalGroupCoolTime, globalPersonCoolTime, currentGroupCoolTime, currentPersonCoolTime, switchGroupCoolTime, switchPersonCoolTime] = [
            globalGroupReg.exec(e.msg),
            globalPersonReg.exec(e.msg),
            currentGroupReg.exec(e.msg),
            currentPersonReg.exec(e.msg),
            switchGroupReg.exec(e.msg),
            switchPersonReg.exec(e.msg)
        ]
        // 未指定群则为当前群
        let groupID = e.msg.match(/全局/) ? 'global' : undefined || e.msg.match(/群聊(\d{5,11})?/)[1] || e.group_id
        // 获取时长,关闭全局CD时为1
        let CoolTime = isNaN(/(cd|冷却)(.*)/i.exec(e.msg)[2]) ? undefined : /(cd|冷却)(.*)/i.exec(e.msg)[2] || 60
        // CD时长
        if (globalGroupCoolTime) {
            this.setGroupPolicy(groupID, 'group_cool_time', Number(CoolTime))
        }
        if (globalPersonCoolTime) {
            this.setGroupPolicy(groupID, 'person_cool_time', Number(CoolTime))
        }
        if (currentGroupCoolTime) {
            this.setGroupPolicy(groupID, 'group_cool_time', Number(CoolTime))
        }
        if (currentPersonCoolTime) {
            this.setGroupPolicy(groupID, 'person_cool_time', Number(CoolTime))
        }
        if (switchGroupCoolTime) {
            this.setGroupPolicy(groupID, 'group_cool_time_switch', switchGroupCoolTime[4] === '开启' ? true : false)
        }
        if (switchPersonCoolTime) {
            this.setGroupPolicy(groupID, 'person_cool_time_switch', switchPersonCoolTime[4] === '开启' ? true : false)
        }
        return true
    }
    // 设置私聊冷却时间
    async setPrivateCoolTime(e) {
        let privateReg = /^#mj私聊设置(cd|冷却)(\d{1,5})$/i
        let switchReg = /(关闭|开启)/
        let [privateCoolTime, switchCoolTime] = [
            privateReg.exec(e.msg),
            switchReg.exec(e.msg)
        ]
        let CoolTime = isNaN(/(cd|冷却)(.*)/i.exec(e.msg)[2]) ? undefined : /(cd|冷却)(.*)/i.exec(e.msg)[2] || 60
        // 设置私聊CD
        if (privateCoolTime) {
            this.setPrivatePolicy('private_cool_time', Number(CoolTime))
        }
        if (switchCoolTime) {
            this.setPrivatePolicy('private_cool_time_switch', switchCoolTime[1] === '开启' ? true : false)
        }
        return true
    }
    // 设置群黑名单
    async setBlackGroup(e) {
        let setBlackReg = /^#mj封禁?群(\d{5,11})?$/i
        let unsetBlackReg = /^#mj解封群(\d{5,11})?$/i
        let [setBlack, unsetBlack] = [
            setBlackReg.exec(e.msg),
            unsetBlackReg.exec(e.msg)
        ]
        // 获取群号
        let groupNumber = e.msg.match(/群(\d{5,11})?/)[1] || e.group_id
        // 判断是拉黑
        if (setBlack) {
            this.setBlackList('black_group', Number(groupNumber), true)
        }
        // 判断是解除拉黑
        if (unsetBlack) {
            this.setBlackList('black_group', Number(groupNumber), false)
        }
        return true
    }
    // 设置用户黑名单
    async setBlackUser(e) {
        let setBlackReg = /^#mj拉黑(\d{5,11})?$/i
        let unsetBlackReg = /^#mj解(除拉)?黑(\d{5,11})?$/i
        let [setBlack, unsetBlack] = [
            setBlackReg.exec(e.msg),
            unsetBlackReg.exec(e.msg)
        ]
        // 获取QQ号
        let qqNumber = e.at || e.msg.match(/黑(\d{5,11})?/)[1]
        if (!qqNumber) {
            e.reply("请检查是否输入正确的QQ号")
            return true
        }
        // 判断是拉黑
        if (setBlack) {
            this.setBlackList('black_user', Number(qqNumber), true)
        }
        // 判断是解除拉黑
        if (unsetBlack) {
            this.setBlackList('black_user', Number(qqNumber), false)
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
        }
        // 写入
        try {
            await Config.setPolicy(policy)
            // 回复
            let groupName = '未知群聊'
            if (groupID != "global") {
                try {
                    let groupInfo = await Bot.getGroupInfo(Number(groupID))
                    groupName = groupInfo ? groupInfo.group_name : '未知群聊'
                } catch (err) {
                    Log.e(err)
                }
            }
            let msg = [
                groupID === 'global' ? "全部群" : groupID === this.e.group_id ? "本群的" : `群[${groupName}](${groupID})的`,
                key === 'group_cool_time' || key === 'group_cool_time_switch' ? "共享cd"
                    : key === 'person_cool_time' || key === 'person_cool_time_switch' ? "个人cd"
                        : '???',
                `已`,
                (key === 'group_cool_time' || key === 'person_cool_time') ? `设为${value}秒`
                    : (key === 'group_cool_time_switch' || key === 'person_cool_time_switch') ? value ? '开启' : '关闭'
                        : '???'
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
            let msg = ['私聊',
                key === 'private_cool_time' || key === 'private_cool_time_switch' ? '冷却时间'
                    : '???',
                '已',
                key === 'private_cool_time' ? `设置为${value}秒` :
                    key === 'private_cool_time_switch' ? value ? '开启' : '关闭'
                        : '???'
            ]
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