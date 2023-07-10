import fs from 'fs'
import Config from '../components/config/config.js'
import { pluginRoot } from '../model/path.js'
import Log from '../utils/logs.js'

class Init {
    constructor() {
        this.initSetting()
        // this.initPares()
        // this.initPolicy()
        // this.initPreset()
    }

    initSetting() {
        // 判断config/setting_default.yaml是否存在
        let setting_default_path = `${pluginRoot}/config/setting_default.yaml`
        if (!fs.existsSync(setting_default_path)) {
            Log.e('默认设置文件不存在，请检查或重新安装插件')
            return true
        }
        // 判断config/config/setting.yaml是否存在
        let setting_path = `${pluginRoot}/config/config/setting.yaml`
        if (!fs.existsSync(setting_path)) {
            Log.e('设置文件不存在，将使用默认设置文件')
            fs.copyFileSync(setting_default_path, setting_path)
        }
        // 同步setting.yaml和setting_default.yaml
        let setting_default_yaml = Config.getDefSetting()
        let setting_yaml = Config.getSetting()
        for (let key in setting_default_yaml) {
            if (!(key in setting_yaml)) {
                setting_yaml[key] = setting_default_yaml[key]
            }
        }
        for (let key in setting_yaml) {
            if (!(key in setting_default_yaml)) {
                delete setting_yaml[key]
            }
        }
        Config.setSetting(setting_yaml)
    }
}

export default new Init