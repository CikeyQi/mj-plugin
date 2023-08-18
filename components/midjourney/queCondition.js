import axios from 'axios'
import Log from '../../utils/logs.js'
import Config from '../../components/config/config.js'

/**
 * 根据条件查询任务
 * @param {object} params conditionDTO
 * @param {array} params.ids
 * @returns
 */
export async function listByCondition (params) {
  const baseAPI = Config.getAPI()
  if (!baseAPI) {
    Log.e('未配置Midjourney API')
    return false
  }
  const configs = Config.getSetting()
  return await axios.post(baseAPI + '/mj/task/list-by-condition', params,
    configs.proxy.switch && configs.proxy.host && configs.proxy.port
      ? {
        proxy: {
          protocol: 'http',
          host: `${configs.proxy.host}`,
          port: `${Number(configs.proxy.port)}`
        }
      }
      : undefined)
}
