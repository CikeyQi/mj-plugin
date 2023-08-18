import axios from 'axios'
import Log from '../../utils/logs.js'
import Config from '../../components/config/config.js'

/**
 * 指定ID获取任务
 * @param {string} id 任务ID
 * @returns
 */
export async function fetch (id) {
  const baseAPI = Config.getAPI()
  if (!baseAPI) {
    Log.e('未配置Midjourney API')
    return false
  }
  const configs = Config.getSetting()
  return await axios.get(
    baseAPI + `/mj/task/${id}/fetch`,
    configs.proxy.switch && configs.proxy.host && configs.proxy.port
      ? {
          proxy: {
            protocol: 'http',
            host: `${configs.proxy.host}`,
            port: `${Number(configs.proxy.port)}`
          }
        }
      : undefined
  )
}
