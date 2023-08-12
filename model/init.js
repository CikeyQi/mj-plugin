import fs from 'fs'
import Config from '../components/config/config.js'
import { pluginRoot } from '../model/path.js'
import Log from '../utils/logs.js'

class Init {
  constructor () {
    this.initSetting()
    // this.initPares()
    this.initPolicy()
    // this.initPreset()
  }

  initSetting () {
    // 判断config/setting_default.yaml是否存在
    const setting_default_path = `${pluginRoot}/config/setting_default.yaml`
    if (!fs.existsSync(setting_default_path)) {
      Log.e('默认设置文件不存在，请检查或重新安装插件')
      return true
    }
    // 判断config/config/setting.yaml是否存在
    const setting_path = `${pluginRoot}/config/config/setting.yaml`
    if (!fs.existsSync(setting_path)) {
      Log.e('设置文件不存在，将使用默认设置文件')
      fs.copyFileSync(setting_default_path, setting_path)
    }
    // 同步setting.yaml和setting_default.yaml
    const setting_default_yaml = Config.getDefSetting()
    const setting_yaml = Config.getSetting()
    for (const key in setting_default_yaml) {
      if (!(key in setting_yaml)) {
        setting_yaml[key] = setting_default_yaml[key]
      }
    }
    for (const key in setting_yaml) {
      if (!(key in setting_default_yaml)) {
        delete setting_yaml[key]
      }
    }
    Config.setSetting(setting_yaml)
  }

  initPolicy () {
    // 判断config/policy_default.yaml是否存在
    const policy_default_path = `${pluginRoot}/config/policy_default.yaml`
    if (!fs.existsSync(policy_default_path)) {
      Log.e('默认设置文件不存在，请检查或重新安装插件')
      return true
    }
    // 判断config/config/policy.yaml是否存在
    const policy_path = `${pluginRoot}/config/config/policy.yaml`
    if (!fs.existsSync(policy_path)) {
      Log.e('设置文件policy.yaml不存在，将使用默认设置文件')
      fs.copyFileSync(policy_default_path, policy_path)
    }
    // 同步policy.yaml和policy_default.yaml
    const policy_default_yaml = Config.getDefPolicy()
    const policy_yaml = Config.getPolicy()
    for (const key in policy_default_yaml) {
      if (!(key in policy_yaml)) {
        policy_yaml[key] = policy_default_yaml[key]
      }
    }
    for (const key in policy_yaml) {
      if (!(key in policy_default_yaml)) {
        delete policy_yaml[key]
      }
    }
    Config.setPolicy(policy_yaml)
  }
}

export default new Init()
