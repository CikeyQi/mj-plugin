import plugin from '../../../lib/plugins/plugin.js'
import axios from 'axios'
import Config from '../components/config/config.js'
import Log from '../utils/logs.js'
import Init from '../model/init.js'

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
      rule: [
        {
          /** 命令正则匹配 */
          reg: '^#mj设置.+$',
          /** 执行方法 */
          fnc: 'Setting',
          /** 主人权限 */
          permission: 'master'
        }
      ]
    })
  }

  async Setting(e) {
    // 初始化
    Init.initSetting()
    // 读取配置
    const settings = await Config.getSetting()
    // 取出参数
    const regParam = /(接口|代理)(.+)/g.exec(e.msg)
    const key = regParam[1]
    let value = regParam[2]
    if (!key) {
      e.reply(`配置项不存在,请检查输入`)
      return true
    }
    // 修改标志位,修改成功后修改为true
    let alterFlag = false
    switch (key) {
      // mj设置接口
      case '接口':
        if (value.endsWith('/')) {
          value = value.substring(0, value.length - 1)
        }
        try {
          const response = await axios.get(`${value}/mj/task/list`)
          // 如果是200，说明接口正常
          if (response.status == 200) {
            settings['midjourney_proxy_api'] = value
            alterFlag = true
          }
        } catch (e) {
          e.reply(
            `配置项代理修改失败，测试接口连通性失败，请检查配置是否正确`
          )
          return true
        }
        break
      // mj设置代理
      case '代理':
        // mj设置代理地址
        if (value.match(/[0-9.:]{9,21}/)) {
          const pattern =
            /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):[0-9]{1,5}$/
          if (!pattern.test(value)) {
            e.reply('请输入正确的ip地址,格式为127.0.0.1:7890', false)
          } else {
            [settings.proxy.host, settings.proxy.port] = value.split(':')
            alterFlag = true
          }
        }
        // mj设置代理开关
        if (value.match(/(开启|关闭)/)) {
          if (value === '开启') {
            settings.proxy.switch = true
            alterFlag = true
          } else if (value === '关闭') {
            settings.proxy.switch = false
            alterFlag = true
          }
        }
        break
    }
    if (alterFlag) {
      Config.setSetting(settings)
      e.reply(`配置项${key}已修改为${value}`)
      Log.i('更新配置项', key, value)
    } else {
      e.reply(`配置项${key}无法修改为${value}`)
    }
    return true
  }
}
