import YAML from 'yaml'
import fs from 'fs'
import { pluginRoot } from '../../model/path.js'
import Log from '../../utils/logs.js'

class Config {
  getAPI () {
    try {
      const setting_data = this.getSetting()
      return setting_data.midjourney_proxy_api
    } catch (err) {
      Log.e('读取midjourney_proxy_api失败', err)
      return false
    }
  }

  getSetting () {
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

  getDefSetting () {
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

  setSetting (setting_data) {
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
}

export default new Config()
