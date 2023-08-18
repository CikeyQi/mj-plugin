import axios from 'axios'
import Log from '../../utils/logs.js'
import Config from '../../components/config/config.js'

/**
 * 查询任务队列
 * @returns
 */
export async function queue () {
  const baseAPI = Config.getAPI()
  if (!baseAPI) {
    Log.e('未配置Midjourney API')
    return false
  }
  const configs = Config.getSetting()
  return await axios.get(baseAPI + '/mj/task/queue',
    configs.proxy.switch && configs.proxy.host && configs.proxy.port
      ? {
        proxy:
        {
          protocol: 'http',
          host: `${configs.proxy.host}`,
          port: `${Number(configs.proxy.port)}`
        }
      }
      : undefined)
}
