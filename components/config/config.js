import YAML from 'yaml'
import fs from 'fs'
import { pluginRoot } from '../../model/path.js'
import Log from '../../utils/logs.js'

class Config {
  getAPI() {
    try {
      const setting_data = this.getSetting()
      return setting_data.midjourney_proxy_api
    } catch (err) {
      Log.e('读取midjourney_proxy_api失败', err)
      return false
    }
  }

  getSetting() {
    try {
      const setting_yaml = YAML.parse(
        fs.readFileSync(`${pluginRoot}/config/config/setting.yaml`, 'utf-8')
      )
      return setting_yaml
    } catch (err) {
      Log.e('读取setting.yaml失败', err)
      return false
    }
  }

  getDefSetting() {
    try {
      const setting_default_yaml = YAML.parse(
        fs.readFileSync(`${pluginRoot}/config/setting_default.yaml`, 'utf-8')
      )
      return setting_default_yaml
    } catch (err) {
      Log.e('读取setting_default.yaml失败', err)
      return false
    }
  }

  setSetting(setting_data) {
    try {
      fs.writeFileSync(
        `${pluginRoot}/config/config/setting.yaml`,
        YAML.stringify(setting_data)
      )
      return true
    } catch (err) {
      Log.e('写入setting.yaml失败', err)
      return false
    }
  }

  getPolicy() {
    try {
      const policy_yaml = YAML.parse(
        fs.readFileSync(`${pluginRoot}/config/config/policy.yaml`, 'utf-8')
      )
      return policy_yaml
    } catch (err) {
      Log.e('读取policy.yaml失败', err)
      return false
    }
  }

  getDefPolicy() {
    try {
      const policy_default_yaml = YAML.parse(
        fs.readFileSync(`${pluginRoot}/config/policy_default.yaml`, 'utf-8')
      )
      return policy_default_yaml
    } catch (err) {
      Log.e('读取policy_default.yaml失败', err)
      return false
    }
  }

  setPolicy(policy_data) {
    try {
      fs.writeFileSync(
        `${pluginRoot}/config/config/policy.yaml`, YAML.stringify(policy_data)
      )
      return true
    } catch (err) {
      Log.e('写入policy.yaml失败', err)
      return false
    }
  }

  /** 
   * @param {number} 群号
   * @returns {object} 群聊策略
   */
  getGroupPolicy(groupID) {
    let policy = this.getPolicy()
    let currentGroupPolicy = {}
    for (let key in policy.group_property['global']) {
      currentGroupPolicy[key] = policy.group_property[groupID][key] || policy.group_property['global'][key]
    }
    return currentGroupPolicy
  }
}

export default new Config()
